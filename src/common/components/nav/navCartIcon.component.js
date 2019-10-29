import angular from 'angular'

import navCart, { giftAddedEvent, cartUpdatedEvent } from 'common/components/nav/navCart/navCart.component'
import uibDropdown from 'angular-ui-bootstrap/src/dropdown'

import template from './navCartIcon.tpl.html'

const componentName = 'navCartIcon'

class NavCartIconController {
  /* @ngInject */
  constructor ($rootScope) {
    this.$rootScope = $rootScope
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
}

export default angular
  .module(componentName, [
    navCart.name,
    uibDropdown
  ])
  .component(componentName, {
    controller: NavCartIconController,
    templateUrl: template
  })
