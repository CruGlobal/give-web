import orderService from 'common/services/api/order.service'

import template from './coverFees.tpl.html'
import angular from 'angular'
import cartService from '../../../services/api/cart.service'

export const brandedCheckoutAmountUpdatedEvent = 'brandedCheckoutAmountUpdatedEvent'

const componentName = 'coverFees'

class CoverFeesController {
  /* @ngInject */
  constructor ($rootScope, $log, $scope, orderService, cartService) {
    this.$rootScope = $rootScope
    this.$log = $log
    this.$scope = $scope
    this.orderService = orderService
    this.cartService = cartService

    this.$rootScope.$on(brandedCheckoutAmountUpdatedEvent, () => {
      this.$onInit()
    })

    this.$onInit()
  }

  $onInit () {
    if (this.cartData) {
      if (this.cartData.items && this.cartData.items.length === 1) {
        this.item = this.cartData.items[0]
      }
    } else if (this.brandedCheckoutItem) {
      this.item = this.brandedCheckoutItem
    }
  }

  storeCoverFeeDecision () {
    this.orderService.storeCoverFeeDecision(this.coverFees)
  }
}

export default angular
  .module(componentName, [
    orderService.name,
    cartService.name
  ])
  .component(componentName, {
    controller: CoverFeesController,
    templateUrl: template,
    bindings: {
      cartData: '<',
      brandedCheckoutItem: '<'
    }
  })
