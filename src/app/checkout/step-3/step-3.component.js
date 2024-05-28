import angular from 'angular'
import isString from 'lodash/isString'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/throw'
import commonService from 'common/services/api/common.service'
import cartService from 'common/services/api/cart.service'
import orderService from 'common/services/api/order.service'
import profileService from 'common/services/api/profile.service'
import sessionService, { SignInEvent } from 'common/services/session/session.service'
import capitalizeFilter from 'common/filters/capitalize.filter'
import desigSrcDirective from 'common/directives/desigSrc.directive'
import { startDate } from 'common/services/giftHelpers/giftDates.service'
import analyticsFactory from 'app/analytics/analytics.factory'
import { cartUpdatedEvent } from 'common/components/nav/navCart/navCart.component'
import displayAddressComponent from 'common/components/display-address/display-address.component'
import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component'
import template from './step-3.tpl.html'

const componentName = 'checkoutStep3'

class Step3Controller {
  /* @ngInject */
  constructor (orderService, $window, $scope, $log, analyticsFactory, cartService, commonService, profileService, sessionService) {
    this.orderService = orderService
    this.$window = $window
    this.$scope = $scope
    this.$log = $log
    this.analyticsFactory = analyticsFactory
    this.profileService = profileService
    this.cartService = cartService
    this.commonService = commonService
    this.startDate = startDate
    this.sessionStorage = $window.sessionStorage
    this.sessionService = sessionService

    this.$scope.$on(SignInEvent, () => {
      this.$onInit()
    })
  }

  $onInit () {
    this.loadDonorDetails()
    this.loadCurrentPayment()
    this.checkErrors()
    this.getNextDrawDate()
  }

  $onChanges (changes) {
    if (changes.submit && changes.submit.currentValue === true) {
      this.submitOrder()
    }
  }

  loadDonorDetails () {
    this.orderService.getDonorDetails()
      .subscribe((data) => {
        this.donorDetails = data
      },
      error => {
        this.$log.error('Error loading donorDetails', error)
      })
  }

  loadCurrentPayment () {
    this.loadingCurrentPayment = true
    this.orderService.getCurrentPayment()
      .subscribe((data) => {
        if (!data) {
          this.$log.error('Error loading current payment info: current payment doesn\'t seem to exist')
        } else if (data['account-type']) {
          this.bankAccountPaymentDetails = data
        } else if (data['card-type']) {
          this.creditCardPaymentDetails = data
        } else {
          this.$log.error('Error loading current payment info: current payment type is unknown')
        }
        this.loadingCurrentPayment = false
      },
      error => {
        this.loadingCurrentPayment = false
        this.$log.error('Error loading current payment info', error)
      })
  }

  checkErrors () {
    this.orderService.checkErrors()
      .subscribe((data) => {
        this.needinfoErrors = data
      },
      error => {
        this.$log.error('Error loading checkErrors', error)
      })
  }

  getNextDrawDate () {
    this.commonService.getNextDrawDate().subscribe(nextDrawDate => {
      this.nextDrawDate = nextDrawDate
    })
  }

  updateGiftStartMonth (item, month) {
    item.config.RECURRING_START_MONTH = month

    this.cartData = null
    this.cartService.editItem(item.uri, item.productUri, item.config).subscribe(() => {
      this.loadCart()
    })
  }

  canSubmitOrder () {
    let enableSubmitBtn = !!(this.cartData && this.donorDetails && (this.bankAccountPaymentDetails || this.creditCardPaymentDetails) && !this.needinfoErrors)
    enableSubmitBtn = enableSubmitBtn && !this.submittingOrder && this.submissionErrorStatus !== -1
    this.onSubmitBtnChangeState({
      $event: {
        enabled: enableSubmitBtn
      }
    })
    return enableSubmitBtn
  }

  saveDonorDataForRegistration () {
    if (this.donorDetails['registration-state'] !== 'COMPLETED') {
      const storeSessionData = {}
      storeSessionData.name = { ...this.donorDetails.name }
      storeSessionData.mailingAddress = { ...this.donorDetails.mailingAddress }
      storeSessionData['spouse-name'] = { ...this.donorDetails['spouse-name'] }
      storeSessionData['donor-type'] = this.donorDetails['donor-type']
      storeSessionData['organization-name'] = this.donorDetails['organization-name']
      storeSessionData['phone-number'] = this.donorDetails['phone-number']
      this.sessionService.updateCheckoutSavedData(storeSessionData)
    }
  }

  submitOrder () {
    delete this.submissionError
    delete this.submissionErrorStatus
    // Prevent multiple submissions
    if (this.submittingOrder) return
    this.submittingOrder = true
    this.onSubmittingOrder({ value: true })

    let submitRequest
    if (this.bankAccountPaymentDetails) {
      submitRequest = this.orderService.submit()
    } else if (this.creditCardPaymentDetails) {
      const cvv = this.orderService.retrieveCardSecurityCode()
      submitRequest = this.orderService.submit(cvv)
    } else {
      submitRequest = Observable.throw({ data: 'Current payment type is unknown' })
    }
    submitRequest.subscribe(() => {
      this.analyticsFactory.purchase(this.donorDetails, this.cartData, this.orderService.retrieveCoverFeeDecision())
      this.submittingOrder = false
      this.onSubmittingOrder({ value: false })
      this.orderService.clearCardSecurityCodes()
      this.orderService.clearCoverFees()
      this.onSubmitted()
      this.$scope.$emit(cartUpdatedEvent)
      this.saveDonorDataForRegistration()
      this.changeStep({ newStep: 'thankYou' })
    },
    error => {
      this.analyticsFactory.checkoutFieldError('submitOrder', 'failed')
      this.submittingOrder = false
      this.onSubmittingOrder({ value: false })

      this.loadCart()

      if (error.config && error.config.data && error.config.data['security-code']) {
        error.config.data['security-code'] = error.config.data['security-code'].replace(/./g, 'X') // Mask security-code
      }
      this.$log.error('Error submitting purchase:', error)
      this.onSubmitted()
      this.submissionErrorStatus = error.status
      this.submissionError = isString(error && error.data) ? (error && error.data).replace(/[:].*$/, '') : 'generic error' // Keep prefix before first colon for easier ng-switch matching
      this.$window.scrollTo(0, 0)
    })
  }
}

export default angular
  .module(componentName, [
    displayAddressComponent.name,
    displayRateTotals.name,
    orderService.name,
    capitalizeFilter.name,
    desigSrcDirective.name,
    profileService.name,
    analyticsFactory.name,
    cartService.name,
    commonService.name,
    sessionService.name
  ])
  .component(componentName, {
    controller: Step3Controller,
    templateUrl: template,
    bindings: {
      changeStep: '&',
      loadCart: '&',
      cartData: '<',
      submit: '<',
      onSubmitBtnChangeState: '&',
      onSubmitted: '&',
      onSubmittingOrder: '&',
      submittingOrder: '<',
      radioStationName: '<'
    }
  })
