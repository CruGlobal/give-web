import angular from 'angular';
import isEmpty from 'lodash/isEmpty';

import sessionService from 'common/services/session/session.service';
import cartService from 'common/services/api/cart.service';
import analyticsFactory from 'app/analytics/analytics.factory';

import template from './navCart.tpl.html';

export let giftAddedEvent = 'giftAddedToCart';
export let cartUpdatedEvent = 'cartUpdatedEvent';

let componentName = 'navCart';

class NavCartController{

  /* @ngInject */
  constructor($rootScope, $window, $log, cartService, sessionService, envService, analyticsFactory){
    this.$rootScope = $rootScope;
    this.$window = $window;
    this.$log = $log;
    this.cartService = cartService;
    this.sessionService = sessionService;
    this.envService = envService;
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
    this.firstLoad = false;
    this.loading = true;
    this.error = false;
    this.cartService.get()
      .subscribe( data => {
          this.cartData = data;
          this.loading = false;
          this.hasItems = !isEmpty(this.cartData.items);
          this.analyticsFactory.buildProductVar(data);
          this.analyticsFactory.setEvent('cart open');
        },
        error => {
          this.$log.error('Error loading nav cart items', error);
          this.error = true;
          this.loading = false;
          this.hasItems = false;
        });
  }

  checkout() {
    this.$window.location = this.envService.read('publicGive') + (this.sessionService.getRole() === 'REGISTERED' ? '/checkout.html' : '/sign-in.html');
  }
}

export default angular
  .module(componentName, [
    cartService.name,
    sessionService.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: NavCartController,
    templateUrl: template,
    bindings: {
      mobile: '@'
    }
  });
