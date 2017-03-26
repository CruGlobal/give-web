import angular from 'angular';

import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component';

import template from './cart-summary.tpl.html';

let componentName = 'checkoutCartSummary';

class CartSummaryController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module(componentName, [
    displayRateTotals.name
  ])
  .component(componentName, {
    controller: CartSummaryController,
    templateUrl: template,
    bindings: {
      cartData: '<',
      showSubmitBtn: '<',
      enableSubmitBtn: '<',
      onSubmit: '&',
      submittingOrder: '<'
    }
  });
