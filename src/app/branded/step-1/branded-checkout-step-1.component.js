import angular from 'angular'
import every from 'lodash/every'

import productConfigForm from 'app/productConfig/productConfigForm/productConfigForm.component'
import contactInfo from 'common/components/contactInfo/contactInfo.component'
import checkoutStep2 from 'app/checkout/step-2/step-2.component'

import cartService from 'common/services/api/cart.service'
import orderService from 'common/services/api/order.service'
import brandedAnalyticsFactory from '../../branded/analytics/branded-analytics.factory'
import { cartUpdatedEvent } from 'common/components/nav/navCart/navCart.component'
import { FEE_DERIVATIVE } from 'common/components/paymentMethods/coverFees/coverFees.component'

import template from './branded-checkout-step-1.tpl.html'
import { Observable } from 'rxjs'
import { tap, catchError, mergeMap } from 'rxjs/operators'

const componentName = 'brandedCheckoutStep1'

class BrandedCheckoutStep1Controller {
  /* @ngInject */
  constructor ($scope, $log, $filter, brandedAnalyticsFactory, cartService, orderService) {
    this.$scope = $scope
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
    if (this.useV3 === 'true') {
      this.$scope.$digest()
    }
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
        if (this.useV3 === 'true') {
          this.submitOrderInternal()
        } else {
          this.next()
        }
      } else {
        this.submitted = false
      }
    }
  }

  loadCart () {
    this.errorLoadingCart = false

    // Return the observable instead of subscribing here
    return this.cartService.get().pipe(
      tap(data => {
        // Setting cart data and analytics
        this.cartData = data
        this.brandedAnalyticsFactory.saveCoverFees(this.orderService.retrieveCoverFeeDecision())
        this.brandedAnalyticsFactory.saveItem(this.cartData.items[0])
        this.brandedAnalyticsFactory.addPaymentInfo()
        this.brandedAnalyticsFactory.reviewOrder()
        console.log('done loading cart')
      }),
      catchError(error => {
        // Handle errors by setting flag and logging the error
        this.errorLoadingCart = true
        this.$log.error('Error loading cart data for branded checkout step 2', error)
        return Observable.throw(error) // Rethrow the error so the observable chain can handle it
      })
    )
  }

  loadCurrentPayment () {
    this.loadingCurrentPayment = true

    return this.orderService.getCurrentPayment().pipe(
      tap(data => {
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
      }),
      catchError(error => {
        this.loadingCurrentPayment = false
        this.$log.error('Error loading current payment info', error)
        return Observable.throw(error) // Propagate error
      })
    )
  }

  checkErrors () {
    // Then check for errors on the API
    return this.orderService.checkErrors().do(
      (data) => {
        this.needinfoErrors = data
        console.log('checking errors')
      })
      .catch(error => {
        this.$log.error('Error loading checkErrors', error)
        return Observable.throw(error)
      })
  }

  submitOrderInternal () {
    this.loadingAndSubmitting = true
    // Start by loading the cart
    this.loadCart()
      .mergeMap(() => {
        // After loadCart completes, call loadCurrentPayment
        console.log('loadCurrentPayment')
        return this.loadCurrentPayment()
      })
      .mergeMap(() => {
        // After loadCurrentPayment completes, call checkErrors
        console.log('checkErrors')
        return this.checkErrors()
      })
      .mergeMap(() => {
      // Clear previous submission errors
        delete this.submissionError
        delete this.submissionErrorStatus

        // Prevent multiple submissions
        if (this.submittingOrder) { return Observable.of(null) }

        this.radioStationName = this.orderService.retrieveRadioStationName()

        this.submittingOrder = true
        this.onSubmittingOrder({ value: true })

        let submitRequest
        if (this.bankAccountPaymentDetails) {
          submitRequest = this.orderService.submit()
        } else if (this.creditCardPaymentDetails) {
          const cvv = this.orderService.retrieveCardSecurityCode()
          submitRequest = this.orderService.submit(cvv)
        } else {
          return Observable.throw({ data: 'Current payment type is unknown' })
        }
        console.log('submitRequest', submitRequest)
        // Return the observable from the submit request to continue processing
        return submitRequest
      }).subscribe({
        next: () => {
        // If order submission was successful, process analytics and proceed to the next steps
          console.log('purchase')
          this.submittingOrder = false
          this.loadingAndSubmitting = false
          this.onSubmittingOrder({ value: false })
          this.orderService.clearCardSecurityCodes()
          this.orderService.clearCoverFees()
          this.onSubmitted()
          console.log('clearCardSecurityCodes')
          this.$scope.$emit(cartUpdatedEvent)
          console.log('cartUpdatedEvent')
          this.next()
        },
        error: (error) => {
        // Log the full error object for better understanding
          this.$log.error('Error submitting purchase:', error)

          // Check for specific error types
          if (error.data && error.data.includes('payment')) {
            this.submissionError = 'Payment details are invalid or missing.'
          } else if (error.status === 400) {
            this.submissionError = 'Bad request, please check your inputs.'
          } else {
            this.submissionError = 'An unknown error occurred during checkout.'
          }
          // Handle any errors that occur during either loadCart or submit
          this.brandedAnalyticsFactory.checkoutFieldError('submitOrder', 'failed')
          this.submittingOrder = false
          this.loadingAndSubmitting = false
          this.onSubmittingOrder({ value: false })

          if (error.config && error.config.data && error.config.data['security-code']) {
            error.config.data['security-code'] = error.config.data['security-code'].replace(/./g, 'X') // Mask security-code
          }
          this.$log.error('Error submitting purchase:', error)
          this.onSubmitted()
          this.submissionErrorStatus = error.status
          this.submissionError = isString(error && error.data) ? (error && error.data).replace(/[:].*$/, '') : 'generic error' // Keep prefix before first colon for easier ng-switch matching
          this.$window.scrollTo(0, 0)
        }
      })
  }

  handleRecaptchaFailure () {
    this.brandedAnalyticsFactory.checkoutFieldError('submitOrder', 'failed')
    this.submittingOrder = false
    this.loadingAndSubmitting = false
    this.onSubmittingOrder({ value: false })

    this.loadCart()

    this.onSubmitted()
    this.submissionError = 'generic error'
    this.$window.scrollTo(0, 0)
  }

  canSubmitOrder () {
    return !this.submittingOrder
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
      radioStationRadius: '<',
      onSubmittingOrder: '&',
      onSubmitted: '&',
      useV3: '<',
      loadingAndSubmitting: '<'
    }
  })
