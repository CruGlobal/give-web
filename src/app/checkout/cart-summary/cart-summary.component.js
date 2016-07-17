import angular from 'angular';

import template from './cart-summary.tpl';

class CartSummmaryController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module('checkoutCartSummary', [
    template.name
  ])
  .component('checkoutCartSummary', {
    controller: CartSummmaryController,
    templateUrl: template.name
  });
