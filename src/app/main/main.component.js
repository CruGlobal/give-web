import 'babel/external-helpers';
import angular from 'angular';
import 'angular-ui-router';

import appConfig from 'common/app.config';

import primaryNavComponent from './nav/primary/primary-nav.component';
import subNavComponent from './nav/sub/sub-nav.component';
import cartComponent from '../cart/cart.component';
import paymentMethodsComponent from '../profile/payment-methods/payment-methods.component';
import checkoutComponent from '../checkout/checkout.component';
import productConfigComponent from '../productConfig/productConfig.component';
import signInComponent from '../signIn/signIn.component';
import searchResultsComponent from '../searchResults/searchResults.component';
import homeSignInComponent from '../homeSignIn/homeSignIn.component';

import template from './main.tpl';

let componentName = 'main';

class MainController{

  /* @ngInject */
  constructor($location){
    this.$location = $location;
  }

  designationSearch(searchString){
    this.$location.path('search-results.' + searchString + '.html');
  }
}

/* @ngInject */
function routingConfig($stateProvider, $locationProvider, $urlRouterProvider){
  $stateProvider
    .state('cart', {
      url: "/cart.html",
      template: '<cart></cart>'
    })
    .state('sign-in', {
      url: "/sign-in.html",
      template: '<sign-in></sign-in>'
    })
    .state('checkout', {
      url: "/checkout.html",
      template: '<checkout></checkout>'
    })
    .state('payment-methods', {
      url: "/payment-methods.html",
      template: '<payment-methods></payment-methods>'
    })
    .state('search-results', {
      url: "/{beginPath:search-results.}{endPath:.+html}",
      template: '<search-results></search-results>'
    });

  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/cart.html');
}

export default angular
  .module(componentName, [
    template.name,
    appConfig.name,
    primaryNavComponent.name,
    subNavComponent.name,
    cartComponent.name,
    checkoutComponent.name,
    paymentMethodsComponent.name,
    productConfigComponent.name,
    signInComponent.name,
    searchResultsComponent.name,
    homeSignInComponent.name,
    'ui.router'
  ])
  .config(routingConfig)
  .component(componentName, {
    controller: MainController,
    templateUrl: template.name
  });
