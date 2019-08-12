import angular from 'angular'

import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component'

import template from './cart-summary.tpl.html'

const componentName = 'checkoutCartSummary'

class CartSummaryController {
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
  })
