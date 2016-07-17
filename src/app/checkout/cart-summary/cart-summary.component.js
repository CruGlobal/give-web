import angular from 'angular';

import cartSummaryTemplate from './cart-summary.tpl';

class CartSummmaryController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module('checkoutCartSummary', [
    cartSummaryTemplate.name
  ])
  .component('checkoutCartSummary', {
    controller: CartSummmaryController,
    templateUrl: cartSummaryTemplate.name
  });
