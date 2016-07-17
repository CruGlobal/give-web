import angular from 'angular';

import template from './credit-card.tpl';

let componentName = 'checkoutCreditCard';

class CreditCardController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: CreditCardController,
    templateUrl: template.name
  });
