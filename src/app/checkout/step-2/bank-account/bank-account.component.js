import angular from 'angular';

import template from './bank-account.tpl';

let componentName = 'checkoutBankAccount';

class BankAccountController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: BankAccountController,
    templateUrl: template.name
  });
