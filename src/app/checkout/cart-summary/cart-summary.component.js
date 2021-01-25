import angular from 'angular'

import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component'
import coverFeesFilter from 'common/filters/coverFees.filter'

import template from './cart-summary.tpl.html'

const componentName = 'checkoutCartSummary'

class CartSummaryController {
  /* @ngInject */
  constructor () /* eslint-disable-line no-useless-constructor */ {}
}

export default angular
  .module(componentName, [
    displayRateTotals.name,
    coverFeesFilter.name
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
