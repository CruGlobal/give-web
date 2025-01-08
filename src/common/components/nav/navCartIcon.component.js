import angular from 'angular'

import navCart from 'common/components/nav/navCart/navCart.component'
import { giftAddedEvent, cartUpdatedEvent } from 'common/lib/cartEvents'
import uibDropdown from 'angular-ui-bootstrap/src/dropdown'
import analyticsFactory from 'app/analytics/analytics.factory'

import template from './navCartIcon.tpl.html'

const componentName = 'navCartIcon'

class NavCartIconController {
  /* @ngInject */
  constructor ($rootScope, analyticsFactory) {
    this.$rootScope = $rootScope
    this.analyticsFactory = analyticsFactory
  }

  $onInit () {
    this.$rootScope.$on(giftAddedEvent, () => this.giftAddedToCart())
  }

  giftAddedToCart () {
    this.cartOpen = true
  }

  cartOpened () {
    if (!this.cartOpenedPreviously) { // Load cart on initial open only. Events will take care of other reloads
      this.cartOpenedPreviously = true
      this.$rootScope.$emit(cartUpdatedEvent)
    }
  }

  miniCartViewAnalyticsEvent () {
    this.analyticsFactory.cartView(true)
  }
}

export default angular
  .module(componentName, [
    navCart.name,
    analyticsFactory.name,
    uibDropdown
  ])
  .component(componentName, {
    controller: NavCartIconController,
    templateUrl: template
  })
