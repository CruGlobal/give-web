import angular from 'angular'

import paymentMethodDisplay from '../paymentMethodDisplay.component'
import bankAccountForm from '../bankAccountForm/bankAccountForm.component'
import creditCardForm from '../creditCardForm/creditCardForm.component'

import template from './paymentMethodForm.tpl.html'

const componentName = 'paymentMethodForm'

class PaymentMethodFormController {
  /* @ngInject */
  constructor ($log, envService) {
    this.$log = $log

    this.paymentType = 'bankAccount'
    this.imgDomain = envService.read('imgDomain')
  }

  $onInit () {
    if (this.paymentMethod) {
      this.paymentType = this.paymentMethod.self.type === 'elasticpath.bankaccounts.bank-account' ? 'bankAccount' : 'creditCard'
    } else if (this.defaultPaymentType === 'creditCard') {
      this.paymentType = 'creditCard'
    }
  }

  changePaymentType (type) {
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
    creditCardForm.name
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
      onPaymentFormStateChange: '&'
    }
  })
