import angular from 'angular';

import {giftAddedEvent} from 'common/components/nav/navCart/navCart.component';
import navCart, {cartUpdatedEvent} from 'common/components/nav/navCart/navCart.component';

import template from './navCartIcon.tpl.html';

let componentName = 'navCartIcon';

class NavCartIconController{

  /* @ngInject */
  constructor($rootScope){
    this.$rootScope = $rootScope;
  }

  $onInit() {
    this.$rootScope.$on(giftAddedEvent, () => this.giftAddedToCart() );
  }

  giftAddedToCart() {
    this.cartOpen = true;
  }

  cartOpened(){
    if(!this.cartOpenedPreviously){ // Load cart on initial open only. Events will take care of other reloads
      this.cartOpenedPreviously = true;
      this.$rootScope.$emit( cartUpdatedEvent );
    }
  }
}

export default angular
  .module(componentName, [
    navCart.name
  ])
  .component(componentName, {
    controller: NavCartIconController,
    templateUrl: template
  });
