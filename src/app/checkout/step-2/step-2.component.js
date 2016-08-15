import angular from 'angular';

import bankAccount from './bank-account/bank-account.component';
import creditCard from './credit-card/credit-card.component';

import template from './step-2.tpl';

let componentName = 'checkoutStep2';

class Step2Controller{

  /* @ngInject */
  constructor($log){
    this.$log = $log;

    this.paymentType = 'bankAccount';
    this.submitted = false;
  }

  changePaymentType(type){
    this.paymentType = type;
    this.submitted = false;
  }

  onSave(success){
    if(success){
      this.changeStep({newStep: 'review'});
    }else{
      this.submitted = false;
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    bankAccount.name,
    creditCard.name
  ])
  .component(componentName, {
    controller: Step2Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&'
    }
  });
