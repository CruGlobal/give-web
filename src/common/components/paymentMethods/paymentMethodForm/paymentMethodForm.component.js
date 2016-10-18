import angular from 'angular';

import paymentMethodDisplay from '../paymentMethodDisplay.component';
import bankAccountForm from '../bankAccountForm/bankAccountForm.component';
import creditCardForm from '../creditCardForm/creditCardForm.component';

import template from './paymentMethodForm.tpl';

let componentName = 'paymentMethodForm';

class PaymentMethodFormController{

  /* @ngInject */
  constructor($log, envService){
    this.$log = $log;

    this.paymentType = 'bankAccount';
    this.imgDomain = envService.read('imgDomain');
  }

  $onInit(){
    if(this.paymentMethod){
      this.paymentType = this.paymentMethod.self.type === 'elasticpath.bankaccounts.bank-account' ? 'bankAccount' : 'creditCard';
    }
  }

  changePaymentType(type){
    this.paymentType = type;
    this.onSubmit({success: false});
  }

  onChildSubmit(success, data){
    this.onSubmit({success: success, data: data});
  }
}

export default angular
  .module(componentName, [
    template.name,
    paymentMethodDisplay.name,
    bankAccountForm.name,
    creditCardForm.name
  ])
  .component(componentName, {
    controller: PaymentMethodFormController,
    templateUrl: template.name,
    bindings: {
      paymentMethod: '<',
      mailingAddress: '<',
      submissionError: '<',
      onSubmit: '&'
    }
  });
