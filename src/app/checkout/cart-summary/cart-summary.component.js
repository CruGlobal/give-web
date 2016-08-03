import angular from 'angular';

import template from './cart-summary.tpl';

let componentName = 'checkoutCartSummary';

class CartSummaryController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: CartSummaryController,
    templateUrl: template.name,
    bindings: {
      cartData: '<'
    }
  });
