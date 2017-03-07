import angular from 'angular';
import isEmpty from 'lodash/isEmpty';

import sessionService from 'common/services/session/session.service';
import cartService from 'common/services/api/cart.service';
import analyticsFactory from 'app/analytics/analytics.factory';

import template from './navCart.tpl';

export let giftAddedEvent = 'giftAddedToCart';
export let cartUpdatedEvent = 'cartUpdatedEvent';

let componentName = 'navCart';

class NavCartController{

  /* @ngInject */
  constructor($rootScope, $window, $log, cartService, sessionService, analyticsFactory){
    this.$rootScope = $rootScope;
    this.$window = $window;
    this.$log = $log;
    this.cartService = cartService;
    this.sessionService = sessionService;
    this.analyticsFactory = analyticsFactory;
    this.firstLoad = true;
  }

  $onInit(){
    this.mobile = !!this.mobile;
    this.$rootScope.$on(giftAddedEvent, () => this.loadCart());
    this.$rootScope.$on(cartUpdatedEvent, () => this.loadCart());
    this.sessionService.sessionSubject.subscribe( () => !this.firstLoad && this.loadCart() ); // Ignore session events until another event loads cart
  }

  loadCart() {
    if(this.firstLoad){
      this.analyticsFactory.track('aa-cart-open');
    }
    this.firstLoad = false;
    this.loading = true;
    this.error = false;
    this.cartService.get()
      .subscribe( data => {
          this.cartData = data;
          this.loading = false;
          this.hasItems = !isEmpty(this.cartData.items);
        },
        error => {
          this.$log.error('Error loading nav cart items', error);
          this.error = true;
          this.loading = false;
          this.hasItems = false;
        });
  }

  checkout() {
    this.$window.location = this.sessionService.getRole() === 'REGISTERED' ? '/checkout.html' : '/sign-in.html';
  }
}

export default angular
  .module(componentName, [
    template.name,
    cartService.name,
    sessionService.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: NavCartController,
    templateUrl: template.name,
    bindings: {
      mobile: '@'
    }
  });
