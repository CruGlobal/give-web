import angular from 'angular'

import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component'
import coverFeesFilter from 'common/filters/coverFees.filter'
import cartService from '../../../common/services/api/cart.service'

import template from './cart-summary.tpl.html'

const componentName = 'checkoutCartSummary'

export const submitOrderEvent = 'submitOrderEvent'

class CartSummaryController {
  /* @ngInject */
  constructor (cartService, $scope) {
    this.$scope = $scope
    this.cartService = cartService
  }

  buildCartUrl () {
    return this.cartService.buildCartUrl()
  }

  onSubmit (componentInstance) {
    componentInstance.$rootScope.$emit(submitOrderEvent)
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
      submittingOrder: '<',
      componentReference: '<'
    }
  })
