import angular from 'angular'

import paymentMethodDisplay from '../paymentMethodDisplay.component'
import bankAccountForm from '../bankAccountForm/bankAccountForm.component'
import creditCardForm from '../creditCardForm/creditCardForm.component'
import orderService from '../../../services/api/order.service'

import template from './paymentMethodForm.tpl.html'
import { brandedCoverFeeCheckedEvent } from '../../../../app/productConfig/productConfigForm/productConfigForm.component'

const componentName = 'paymentMethodForm'

class PaymentMethodFormController {
  /* @ngInject */
  constructor ($log, $scope, envService, orderService) {
    this.$log = $log
    this.$scope = $scope

    this.paymentType = 'bankAccount'
    this.imgDomain = envService.read('imgDomain')
    this.orderService = orderService
  }

  $onInit () {
    if (this.paymentMethod) {
      this.paymentType = this.paymentMethod.self.type === 'elasticpath.bankaccounts.bank-account' ? 'bankAccount' : 'creditCard'
    } else if (this.defaultPaymentType === 'creditCard') {
      this.paymentType = 'creditCard'
    }
  }

  changePaymentType (type) {
    if (this.cartData && type === 'bankAccount') {
      this.cartData.coverFees = false
      this.orderService.updatePrices(this.cartData)
    }
    if (this.brandedCheckoutItem && type === 'bankAccount') {
      this.brandedCheckoutItem.coverFees = false
      this.orderService.storeBrandedCoverFeeDecision(false)
      this.orderService.updatePrice(this.brandedCheckoutItem, false)
      this.$scope.$emit(brandedCoverFeeCheckedEvent)
    }
    this.paymentType = type
    this.onPaymentFormStateChange({
      $event: {
        state: 'unsubmitted'
      }
    })
  }
}

export default angular
  .module(componentName, [
    paymentMethodDisplay.name,
    bankAccountForm.name,
    creditCardForm.name,
    orderService.name
  ])
  .component(componentName, {
    controller: PaymentMethodFormController,
    templateUrl: template,
    bindings: {
      paymentFormState: '<',
      paymentFormError: '<',
      paymentMethod: '<',
      disableCardNumber: '<',
      hideCvv: '<',
      mailingAddress: '<',
      defaultPaymentType: '<',
      hidePaymentTypeOptions: '<',
      cartData: '<',
      brandedCheckoutItem: '<',
      onPaymentFormStateChange: '&'
    }
  })
