import orderService from 'common/services/api/order.service'

import template from './coverFees.tpl.html'
import angular from 'angular'
import cartService from '../../../services/api/cart.service'
import { cartUpdatedEvent } from 'common/components/nav/navCart/navCart.component'
import { brandedCoverFeeCheckedEvent } from 'app/productConfig/productConfigForm/productConfigForm.component'

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
    this.feesCalculated = false

    this.$rootScope.$on(brandedCheckoutAmountUpdatedEvent, () => {
      this.feesCalculated = false
      this.$onInit()
    })

    this.$onInit()
  }

  $onInit () {
    const sessionCoverFees = this.orderService.retrieveCoverFeeDecision()
    const feesApplied = this.orderService.retrieveFeesApplied()
    if (this.cartData) {
      if (this.cartData.items && this.cartData.items.length === 1) {
        this.item = this.cartData.items[0]
      }
      this.initializeData(sessionCoverFees, this.cartData, this.cartData.items, feesApplied)
      this.orderService.storeCartData(this.cartData)
    } else if (this.brandedCheckoutItem) {
      this.item = this.brandedCheckoutItem
      this.initializeData(sessionCoverFees, this.brandedCheckoutItem, [this.brandedCheckoutItem], feesApplied)
    }
  }

  initializeData (sessionCoverFees, container, items, feesApplied) {
    // Intentionally using == null here to avoid checking both null and undefined
    if (sessionCoverFees !== undefined && container.coverFees == null) {
      container.coverFees = sessionCoverFees
      if (this.item) {
        this.item.coverFees = container.coverFees
      }
      this.updatePrices()
    } else if (container.coverFees !== null) {
      this.orderService.storeCoverFeeDecision(container.coverFees)
    }
  }

  storeCoverFeeDecision () {
    this.orderService.storeCoverFeeDecision(this.coverFees)
  }

  updatePrices () {
    if (this.brandedCheckoutItem) {
      this.orderService.storeCoverFeeDecision(this.brandedCheckoutItem.coverFees)
      this.orderService.updatePrice(this.brandedCheckoutItem, this.brandedCheckoutItem.coverFees)
      this.$scope.$emit(brandedCoverFeeCheckedEvent)
    } else if (this.cartData) {
      if (this.item) {
        this.cartData.coverFees = this.item.coverFees
      }
      this.orderService.updatePrices(this.cartData)
      this.$scope.$emit(cartUpdatedEvent)
    }
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
