import 'babel/external-helpers';
import angular from 'angular';
import 'angular-ui-router';

import appConfig from 'common/app.config';

import primaryNavComponent from './nav/primary/primary-nav.component';
import subNavComponent from './nav/sub/sub-nav.component';
import cartComponent from '../cart/cart.component';
import checkoutComponent from '../checkout/checkout.component';

import cartService from 'common/services/api/cart.service';

import template from './main.tpl';
import './main.css!';

let componentName = 'main';

class MainController{

  /* @ngInject */
  constructor(cartService, $log, $state){
    this.cartService = cartService;
    this.$log = $log;
    this.$state = $state;
  }

  addItemToCart(id){
    this.cartService.addItem(id)
      .subscribe((response) => {
        this.$log.info('Added new item', response.data);
        this.$state.reload();
      });
  }

}

/* @ngInject */
function routingConfig($stateProvider, $locationProvider, $urlRouterProvider){
  $stateProvider
    .state('cart', {
      url: "/cart",
      template: '<cart></cart>'
    })
    .state('checkout', {
      url: "/checkout",
      template: '<checkout></checkout>'
    });

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
  $urlRouterProvider.otherwise('/checkout');
}

export default angular
  .module(componentName, [
    template.name,
    appConfig.name,
    primaryNavComponent.name,
    subNavComponent.name,
    cartComponent.name,
    checkoutComponent.name,
    'ui.router',
    cartService.name
  ])
  .config(routingConfig)
  .component(componentName, {
    controller: MainController,
    templateUrl: template.name
  });
