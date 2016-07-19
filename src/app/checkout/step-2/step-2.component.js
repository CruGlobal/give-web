import angular from 'angular';
import ccp from 'common/ccp/ccp';

import bankAccount from './bank-account/bank-account.component';
import creditCard from './credit-card/credit-card.component';

import template from './step-2.tpl';

let componentName = 'checkoutStep2';

class Step2Controller{

  /* @ngInject */
  constructor(){
    this.paymentType = 'bankAccount';
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
    templateUrl: template.name
  });
