import orderService from 'common/services/api/order.service'

import template from './coverFees.tpl.html'
import angular from 'angular'

const componentName = 'coverFees'

class CoverFeesController {
  /* @ngInject */
  constructor (orderService) {
    this.orderService = orderService
  }

  $onInit () {
    this.coverFees = this.orderService.retrieveCoverFeeDecision()

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
    orderService.name
  ])
  .component(componentName, {
    controller: CoverFeesController,
    templateUrl: template,
    bindings: {
      cartData: '<',
      brandedCheckoutItem: '<'
    }
  })
