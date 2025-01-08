import angular from 'angular'
import 'rxjs/add/observable/throw'

import displayAddressComponent from 'common/components/display-address/display-address.component'
import checkoutErrorMessages from 'app/checkout/checkout-error-messages/checkout-error-messages.component'
import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component'

import commonService from 'common/services/api/common.service'
import cartService from 'common/services/api/cart.service'
import orderService from 'common/services/api/order.service'
import profileService from 'common/services/api/profile.service'
import { SignInEvent } from 'common/services/session/session.service'
import capitalizeFilter from 'common/filters/capitalize.filter'
import desigSrcDirective from 'common/directives/desigSrc.directive'
import { startDate } from 'common/services/giftHelpers/giftDates.service'
import analyticsFactory from 'app/analytics/analytics.factory'
import template from './step-3.tpl.html'
import recaptchaComponent from 'common/components/Recaptcha/RecaptchaWrapper'
import { submitOrderEvent } from 'app/checkout/cart-summary/cart-summary.component'

const componentName = 'checkoutStep3'

class Step3Controller {
  /* @ngInject */
  constructor (orderService, $window, $rootScope, $scope, $log, analyticsFactory, cartService, commonService, profileService, envService) {
    this.orderService = orderService
    this.$window = $window
    this.$rootScope = $rootScope
    this.$scope = $scope
    this.$log = $log
    this.analyticsFactory = analyticsFactory
    this.profileService = profileService
    this.cartService = cartService
    this.commonService = commonService
    this.startDate = startDate
    this.sessionStorage = $window.sessionStorage
    this.selfReference = this
    this.isBranded = envService.read('isBrandedCheckout')

    this.$scope.$on(SignInEvent, () => {
      this.$onInit()
    })

    this.$rootScope.$on(submitOrderEvent, () => {
      this.submitOrder()
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

  submitOrder () {
    this.orderService.submitOrder(this).subscribe(() => {
      if (!this.isBranded) {
        // Branded checkout submits its purchase analytics event on the thank you page
        this.analyticsFactory.purchase(this.donorDetails, this.cartData, this.orderService.retrieveCoverFeeDecision())
      }
      this.changeStep({ newStep: 'thankYou' })
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
    recaptchaComponent.name,
    checkoutErrorMessages.name
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
      radioStationName: '<',
      premiumName: '<',
      brandedCheckoutItem: '<'
    }
  })
