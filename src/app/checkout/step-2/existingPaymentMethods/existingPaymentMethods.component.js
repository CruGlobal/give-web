import angular from 'angular'
import find from 'lodash/find'
import uibModal from 'angular-ui-bootstrap/src/modal'

import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component'
import paymentMethodFormModal from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.modal.component'
import coverFees from 'common/components/paymentMethods/coverFees/coverFees.component'

import orderService from 'common/services/api/order.service'
import cartService from 'common/services/api/cart.service'
import { validPaymentMethod } from 'common/services/paymentHelpers/validPaymentMethods'
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl.html'
import { SignInEvent } from 'common/services/session/session.service'

import template from './existingPaymentMethods.tpl.html'

const componentName = 'checkoutExistingPaymentMethods'

class ExistingPaymentMethodsController {
  /* @ngInject */
  constructor ($log, $scope, orderService, cartService, $uibModal) {
    this.$log = $log
    this.$scope = $scope
    this.orderService = orderService
    this.cartService = cartService
    this.$uibModal = $uibModal
    this.paymentFormResolve = {}
    this.validPaymentMethod = validPaymentMethod

    this.$scope.$on(SignInEvent, () => {
      this.$onInit()
    })
  }

  $onInit () {
    this.loadPaymentMethods()
  }

  $onChanges (changes) {
    if (changes.paymentFormState) {
      const state = changes.paymentFormState.currentValue
      this.paymentFormResolve.state = state
      if (state === 'submitted' && !this.paymentMethodFormModal) {
        this.selectPayment()
      }
      if (state === 'success') {
        this.loadPaymentMethods()
      }
    }
    if (changes.paymentFormError) {
      this.paymentFormResolve.error = changes.paymentFormError.currentValue
    }
  }

  loadPaymentMethods () {
    this.orderService.getExistingPaymentMethods()
      .subscribe((data) => {
        if (data.length > 0) {
          this.paymentMethods = data
          this.selectDefaultPaymentMethod()
          this.onLoad({ success: true, hasExistingPaymentMethods: true, selectedPaymentMethod: this.selectedPaymentMethod })
        } else {
          this.onLoad({ success: true, hasExistingPaymentMethods: false })
        }
        this.paymentMethodFormModal && this.paymentMethodFormModal.close()
      }, (error) => {
        this.$log.error('Error loading paymentMethods', error)
        this.onLoad({ success: false, error: error })
        this.paymentMethodFormModal && this.paymentMethodFormModal.close()
      })
  }

  selectDefaultPaymentMethod () {
    const paymentMethods = this.paymentMethods.filter(paymentMethod => this.validPaymentMethod(paymentMethod))
    const chosenPaymentMethod = find(paymentMethods, { chosen: true })
    if (chosenPaymentMethod) {
      // Select the payment method previously chosen for the order
      this.selectedPaymentMethod = chosenPaymentMethod
    } else {
      // Select the first payment method
      this.selectedPaymentMethod = paymentMethods[0]
    }
    this.switchPayment()
  }

  openPaymentMethodFormModal (existingPaymentMethod) {
    this.paymentFormResolve.state = 'unsubmitted'
    this.paymentMethodFormModal = this.$uibModal.open({
      component: 'paymentMethodFormModal',
      backdrop: 'static', // Disables closing on click
      windowTemplateUrl: giveModalWindowTemplate,
      resolve: {
        paymentForm: this.paymentFormResolve,
        paymentMethod: existingPaymentMethod,
        disableCardNumber: !!existingPaymentMethod && !existingPaymentMethod['from-current-order'],
        mailingAddress: this.mailingAddress,
        defaultPaymentType: () => this.defaultPaymentType,
        hidePaymentTypeOptions: () => this.hidePaymentTypeOptions,
        onPaymentFormStateChange: () => param => {
          param.$event.stayOnStep = true
          param.$event.update = !!existingPaymentMethod
          param.$event.paymentMethodToUpdate = existingPaymentMethod
          this.onPaymentFormStateChange(param)
        }
      }
    })

    const resetForm = () => {
      delete this.paymentMethodFormModal
    }
    this.paymentMethodFormModal.result.then(resetForm, resetForm)
  }

  selectPayment () {
    if (this.selectedPaymentMethod.chosen) {
      // Unset the CVV and CardBin unless the user has provided a CVV for the selected payment method this order
      this.orderService.storeCardSecurityCode(null, this.selectedPaymentMethod.self.uri)
      this.orderService.storeCardBin(null, this.selectedPaymentMethod.self.uri)
      this.onPaymentFormStateChange({ $event: { state: 'loading' } })
    } else {
      this.orderService.selectPaymentMethod(this.selectedPaymentMethod.selectAction)
        .subscribe(() => {
          // Unset the CVV and CardBin unless the user has provided a CVV for the selected payment method this order
          this.orderService.storeCardBin(null, this.selectedPaymentMethod.self.uri)
          this.orderService.storeCardSecurityCode(null, this.selectedPaymentMethod.self.uri)
          this.onPaymentFormStateChange({ $event: { state: 'loading' } })
        },
        (error) => {
          this.$log.error('Error selecting payment method', error)
          this.onPaymentFormStateChange({ $event: { state: 'error', error: error } })
        })
    }
  }

  switchPayment () {
    this.onPaymentChange({ selectedPaymentMethod: this.selectedPaymentMethod })
    if (this.selectedPaymentMethod?.['bank-name']) {
      // This is an EFT payment method so we need to remove any fee coverage
      this.orderService.storeCoverFeeDecision(false)
    }
  }
}

export default angular
  .module(componentName, [
    uibModal,
    paymentMethodDisplay.name,
    paymentMethodFormModal.name,
    coverFees.name,
    orderService.name,
    cartService.name
  ])
  .component(componentName, {
    controller: ExistingPaymentMethodsController,
    templateUrl: template,
    bindings: {
      paymentFormState: '<',
      paymentFormError: '<',
      mailingAddress: '<',
      defaultPaymentType: '<',
      hidePaymentTypeOptions: '<',
      cartData: '<',
      brandedCheckoutItem: '<',
      onPaymentFormStateChange: '&',
      onPaymentChange: '&',
      onLoad: '&'
    }
  })
