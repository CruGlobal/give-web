import angular from 'angular';

import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component';

import template from './cart-summary.tpl';

let componentName = 'checkoutCartSummary';

class CartSummaryController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module(componentName, [
    template.name,
    displayRateTotals.name
  ])
  .component(componentName, {
    controller: CartSummaryController,
    templateUrl: template.name,
    bindings: {
      cartData: '<',
      showSubmitBtn: '<',
      enableSubmitBtn: '<',
      onSubmit: '&'
    }
  });
