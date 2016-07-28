import angular from 'angular';

import template from './cart-summary.tpl';

let componentName = 'checkoutCartSummary';

class CartSummmaryController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: CartSummmaryController,
    templateUrl: template.name,
    bindings: {
      cartData: '<'
    }
  });
