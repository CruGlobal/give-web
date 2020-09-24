import orderService from 'common/services/api/order.service'

import template from './coverFees.tpl.html'
import angular from 'angular'
import cartService from '../../../services/api/cart.service'
import { cartUpdatedEvent } from 'common/components/nav/navCart/navCart.component'

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
      const feesApplied = this.orderService.retrieveFeesApplied()
      this.determineFeesCalculated(sessionCoverFees, this.cartData, this.cartData.items, feesApplied)

      // Intentionally using == null here to avoid checking both null and undefined
      if (sessionCoverFees !== undefined && this.cartData.coverFees == null) {
        this.cartData.coverFees = sessionCoverFees
        this.updatePrices()
      } else if (this.cartData.coverFees !== null) {
        this.orderService.storeCoverFeeDecision(this.cartData.coverFees)
      }
      this.orderService.storeCartData(this.cartData)
    } else if (this.brandedCheckoutItem) {
      const sessionCoverFees = this.orderService.retrieveBrandedCoverFeeDecision()
      const feesApplied = this.orderService.retrieveBrandedFeesApplied()
      this.determineFeesCalculated(sessionCoverFees, this.brandedCheckoutItem, [this.brandedCheckoutItem], feesApplied)

      // Intentionally using == null here to avoid checking both null and undefined
      if (sessionCoverFees !== undefined && this.brandedCheckoutItem.coverFees == null) {
        this.brandedCheckoutItem.coverFees = sessionCoverFees
        this.updatePrice()
      } else if (this.brandedCheckoutItem.coverFees !== null) {
        this.orderService.storeBrandedCoverFeeDecision(this.brandedCheckoutItem.coverFees)
      }
    }
  }

  determineFeesCalculated (sessionCoverFees, container, items, feesApplied) {
    if (!this.feesCalculated) {
      if (!container.coverFees && !sessionCoverFees) {
        this.feesCalculated = this.orderService.calculatePricesWithFees(false, items)
      } else if (container.coverFees || sessionCoverFees) {
        this.feesCalculated = this.orderService.calculatePricesWithFees(feesApplied, items)
      }
    }
  }

  updatePrices () {
    this.orderService.updatePrices(this.cartData)
    this.$scope.$emit(cartUpdatedEvent)
  }

  updatePrice () {
    this.orderService.storeBrandedCoverFeeDecision(this.brandedCheckoutItem.coverFees)
    this.orderService.updatePrice(this.brandedCheckoutItem, this.brandedCheckoutItem.coverFees)
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
