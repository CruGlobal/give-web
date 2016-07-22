import angular from 'angular';
import paymentEncryptionService from 'common/services/paymentEncryption.service';

import bankAccount from './bank-account/bank-account.component';
import creditCard from './credit-card/credit-card.component';

import template from './step-2.tpl';

let componentName = 'checkoutStep2';

class Step2Controller{

  /* @ngInject */
  constructor(paymentEncryptionService){
    this.paymentEncryption = paymentEncryptionService;

    this.paymentType = 'bankAccount';
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
