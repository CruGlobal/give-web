import orderService from 'common/services/api/order.service'

import template from './coverFees.tpl.html'
import angular from 'angular'
import cartService from '../../../services/api/cart.service'

const componentName = 'coverFees'

class CoverFeesController {
  /* @ngInject */
  constructor ($log, $scope, orderService, cartService) {
    this.$log = $log
    this.$scope = $scope
    this.orderService = orderService
    this.cartService = cartService
    this.feesCalculated = false

    this.$onInit()
  }

  $onInit () {
    if (this.cartData) {
      const sessionCoverFees = this.orderService.retrieveCoverFeeDecision()
      if (!this.feesCalculated) {
        if (!this.cartData.coverFees && !sessionCoverFees) {
          this.feesCalculated = this.orderService.calculatePricesWithFees(false, this.cartData.items)
        } else if (this.cartData.coverFees || sessionCoverFees) {
          const feesApplied = this.orderService.retrieveFeesApplied()
          this.feesCalculated = this.orderService.calculatePricesWithFees(feesApplied, this.cartData.items)
        }
      }
      // Intentionally using == null here to avoid checking both null and undefined
      if (sessionCoverFees !== undefined && this.cartData.coverFees == null) {
        this.cartData.coverFees = sessionCoverFees
        this.updatePrices()
      } else if (this.cartData.coverFees !== null) {
        this.orderService.storeCoverFeeDecision(this.cartData.coverFees)
      }
    }
  }

  updatePrices () {
    this.orderService.updatePrices(this.cartData)
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
      cartData: '<'
    }
  })
