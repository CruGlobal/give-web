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
    const sessionCoverFees = this.orderService.retrieveCoverFeeDecision()
    if (this.cartData) {
      if (this.cartData.items && this.cartData.items.length === 1) {
        this.item = this.cartData.items[0]
      }
      this.initializeData(sessionCoverFees, this.cartData, this.cartData.items)
      this.orderService.storeCartData(this.cartData)
    } else if (this.brandedCheckoutItem) {
      this.item = this.brandedCheckoutItem
      this.initializeData(sessionCoverFees, this.brandedCheckoutItem, [this.brandedCheckoutItem])
    }
  }

  initializeData (sessionCoverFees, container, items) {
    // Intentionally using == null here to avoid checking both null and undefined
    if (sessionCoverFees !== undefined && container.coverFees == null) {
      container.coverFees = sessionCoverFees
      if (this.item) {
        this.item.coverFees = container.coverFees
      }
    } else if (container.coverFees !== null) {
      this.orderService.storeCoverFeeDecision(container.coverFees)
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
