import angular from 'angular'
import find from 'lodash/find'
import uibModal from 'angular-ui-bootstrap/src/modal'

import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component'
import paymentMethodFormModal from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.modal.component'

import orderService from 'common/services/api/order.service'
import cartService from 'common/services/api/cart.service'
import { validPaymentMethod } from 'common/services/paymentHelpers/validPaymentMethods'
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl.html'
import { SignInEvent } from 'common/services/session/session.service'

import template from './existingPaymentMethods.tpl.html'

const componentName = 'checkoutExistingPaymentMethods'

class ExistingPaymentMethodsController {
  /* @ngInject */
  constructor ($log, $scope, orderService, cartService, $uibModal, $filter, $window) {
    this.$log = $log
    this.$scope = $scope
    this.orderService = orderService
    this.cartService = cartService
    this.$uibModal = $uibModal
    this.paymentFormResolve = {}
    this.validPaymentMethod = validPaymentMethod
    this.$filter = $filter
    this.feesCalculated = false
    this.sessionStorage = $window.sessionStorage

    this.$scope.$on(SignInEvent, () => {
      this.$onInit()
    })
  }

  $onInit () {
    this.loadPaymentMethods()
  }

  $onChanges (changes) {
    if (!this.feesCalculated && this.cartData) {
      if (!this.cartData.coverFees && !JSON.parse(this.sessionStorage.getItem('coverFees'))) {
        this.calculatePricesWithFees(false)
      } else if (this.cartData.coverFees || JSON.parse(this.sessionStorage.getItem('coverFees'))) {
        this.calculatePricesWithFees(JSON.parse(this.sessionStorage.getItem('feesApplied')))
      }
    }

    if (this.cartData) {
      // Intentionally using == null here to avoid checking both null and undefined
      if (this.sessionStorage.getItem('coverFees') !== undefined && this.cartData.coverFees == null) {
        this.cartData.coverFees = JSON.parse(this.sessionStorage.getItem('coverFees'))
        this.updatePrices()
      } else if (this.cartData.coverFees !== null) {
        this.sessionStorage.setItem('coverFees', angular.toJson(this.cartData.coverFees))
      }
    }

    if (changes.paymentFormState) {
      const state = changes.paymentFormState.currentValue
      this.paymentFormResolve.state = state
      if (state === 'submitted' && !this.paymentMethodFormModal) {
        this.selectPayment()
        this.editGifts()
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
          this.onLoad({ success: true, hasExistingPaymentMethods: true })
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
    const chosenPaymentMethod = find(this.paymentMethods, { chosen: true })
    if (chosenPaymentMethod) {
      // Select the payment method previously chosen for the order
      this.selectedPaymentMethod = chosenPaymentMethod
    } else {
      // Select the first payment method
      this.selectedPaymentMethod = this.paymentMethods[0]
    }
  }

  openPaymentMethodFormModal (existingPaymentMethod) {
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
      this.onPaymentFormStateChange({
        $event: {
          state: 'unsubmitted'
        }
      })
      delete this.paymentMethodFormModal
    }
    this.paymentMethodFormModal.result.then(resetForm, resetForm)
  }

  selectPayment () {
    if (this.selectedPaymentMethod.chosen) {
      this.orderService.storeCardSecurityCode(null, this.selectedPaymentMethod.self.uri) // Unset the CVV unless the user has provided a CVV for the selected payment method this order
      this.onPaymentFormStateChange({ $event: { state: 'loading' } })
    } else {
      this.orderService.selectPaymentMethod(this.selectedPaymentMethod.selectAction)
        .subscribe(() => {
          this.orderService.storeCardSecurityCode(null, this.selectedPaymentMethod.self.uri) // Unset the CVV unless the user has provided a CVV for the selected payment method this order
          this.onPaymentFormStateChange({ $event: { state: 'loading' } })
        },
        (error) => {
          this.$log.error('Error selecting payment method', error)
          this.onPaymentFormStateChange({ $event: { state: 'error', error: error } })
        })
    }
  }

  calculatePricesWithFees (feesApplied) {
    angular.forEach(this.cartData.items, (item) => {
      if (feesApplied) {
        item.amountWithFee = item.amount
      } else {
        item.amountWithFee = this.calculatePriceWithFees(item.amount)
      }
    })
    this.feesCalculated = true
  }

  calculatePriceWithFees (originalAmount) {
    originalAmount = parseFloat(originalAmount)
    const newAmount = (originalAmount * 0.0235) + originalAmount
    return this.$filter('number')(newAmount, 2)
  }

  calculatePriceWithoutFees (originalAmount) {
    originalAmount = parseFloat(originalAmount)
    const newAmount = originalAmount / 1.0235
    return this.$filter('number')(newAmount, 2)
  }

  updatePrices () {
    this.sessionStorage.setItem('coverFees', angular.toJson(this.cartData.coverFees))

    angular.forEach(this.cartData.items, (item) => {
      let newAmount
      if (this.cartData.coverFees) {
        newAmount = item.amountWithFee
      } else {
        if (parseFloat(item.amount) === parseFloat(item.amountWithFee)) {
          newAmount = this.calculatePriceWithoutFees(item.amount)
        } else {
          newAmount = this.$filter('number')(item.amount, 2)
        }
      }

      item.amount = parseFloat(newAmount)
      item.config.amount = parseFloat(newAmount)
      item.price = `$${newAmount}`
    })

    this.recalculateFrequencyTotals()
  }

  recalculateFrequencyTotals () {
    angular.forEach(this.cartData.frequencyTotals, rateTotal => {
      rateTotal.total = '$0.00'
      rateTotal.amount = 0
    })

    angular.forEach(this.cartData.items, item => {
      angular.forEach(this.cartData.frequencyTotals, rateTotal => {
        if (item.frequency === rateTotal.frequency) {
          rateTotal.amount += item.amount
          rateTotal.total = `$${this.$filter('number')(rateTotal.amount, 2)}`
        }
      })
    })
  }

  editGifts () {
    angular.forEach(this.cartData.items, item => {
      if (this.cartData.coverFees) {
        item.config.amount = item.amountWithFee
      }
      this.cartService.editItem(item.uri, item.productUri, item.config).subscribe(() => {
        this.sessionStorage.setItem('feesApplied', angular.toJson(true))
        this.loadCart()
      })
    })
  }
}

export default angular
  .module(componentName, [
    uibModal,
    paymentMethodDisplay.name,
    paymentMethodFormModal.name,
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
      onPaymentFormStateChange: '&',
      onLoad: '&',
      loadCart: '&'
    }
  })
