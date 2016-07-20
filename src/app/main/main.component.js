import angular from 'angular';
import 'angular-ui-router';

import primaryNavComponent from './nav/primary/primary-nav.component';
import subNavComponent from './nav/sub/sub-nav.component';
import cartComponent from '../cart/cart.component';
import checkoutComponent from '../checkout/checkout.component';

import template from './main.tpl';
import './main.css!';

let componentName = 'main';

class MainController{

  /* @ngInject */
  constructor(){
    this.test = 5;
  }

}

function routingConfig($stateProvider){
  $stateProvider
    .state('cart', {
      url: "/cart",
      template: '<cart></cart>'
    })
    .state('checkout', {
      url: "/checkout",
      template: '<checkout></checkout>'
    });

}

export default angular
  .module(componentName, [
    template.name,
    primaryNavComponent.name,
    subNavComponent.name,
    cartComponent.name,
    checkoutComponent.name,
    'ui.router'
  ])
  .config(routingConfig)
  .component(componentName, {
    controller: MainController,
    templateUrl: template.name
  });
