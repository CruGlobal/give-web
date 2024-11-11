import angular from 'angular'
import every from 'lodash/every'

import productConfigForm from 'app/productConfig/productConfigForm/productConfigForm.component'
import contactInfo from 'common/components/contactInfo/contactInfo.component'
import checkoutStep2 from 'app/checkout/step-2/step-2.component'

import cartService from 'common/services/api/cart.service'
import orderService from 'common/services/api/order.service'
import brandedAnalyticsFactory from '../../branded/analytics/branded-analytics.factory'

import { FEE_DERIVATIVE } from 'common/components/paymentMethods/coverFees/coverFees.component'

import template from './branded-checkout-step-1.tpl.html'

const componentName = 'brandedCheckoutStep1'

class BrandedCheckoutStep1Controller {
  /* @ngInject */
  constructor ($log, $filter, brandedAnalyticsFactory, cartService, orderService) {
    this.$log = $log
    this.$filter = $filter
    this.brandedAnalyticsFactory = brandedAnalyticsFactory
    this.cartService = cartService
    this.orderService = orderService
  }

  $onInit () {
    this.resetSubmission()
    this.initItemConfig()
    this.initCart()
  }

  initItemConfig () {
    this.itemConfig = {}
    this.itemConfig.CAMPAIGN_CODE = this.campaignCode
    if (this.itemConfig.CAMPAIGN_CODE &&
      (this.itemConfig.CAMPAIGN_CODE.match(/^[a-z0-9]+$/i) === null || this.itemConfig.CAMPAIGN_CODE.length > 30)) {
      this.itemConfig.CAMPAIGN_CODE = ''
    }
    this.itemConfig['campaign-page'] = this.campaignPage
    this.itemConfig.AMOUNT = this.amount

    // These lines calculate the price with fees for amounts coming in from the client site via component config
    if (this.amount) {
      const amountWithFees = this.amount / FEE_DERIVATIVE
      this.itemConfig.priceWithFees = this.$filter('currency')(amountWithFees, '$', 2)
    }

    switch (this.frequency) {
      case 'monthly':
        this.defaultFrequency = 'MON'
        break
      case 'quarterly':
        this.defaultFrequency = 'QUARTERLY'
        break
      case 'annually':
        this.defaultFrequency = 'ANNUAL'
        break
    }
    this.itemConfig.RECURRING_DAY_OF_MONTH = this.day
    this.itemConfig.frequency = this.frequency
  }

  initCart () {
    this.loadingProductConfig = true
    this.errorLoadingProductConfig = false

    this.cartService.get().subscribe(data => {
      const item = data.items && data.items[0]
      if (item) { // Edit first item from user's cart if it exits
        this.isEdit = true
        this.item = item
        this.code = item.code
        this.itemConfig = item.config

        // add campaign page
        this.itemConfig['campaign-page'] = this.campaignPage
      }
      this.loadingProductConfig = false
    },
    error => {
      this.errorLoadingProductConfig = true
      this.loadingProductConfig = false
      this.$log.error('Error loading cart data for branded checkout step 1', error)
    })
  }

  submit () {
    this.resetSubmission()
    this.submitted = true
  }

  resetSubmission () {
    this.submission = {
      giftConfig: {
        completed: false,
        error: false
      },
      contactInfo: {
        completed: false,
        error: false
      },
      payment: {
        completed: false,
        error: false
      }
    }
  }

  onGiftConfigStateChange (state) {
    switch (state) {
      case 'submitted':
        this.submission.giftConfig.completed = true
        this.isEdit = true
        this.checkSuccessfulSubmission()
        break
      case 'errorSubmitting':
      case 'errorAlreadyInCart':
        this.submission.giftConfig.completed = true
        this.submission.giftConfig.error = true
        this.checkSuccessfulSubmission()
        break
    }
  }

  onContactInfoSubmit (success) {
    if (success) {
      this.submission.contactInfo.completed = true
      this.brandedAnalyticsFactory.saveDonorDetails(this.donorDetails)
    } else {
      this.submission.contactInfo.completed = true
      this.submission.contactInfo.error = true
    }
    this.checkSuccessfulSubmission()
  }

  onPaymentStateChange (state) {
    switch (state) {
      case 'submitted':
        this.submission.payment.completed = true
        this.checkSuccessfulSubmission()
        break
      case 'errorSubmitting':
      case 'unsubmitted':
        this.submission.payment.completed = true
        this.submission.payment.error = true
        this.checkSuccessfulSubmission()
        this.onPaymentFailed({ $event: { donorDetails: this.donorDetails } })
        break
    }
  }

  checkSuccessfulSubmission () {
    if (every(this.submission, 'completed')) {
      if (every(this.submission, { error: false })) {
        this.submitOrderInternal()
      } else {
        this.submitted = false
      }
    }
  }

  loadCart () {
    this.cartService.get()
      .finally(() => {
        this.loadingCartData = false
      })
      .subscribe((data) => {
        this.cartData = data
        this.analyticsFactory.buildProductVar(data)
      },
      (error) => {
        this.$log.error('Error loading cart', error)
      })
  }

  handleSubmit () {
    this.submitted = true
  }

  submitOrderInternal () {

    // Load cart here because it is updated now


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
      this.changeStep({ newStep: 'thankYou' })
    },
    error => {
      this.analyticsFactory.checkoutFieldError('submitOrder', 'failed')
      this.submittingOrder = false
      this.onSubmittingOrder({ value: false })

      // this.loadCart()

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
    productConfigForm.name,
    contactInfo.name,
    checkoutStep2.name,
    cartService.name,
    orderService.name,
    brandedAnalyticsFactory.name
  ])
  .component(componentName, {
    controller: BrandedCheckoutStep1Controller,
    templateUrl: template,
    bindings: {
      code: '<',
      campaignCode: '<',
      campaignPage: '<',
      amount: '<',
      frequency: '<',
      day: '<',
      donorDetails: '<',
      defaultPaymentType: '<',
      hidePaymentTypeOptions: '<',
      showCoverFees: '<',
      next: '&',
      onPaymentFailed: '&',
      radioStationApiUrl: '<',
      radioStationRadius: '<'
    }
  })
