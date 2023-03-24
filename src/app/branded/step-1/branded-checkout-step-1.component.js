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

    this.premiumSelected = false
  }

  initItemConfig () {
    this.itemConfig = {}
    this.itemConfig['campaign-code'] = this.campaignCode
    if (this.itemConfig['campaign-code'] &&
      (this.itemConfig['campaign-code'].match(/^[a-z0-9]+$/i) === null || this.itemConfig['campaign-code'].length > 30)) {
      this.itemConfig['campaign-code'] = ''
    }
    this.itemConfig['campaign-page'] = this.campaignPage
    this.itemConfig.amount = this.amount

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
    this.itemConfig['recurring-day-of-month'] = this.day
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

  onSelectPremiumOption () {
    if (this.premiumSelected) {
      this.itemConfig['premium-code'] = this.premiumCode
    } else {
      this.itemConfig['premium-code'] = undefined
    }
  }

  checkSuccessfulSubmission () {
    if (every(this.submission, 'completed')) {
      if (every(this.submission, { error: false })) {
        this.next()
      } else {
        this.submitted = false
      }
    }
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
      premiumCode: '<',
      premiumName: '<',
      premiumImageUrl: '<',
      radioStationApiUrl: '<',
      radioStationRadius: '<',
      itemConfig: '=',
      hideSpouseDetails: '<',
      hideAnnual: '<',
      hideQuarterly: '<'
    }
  })
