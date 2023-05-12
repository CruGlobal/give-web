import angular from 'angular'

import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component'
import coverFeesFilter from 'common/filters/coverFees.filter'
import cartService from '../../../common/services/api/cart.service'

import template from './cart-summary.tpl.html'

const componentName = 'checkoutCartSummary'

class CartSummaryController {
  /* @ngInject */
  constructor (cartService) {
    this.cartService = cartService
  }

  buildCartUrl () {
    return this.cartService.buildCartUrl()
  }
}

export default angular
  .module(componentName, [
    displayRateTotals.name,
    coverFeesFilter.name,
    cartService.name
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
