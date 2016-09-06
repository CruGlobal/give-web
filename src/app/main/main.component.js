import 'babel/external-helpers';
import angular from 'angular';
import 'angular-ui-router';

import appConfig from 'common/app.config';

import primaryNavComponent from './nav/primary/primary-nav.component';
import subNavComponent from './nav/sub/sub-nav.component';
import cartComponent from '../cart/cart.component';
import checkoutComponent from '../checkout/checkout.component';
import thankYouComponent from '../thankYou/thankYou.component';
import productConfigComponent from '../productConfig/productConfig.component';
import signInComponent from '../signIn/signIn.component';
import searchResultsComponent from '../searchResults/searchResults.component';
import homeSignInComponent from '../homeSignIn/homeSignIn.component';
import manageGivingComponent from '../profile/manage-giving/manage-giving.component';

import template from './main.tpl';

let componentName = 'main';

class MainController{

  /* @ngInject */
  constructor(){
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
    .state('thank-you', {
      url: "/thank-you.html",
      template: '<thank-you></thank-you>'
    })
    .state('manage-giving', {
      url: "/manage-giving.html",
      template: '<manage-giving></manage-giving>'
    })
    .state('search-results', {
      url: "/search-results.html",
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
    thankYouComponent.name,
    manageGivingComponent.name,
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
