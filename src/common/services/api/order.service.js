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
import round from 'lodash/round'
import sortPaymentMethods from 'common/services/paymentHelpers/paymentMethodSort'

import cortexApiService from '../cortexApi.service'
import cartService from './cart.service'
import hateoasHelperService from 'common/services/hateoasHelper.service'

import formatAddressForCortex from '../addressHelpers/formatAddressForCortex'
import formatAddressForTemplate from '../addressHelpers/formatAddressForTemplate'

import analyticsFactory from 'app/analytics/analytics.factory'
import moment from 'moment'

const serviceName = 'orderService'

class Order {
  /* @ngInject */
  constructor (cortexApiService, cartService, hateoasHelperService, analyticsFactory, $window, $log, $filter) {
    this.cortexApiService = cortexApiService
    this.cartService = cartService
    this.hateoasHelperService = hateoasHelperService
    this.analyticsFactory = analyticsFactory
    this.sessionStorage = $window.sessionStorage
    this.localStorage = $window.localStorage
    this.$log = $log
    this.$filter = $filter
    this.FEE_DERIVATIVE = 0.9765 // 2.35% processing fee (calculated by 1 - 0.0235)
  }

  getDonorDetails () {
    return this.cortexApiService.get({
      path: ['carts', this.cortexApiService.scope, 'default'],
      zoom: {
        donorDetails: 'order:donordetails',
        email: 'order:emailinfo:email',
        emailForm: 'order:emailinfo:emailform'
      }
    })
      .map(data => {
        let donorDetails = { name: {}, mailingAddress: {} }
        if (data.donorDetails) {
          donorDetails = data.donorDetails
          donorDetails.mailingAddress = formatAddressForTemplate(donorDetails['mailing-address'])
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
    details['mailing-address'] = formatAddressForCortex(details.mailingAddress)
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
          bankAccount: 'order:paymentmethodinfo:bankaccountform',
          creditCard: 'order:paymentmethodinfo:creditcardform'
        }
      })
        .do((data) => {
          this.paymentMethodForms = data

          if (!this.hateoasHelperService.getLink(data.bankAccount, 'createbankaccountfororderaction') || !this.hateoasHelperService.getLink(data.creditCard, 'createcreditcardfororderaction')) {
            this.$log.warn('Payment form request contains empty link', data)
          }
        })
    }
  }

  addBankAccountPayment (paymentInfo) {
    return this.getPaymentMethodForms()
      .mergeMap((data) => {
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.bankAccount, 'createbankaccountfororderaction'),
          data: paymentInfo,
          followLocation: true
        })
      })
  }

  addCreditCardPayment (paymentInfo) {
    const cvv = paymentInfo.cvv
    paymentInfo = omit(paymentInfo, 'cvv')
    if (paymentInfo.address) {
      paymentInfo.address = formatAddressForCortex(paymentInfo.address)
    }
    return this.getPaymentMethodForms()
      .mergeMap((data) => {
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.creditCard, 'createcreditcardfororderaction'),
          data: paymentInfo,
          followLocation: true
        }).do(creditCard => {
          this.storeCardSecurityCode(cvv, creditCard.self.uri)
        })
      })
  }

  addPaymentMethod (paymentInfo) {
    if (paymentInfo.bankAccount) {
      return this.addBankAccountPayment(paymentInfo.bankAccount)
    } else if (paymentInfo.creditCard) {
      return this.addCreditCardPayment(paymentInfo.creditCard)
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

    return this.selectPaymentMethod(paymentMethod.selectAction)
      .mergeMap(() => {
        return this.cortexApiService.get({
          path: ['carts', this.cortexApiService.scope, 'default'],
          zoom: {
            updateForm: 'order:paymentmethodinfo:creditcardupdateform'
          }
        })
      })
      .mergeMap(data => {
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.updateForm, 'updatecreditcardfororderaction'),
          data: omit(paymentInfo, 'cvv')
        })
          .do(() => {
            this.storeCardSecurityCode(paymentInfo.cvv, paymentMethod.self.uri)
          })
      })
  }

  getExistingPaymentMethods () {
    return this.cortexApiService.get({
      path: ['carts', this.cortexApiService.scope, 'default'],
      zoom: {
        choices: 'order:paymentmethodinfo:selector:choice[],order:paymentmethodinfo:selector:choice:description',
        chosen: 'order:paymentmethodinfo:selector:chosen,order:paymentmethodinfo:selector:chosen:description'
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
          if (paymentMethod.description.address) {
            paymentMethod.description.address = formatAddressForTemplate(paymentMethod.description.address)
          }
          return paymentMethod.description
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
        paymentMethod: 'order:paymentmethodinfo:paymentmethod'
      }
    })
      .pluck('paymentMethod')
      .map(data => {
        if (data && data.address) {
          data.address = formatAddressForTemplate(data.address)
        }
        return data
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
        needInfo: 'order:needinfo[]'
      }
    })
      .map((data) => {
        const needInfo = data.needInfo
        const errors = map(needInfo, 'name')
        return (errors && errors.length > 0) ? errors : undefined
      })
      .do((errors) => {
        errors && this.$log.error('The user was presented with these `needinfo` errors. They should have been caught earlier in the checkout process.', errors)
      })
  }

  submit (cvv) {
    return this.getPurchaseForm()
      .mergeMap((data) => {
        const postData = cvv ? { 'security-code': cvv } : {}
        postData['cover-cc-fees'] = !!this.retrieveCoverFeeDecision()
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.enhancedpurchaseform, 'createenhancedpurchaseaction'),
          data: postData,
          followLocation: true
        })
      })
      .do((data) => {
        this.storeLastPurchaseLink(data.self.uri)
        this.cartService.setCartCountCookie(0)
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

  storeFeesApplied (feesApplied) {
    this.localStorage.setItem('feesApplied', angular.toJson(feesApplied))
  }

  retrieveFeesApplied () {
    return angular.fromJson(this.localStorage.getItem('feesApplied'))
  }

  clearCoverFees () {
    this.localStorage.removeItem('coverFees')
    this.localStorage.removeItem('feesApplied')
  }

  storeCartData (cartData) {
    this.localStorage.setItem('cartData', angular.toJson(cartData))
  }

  retrieveCartData () {
    const cartData = angular.fromJson(this.localStorage.getItem('cartData'))
    if (cartData) {
      this.turnDateStringsToDates(cartData)
    }
    return cartData
  }

  turnDateStringsToDates (cartData) {
    cartData.items.map(item => {
      if (item.frequency !== 'Single') {
        item.giftStartDate = moment.utc(item.giftStartDate)
      }
    })
  }

  addItemToCartData (item) {
    const cartData = this.retrieveCartData()
    cartData.items.push(item)
    this.storeCartData(cartData)
  }

  clearCartData () {
    this.localStorage.removeItem('cartData')
  }

  storeLastPurchaseLink (link) {
    this.sessionStorage.setItem('lastPurchaseLink', link)
  }

  retrieveLastPurchaseLink () {
    return this.sessionStorage.getItem('lastPurchaseLink')
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

  calculatePricesWithFees (feesApplied, cartItems) {
    angular.forEach(cartItems, (item) => {
      if (feesApplied) {
        item.amountWithFee = item.amount
      } else {
        item.amountWithFee = round(this.calculateAmountWithFees(item.amount), 2)
      }
    })
    return true
  }

  calculateAmountWithFees (originalAmount) {
    originalAmount = parseFloat(originalAmount)
    return originalAmount / this.FEE_DERIVATIVE
  }

  updatePrices (cartData) {
    this.storeCoverFeeDecision(cartData.coverFees)

    cartData.cartTotal = cartData.items.reduce((total, item) => total + this.updatePrice(item, cartData.coverFees), 0)
    this.recalculateFrequencyTotals(cartData)
    this.storeCartData(cartData)
  }

  updatePrice (item, coverFees) {
    let newAmount
    if (coverFees) {
      newAmount = item.amountWithFee
    } else {
      if (parseFloat(item.amount) === parseFloat(item.amountWithFee)) {
        newAmount = this.calculateAmountWithoutFees(item.amount)
      } else {
        newAmount = item.amount
      }
    }

    item.amount = round(parseFloat(newAmount), 2)
    item.price = `$${this.$filter('number')(newAmount, 2)}`
    return item.amount
  }

  recalculateFrequencyTotals (cartData) {
    angular.forEach(cartData.frequencyTotals, rateTotal => {
      rateTotal.total = '$0.00'
      rateTotal.amount = 0
    })

    angular.forEach(cartData.items, item => {
      angular.forEach(cartData.frequencyTotals, rateTotal => {
        if (item.frequency === rateTotal.frequency) {
          rateTotal.amount += item.amount
          rateTotal.total = `$${this.$filter('number')(rateTotal.amount, 2)}`
        }
      })
    })
  }

  calculatePriceWithoutFees (originalAmount) {
    const newAmount = this.calculateAmountWithoutFees(originalAmount)
    return this.$filter('number')(newAmount, 2)
  }

  calculateAmountWithoutFees (originalAmount) {
    originalAmount = parseFloat(originalAmount)
    return originalAmount * this.FEE_DERIVATIVE
  }

  addFeesToNewGiftIfNecessary (data) {
    if (this.retrieveCoverFeeDecision()) {
      // We should only ever get here if the user has already decided to add fees, but then added a new gift
      data.coverFees = true
      this.storeFeesApplied(true)
      this.calculatePricesWithFees(false, data.items)
      this.updatePrices(data)
    }
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    cartService.name,
    hateoasHelperService.name,
    analyticsFactory.name
  ])
  .service(serviceName, Order)
