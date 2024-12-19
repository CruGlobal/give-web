import angular from 'angular'

import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component'
import coverFeesFilter from 'common/filters/coverFees.filter'
import cartService from '../../../common/services/api/cart.service'

import template from './cart-summary.tpl.html'

const componentName = 'checkoutCartSummary'

export const recaptchaFailedEvent = 'recaptchaFailedEvent'
export const submitOrderEvent = 'submitOrderEvent'

class CartSummaryController {
  /* @ngInject */
  constructor (cartService, $scope, $rootScope) {
    this.$scope = $scope
    this.$rootScope = $rootScope
    this.cartService = cartService
  }

  buildCartUrl () {
    return this.cartService.buildCartUrl()
  }

  handleRecaptchaFailure () {
    this.$rootScope.$emit(recaptchaFailedEvent)
  }

  onSubmit () {
    this.$rootScope.$emit(submitOrderEvent)
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
