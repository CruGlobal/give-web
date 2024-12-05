import angular from 'angular'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/operator/pluck'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import map from 'lodash/map'
import omit from 'lodash/omit'
import isString from 'lodash/isString'
import sortPaymentMethods from 'common/services/paymentHelpers/paymentMethodSort'
import extractPaymentAttributes from 'common/services/paymentHelpers/extractPaymentAttributes'
import { cartUpdatedEvent } from 'common/lib/cartEvents'

import cortexApiService from '../cortexApi.service'
import cartService from './cart.service'
import tsysService from './tsys.service'
import hateoasHelperService from 'common/services/hateoasHelper.service'
import sessionService, { Roles } from 'common/services/session/session.service'

import formatAddressForCortex from '../addressHelpers/formatAddressForCortex'
import formatAddressForTemplate from '../addressHelpers/formatAddressForTemplate'

import analyticsFactory from 'app/analytics/analytics.factory'

const serviceName = 'orderService'

class Order {
  /* @ngInject */
  constructor (cortexApiService, cartService, hateoasHelperService, sessionService, tsysService, analyticsFactory, $window, $log, $filter) {
    this.cortexApiService = cortexApiService
    this.cartService = cartService
    this.hateoasHelperService = hateoasHelperService
    this.sessionService = sessionService
    this.tsysService = tsysService
    this.analyticsFactory = analyticsFactory
    this.sessionStorage = $window.sessionStorage
    this.localStorage = $window.localStorage
    this.$window = $window
    this.$log = $log
    this.$filter = $filter
  }

  getDonorDetails () {
    return this.cortexApiService.get({
      path: ['carts', this.cortexApiService.scope, 'default'],
      zoom: {
        donorDetails: 'order:donordetails',
        email: 'order:emailinfo:email',
        emailForm: 'order:emailinfo:orderemailform'
      }
    })
      .map(data => {
        let donorDetails = { name: {}, mailingAddress: {} }
        if (data.donorDetails) {
          donorDetails = data.donorDetails
          donorDetails.mailingAddress = formatAddressForTemplate(donorDetails['mailing-address'].address)
          delete donorDetails['mailing-address']
        }

        // Default country to US
        if (!donorDetails.mailingAddress.country) {
          donorDetails.mailingAddress.country = 'US'
        }

        donorDetails.email = data.email && data.email.email
        donorDetails.emailFormUri = data.emailForm && data.emailForm.links[0].uri

        return donorDetails
      })
  }

  updateDonorDetails (details) {
    this.analyticsFactory.setDonorDetails(details)
    details = angular.copy(details)
    details['mailing-address'] = { address: formatAddressForCortex(details.mailingAddress) }
    delete details.mailingAddress

    return this.cortexApiService.put({
      path: details.self.uri,
      data: details
    })
  }

  addEmail (email, uri) {
    return this.cortexApiService.post({
      path: uri,
      data: { email: email }
    })
  }

  getPaymentMethodForms () {
    if (this.paymentMethodForms) {
      return Observable.of(this.paymentMethodForms)
    } else {
      return this.cortexApiService.get({
        path: ['carts', this.cortexApiService.scope, 'default'],
        zoom: {
          paymentMethodForms: 'order:paymentmethodinfo:element[],order:paymentmethodinfo:element:paymentinstrumentform'
        }
      })
        .do((data) => {
          this.paymentMethodForms = data

          angular.forEach(data.paymentMethodForms, paymentMethodForm => {
            if (!this.hateoasHelperService.getLink(paymentMethodForm.paymentinstrumentform, 'createpaymentinstrumentaction')) {
              this.$log.warn('Payment form request contains empty link', data)
            }
          })
        })
    }
  }

  addBankAccountPayment (paymentInfo, saveOnProfile) {
    return this.getPaymentMethodForms()
      .mergeMap((data) => {
        const link = this.determinePaymentMethodFormLink(data, 'bank-name')
        return this.cortexApiService.post({
          path: link,
          data: { 'payment-instrument-identification-form': paymentInfo, 'save-on-profile': saveOnProfile },
          followLocation: true
        })
      })
  }

  addCreditCardPayment (paymentInfo, saveOnProfile) {
    const cvv = paymentInfo.cvv
    paymentInfo = omit(paymentInfo, 'cvv')

    const dataToSend = {}

    if (paymentInfo.address) {
      dataToSend['billing-address'] = {
        name: {
          'family-name': 'na',
          'given-name': 'na'
        },
        address: formatAddressForCortex(paymentInfo.address)
      }
      paymentInfo.address = undefined
    }
    dataToSend['payment-instrument-identification-form'] = paymentInfo
    dataToSend['save-on-profile'] = saveOnProfile

    return this.getPaymentMethodForms()
      .mergeMap((data) => {
        const link = this.determinePaymentMethodFormLink(data, 'card-number')
        return this.cortexApiService.post({
          path: link,
          data: dataToSend,
          followLocation: true
        }).do(creditCard => {
          this.storeCardSecurityCode(cvv, creditCard.self.uri)
        })
      })
  }

  determinePaymentMethodFormLink (data, fieldName) {
    let link = ''
    angular.forEach(data.paymentMethodForms, paymentMethodForm => {
      if (paymentMethodForm.paymentinstrumentform['payment-instrument-identification-form'][fieldName] !== undefined) {
        link = this.hateoasHelperService.getLink(paymentMethodForm.paymentinstrumentform, 'createpaymentinstrumentaction')
      }
    })
    return link
  }

  addPaymentMethod (paymentInfo) {
    const role = this.sessionService.getRole()
    let saveOnProfile = false
    if (Roles.registered === role) {
      saveOnProfile = true
    }
    if (paymentInfo.bankAccount) {
      return this.addBankAccountPayment(paymentInfo.bankAccount, saveOnProfile)
    } else if (paymentInfo.creditCard) {
      return this.addCreditCardPayment(paymentInfo.creditCard, saveOnProfile)
    } else {
      return Observable.throw('Error adding payment method. The data passed to orderService.addPaymentMethod did not contain bankAccount or creditCard data')
    }
  }

  updatePaymentMethod (paymentMethod, paymentInfo) {
    // Only supports updating credit cards here
    paymentInfo = paymentInfo.creditCard

    if (paymentInfo.address) {
      paymentInfo.address = formatAddressForCortex(paymentInfo.address)
    }

    let dataToSubmit = { ...paymentInfo, ...paymentInfo.address }
    dataToSubmit = omit(dataToSubmit, ['cvv', 'address'])
    dataToSubmit = { 'payment-instrument-identification-attributes': dataToSubmit }

    if (paymentMethod.self.type === 'paymentinstruments.order-payment-instrument') {
      return this.updatePaymentMethodInCortex(paymentMethod.self.uri, dataToSubmit, paymentInfo.cvv, paymentMethod)
    }

    return this.selectPaymentMethod(paymentMethod.selectAction)
      .mergeMap(() => {
        return this.cortexApiService.get({
          path: ['carts', this.cortexApiService.scope, 'default'],
          zoom: {
            chosen: 'order:paymentinstrumentselector:chosen,order:paymentinstrumentselector:chosen:description'
          }
        })
      })
      .mergeMap(data => {
        const uri = data.chosen ? data.chosen.description.self.uri : paymentMethod.self.uri
        return this.updatePaymentMethodInCortex(uri, dataToSubmit, paymentInfo.cvv, paymentMethod)
      })
  }

  updatePaymentMethodInCortex (uri, dataToSubmit, cvv, paymentMethod) {
    return this.cortexApiService.put({
      path: uri,
      data: dataToSubmit
    })
      .do(() => {
        this.storeCardSecurityCode(cvv, paymentMethod.self.uri)
      })
  }

  getExistingPaymentMethods () {
    return this.cortexApiService.get({
      path: ['carts', this.cortexApiService.scope, 'default'],
      zoom: {
        choices: 'order:paymentinstrumentselector:choice[],order:paymentinstrumentselector:choice:description',
        chosen: 'order:paymentinstrumentselector:chosen,order:paymentinstrumentselector:chosen:description'
      }
    })
      .map(selector => {
        const paymentMethods = selector.choices || []
        if (selector.chosen) {
          selector.chosen.description.chosen = true
          paymentMethods.unshift(selector.chosen)
        }
        return map(paymentMethods, paymentMethod => {
          paymentMethod.description.selectAction = paymentMethod.self.uri
          if (paymentMethod.description['payment-instrument-identification-attributes']['street-address']) {
            paymentMethod.description.address =
              formatAddressForTemplate(paymentMethod.description['payment-instrument-identification-attributes'])
          }
          return extractPaymentAttributes(paymentMethod.description)
        })
      })
      .map(paymentMethods => {
        return sortPaymentMethods(paymentMethods)
      })
  }

  selectPaymentMethod (uri) {
    return this.cortexApiService.post({
      path: uri,
      data: {}
    })
  }

  getCurrentPayment () {
    return this.cortexApiService.get({
      path: ['carts', this.cortexApiService.scope, 'default'],
      zoom: {
        paymentMethod: 'order:paymentinstrumentselector:chosen:description'
      }
    })
      .pluck('paymentMethod')
      .map(data => {
        if (data && data['payment-instrument-identification-attributes']['street-address']) {
          data.address = formatAddressForTemplate(data['payment-instrument-identification-attributes'])
        }
        return extractPaymentAttributes(data)
      })
  }

  getPurchaseForm () {
    return this.cortexApiService.get({
      path: ['carts', this.cortexApiService.scope, 'default'],
      zoom: {
        enhancedpurchaseform: 'order:enhancedpurchaseform'
      },
      cache: true
    })
  }

  checkErrors () {
    return this.cortexApiService.get({
      path: ['carts', this.cortexApiService.scope, 'default'],
      zoom: {
        order: 'order'
      }
    })
      .map((data) => {
        const messages = data.order?.messages
        const messageIds = map(messages, 'id')
        return (messageIds && messageIds.length) ? ({ messageIds: messageIds, messages: messages }) : undefined
      })
      .do(entry => {
        entry?.messageIds && this.$log.error(
          'The user was presented with these `needinfo` errors. They should have been caught earlier in the checkout process.',
          entry.messages.map(message => message['debug-message'])
        )
      })
      .map(entry => entry?.messageIds)
  }

  submit (cvv) {
    return this.getPurchaseForm()
      .mergeMap((data) => {
        const postData = cvv ? { 'security-code': cvv } : {}
        postData['cover-cc-fees'] = !!this.retrieveCoverFeeDecision()
        postData['radio-call-letters'] = this.retrieveRadioStationCallLetters()
        postData['tsys-device'] = this.tsysService.getDevice()
        postData['recaptcha-token'] = this.sessionStorage.getItem('recaptchaToken')
        postData['recaptcha-action'] = this.sessionStorage.getItem('recaptchaAction')
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.enhancedpurchaseform, 'submitenhancedpurchaseaction'),
          data: postData,
          followLocation: true
        })
      })
      .do((data) => {
        this.storeLastPurchaseLink(data.self.uri)
        this.cartService.setCartCountCookie(0)
        this.sessionStorage.removeItem('recaptchaToken')
        this.sessionStorage.removeItem('recaptchaAction')
      })
  }

  storeCardSecurityCode (cvv, uri) {
    const storedCvvs = this.retrieveCardSecurityCodes()
    if (!cvv) {
      cvv = storedCvvs[uri] // Try looking up previously stored CVV by payment method uri
    } else {
      // Save new cvv in list of stored CVVs
      storedCvvs[uri] = cvv
      this.sessionStorage.setItem('storedCvvs', angular.toJson(storedCvvs))
    }

    if (cvv) {
      this.sessionStorage.setItem('cvv', cvv)
    } else {
      this.sessionStorage.removeItem('cvv')
    }
  }

  retrieveCardSecurityCode () {
    return this.sessionStorage.getItem('cvv')
  }

  retrieveCardSecurityCodes () {
    const storedCvvs = this.sessionStorage.getItem('storedCvvs')
    return storedCvvs && angular.fromJson(storedCvvs) || {} /* eslint-disable-line no-mixed-operators */
  }

  clearCardSecurityCodes () {
    this.sessionStorage.removeItem('cvv')
    this.sessionStorage.removeItem('storedCvvs')
  }

  storeCoverFeeDecision (coverFees) {
    this.localStorage.setItem('coverFees', angular.toJson(coverFees))
  }

  retrieveCoverFeeDecision () {
    return angular.fromJson(this.localStorage.getItem('coverFees'))
  }

  clearCoverFees () {
    this.localStorage.removeItem('coverFees')
  }

  storeLastPurchaseLink (link) {
    this.sessionStorage.setItem('lastPurchaseLink', link)
  }

  retrieveLastPurchaseLink () {
    return this.sessionStorage.getItem('lastPurchaseLink')
  }

  storeRadioStationData (radioStationData) {
    this.sessionStorage.setItem('radioStationName', radioStationData.Description)
    this.sessionStorage.setItem('radioStationCallLetters', radioStationData.MediaId)
  }

  retrieveRadioStationName () {
    return this.sessionStorage.getItem('radioStationName')
  }

  retrieveRadioStationCallLetters () {
    return this.sessionStorage.getItem('radioStationCallLetters')
  }

  spouseEditableForOrder (donorDetails) {
    if (donorDetails.staff) return false
    const currentOrder = this.hateoasHelperService.getLink(donorDetails, 'order')
    const storedOrder = this.localStorage.getItem('currentOrder')
    const hasSpouse = !!donorDetails['spouse-name']['given-name'] || !!donorDetails['spouse-name']['family-name']
    const startedOrderWithoutSpouse = angular.fromJson(this.localStorage.getItem('startedOrderWithoutSpouse'))

    if (currentOrder !== storedOrder || startedOrderWithoutSpouse === null) {
      this.localStorage.setItem('currentOrder', currentOrder)
      this.localStorage.setItem('startedOrderWithoutSpouse', angular.toJson(!hasSpouse))
      return !hasSpouse
    } else {
      return startedOrderWithoutSpouse
    }
  }

  submitOrder (controller) {
    delete controller.submissionError
    delete controller.submissionErrorStatus
    // Prevent multiple submissions
    if (controller.submittingOrder) return Observable.empty()
    controller.submittingOrder = true
    controller.onSubmittingOrder({ value: true })

    let submitRequest
    if (controller.bankAccountPaymentDetails) {
      submitRequest = this.submit()
    } else if (controller.creditCardPaymentDetails) {
      const cvv = this.retrieveCardSecurityCode()
      submitRequest = this.submit(cvv)
    } else {
      submitRequest = Observable.throw({ data: 'Current payment type is unknown' })
    }
    return submitRequest
      .do(() => {
        controller.submittingOrder = false
        controller.onSubmittingOrder({ value: false })
        this.clearCardSecurityCodes()
        this.clearCoverFees()
        controller.onSubmitted()
        controller.$scope.$emit(cartUpdatedEvent)
      })
      .catch((error) => {
      // Handle the error side effects when the observable errors
        this.analyticsFactory.checkoutFieldError('submitOrder', 'failed')
        controller.submittingOrder = false
        controller.onSubmittingOrder({ value: false })

        controller.loadCart()

        if (error.config && error.config.data && error.config.data['security-code']) {
          error.config.data['security-code'] = error.config.data['security-code'].replace(/./g, 'X') // Mask security-code
        }
        this.$log.error('Error submitting purchase:', error)
        controller.onSubmitted()
        controller.submissionErrorStatus = error.status
        controller.submissionError = isString(error && error.data) ? (error && error.data).replace(/[:].*$/, '') : 'generic error' // Keep prefix before first colon for easier ng-switch matching
        this.$window.scrollTo(0, 0)

        return Observable.throw(error) // Return the error as an observable
      })
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    cartService.name,
    hateoasHelperService.name,
    sessionService.name,
    tsysService.name,
    analyticsFactory.name
  ])
  .service(serviceName, Order)
