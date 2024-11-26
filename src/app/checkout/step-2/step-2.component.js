import angular from 'angular'

import paymentMethodForm from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.component'
import existingPaymentMethods from './existingPaymentMethods/existingPaymentMethods.component'

import orderService from 'common/services/api/order.service'
import { SignInEvent } from 'common/services/session/session.service'
import analyticsFactory from 'app/analytics/analytics.factory'
import brandedAnalyticsFactory from 'app/branded/analytics/branded-analytics.factory'
import { scrollModalToTop } from 'common/services/modalState.service'

import template from './step-2.tpl.html'

const componentName = 'checkoutStep2'

class Step2Controller {
  /* @ngInject */
  constructor ($window, $log, $scope, orderService, analyticsFactory, brandedAnalyticsFactory) {
    this.$window = $window
    this.$log = $log
    this.$scope = $scope
    this.orderService = orderService
    this.analyticsFactory = analyticsFactory
    this.brandedAnalyticsFactory = brandedAnalyticsFactory
    this.scrollModalToTop = scrollModalToTop

    this.$scope.$on(SignInEvent, () => {
      this.$onInit()
    })
  }

  $onInit () {
    this.loadingPaymentMethods = true
    this.existingPaymentMethods = true
    !this.mailingAddress && this.loadDonorDetails()
  }

  $onChanges (changes) {
    if (changes.submitted && changes.submitted.currentValue === true) {
      this.submit()
    }
  }

  loadDonorDetails () {
    this.orderService.getDonorDetails()
      .subscribe((data) => {
        this.mailingAddress = data.mailingAddress
      },
      error => {
        this.$log.error('Error loading donorDetails', error)
      })
  }

  handlePaymentChange (selectedPaymentMethod) {
    const paymentType = selectedPaymentMethod?.['account-type'] || selectedPaymentMethod?.['card-type']
    this.selectedPaymentMethod = selectedPaymentMethod
    this.defaultPaymentType = paymentType
    if (selectedPaymentMethod) {
      this.brandedAnalyticsFactory.savePaymentType(paymentType, Boolean(selectedPaymentMethod['card-type']))
    }
  }

  handleExistingPaymentLoading (success, hasExistingPaymentMethods, error) {
    if (success) {
      this.existingPaymentMethods = hasExistingPaymentMethods
    } else {
      this.existingPaymentMethods = false
      this.$log.warn('Error loading existing payment methods', error)
      this.loadingExistingPaymentError = error
    }
    this.loadingPaymentMethods = false
  }

  submit () {
    this.onPaymentFormStateChange({ state: 'submitted' })
    this.analyticsFactory.checkoutStepOptionEvent(this.defaultPaymentType, 'payment')
  }

  onPaymentFormStateChange ($event) {
    this.paymentFormState = $event.state

    if ($event.state === 'loading' && $event.payload) {
      const paymentType = $event.payload.creditCard ? $event.payload.creditCard['card-type'] : $event.payload.bankAccount ? $event.payload.bankAccount['account-type'] : 'Unknown'
      const request = $event.update
        ? this.orderService.updatePaymentMethod($event.paymentMethodToUpdate, $event.payload)
        : this.orderService.addPaymentMethod($event.payload)
      request.subscribe(() => {
        if (!$event.stayOnStep) {
          this.changeStep({ newStep: 'review' })
          this.onStateChange({ state: 'submitted' })
          this.$onInit()
        }
        this.brandedAnalyticsFactory.savePaymentType(paymentType, Boolean($event.payload.creditCard))
        this.paymentFormState = 'success'
      },
      error => {
        if (error.status !== 409) {
          this.$log.error('Error saving payment method', error)
        }
        this.paymentFormState = 'error'
        this.paymentFormError = error.data
        this.onStateChange({ state: 'errorSubmitting' })
        if (this.existingPaymentMethods) {
          this.scrollModalToTop()
        } else {
          this.$window.scrollTo(0, 0)
        }
      })
    } else if ($event.state === 'loading') {
      this.changeStep({ newStep: 'review' })
      this.onStateChange({ state: 'submitted' })
      this.paymentFormState = 'success'
    } else if ($event.state === 'submitted') {
      // this.orderService.storeCardSecurityCode(this.selectedPaymentMethod.cvv, this.selectedPaymentMethod.self.uri)
    } else if ($event.state === 'unsubmitted') {
      this.onStateChange({ state: 'unsubmitted' })
    } else if ($event.state === 'error') {
      this.onStateChange({ state: 'errorSubmitting' })
    }
  }

  isContinueDisabled () {
    if (this.selectedPaymentMethod?.['card-type'] && !this.isCvvValid) {
      return true
    }
    if (this.loadingPaymentMethods) {
      return true
    }
    if (this.paymentFormState === 'loading' || this.paymentFormState === 'encrypting') {
      return true
    }
    if (this.existingPaymentMethods && !this.selectedPaymentMethod) {
      // All payment methods are invalid
      return true
    }
    return false
  }

  enableContinue (isCvvValid) {
    this.isCvvValid = isCvvValid
  }
}

export default angular
  .module(componentName, [
    paymentMethodForm.name,
    existingPaymentMethods.name,
    orderService.name,
    analyticsFactory.name,
    brandedAnalyticsFactory.name
  ])
  .component(componentName, {
    controller: Step2Controller,
    templateUrl: template,
    bindings: {
      submitted: '<',
      hideButtons: '<',
      mailingAddress: '=?',
      defaultPaymentType: '<',
      hidePaymentTypeOptions: '<',
      cartData: '<',
      brandedCheckoutItem: '<',
      changeStep: '&',
      onStateChange: '&'
    }
  })
