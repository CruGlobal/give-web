import angular from 'angular';
import paymentEncryptionService from 'common/services/paymentEncryption.service';

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

  onSave(success){
    if(success){
      this.$log.info('succeeded validation - need to go to review');
    }else{
      this.submitted = false;
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    bankAccount.name,
    creditCard.name,
    paymentEncryptionService.name
  ])
  .component(componentName, {
    controller: Step2Controller,
    templateUrl: template.name
  });
