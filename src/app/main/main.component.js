import 'babel/external-helpers';
import angular from 'angular';
import 'angular-ui-router';

import appConfig from 'common/app.config';

import commonModule from 'common/common.module';
import cartComponent from '../cart/cart.component';
import checkoutComponent from '../checkout/checkout.component';
import thankYouComponent from '../thankYou/thankYou.component';
import productConfigComponent from '../productConfig/productConfig.component';
import signInComponent from '../signIn/signIn.component';
import searchResultsComponent from '../searchResults/searchResults.component';
import designationEditorComponent from '../designationEditor/designationEditor.component';
import yourGivingComponent from '../profile/yourGiving/yourGiving.component';
import analyticsModule from '../analytics/analytics.module';
import analyticsRun from '../analytics/analytics.run';

import paymentMethodsComponent from '../profile/payment-methods/payment-methods.component';
import receiptsComponent from '../profile/receipts/receipts.component';

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
    .state('your-giving', {
      url: "/your-giving.html",
      template: '<your-giving></your-giving>'
    })
    .state('payment-methods', {
      url: "/profile/payment-methods.html",
      template: '<payment-methods></payment-methods>'
    })
    .state('receipts', {
      url: "/receipts.html",
      template: '<receipts></receipts>'
    })
    .state('search-results', {
      url: "/search-results.html",
      template: '<search-results></search-results>'
    })
    .state('designation-editor', {
      url: "/designation-editor.html",
      template: '<designation-editor></designation-editor>'
    });

  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/cart.html');
}

export default angular
  .module(componentName, [
    template.name,
    appConfig.name,
    commonModule.name,
    cartComponent.name,
    checkoutComponent.name,
    thankYouComponent.name,
    yourGivingComponent.name,
    productConfigComponent.name,
    signInComponent.name,
    searchResultsComponent.name,
    designationEditorComponent.name,
    paymentMethodsComponent.name,
    receiptsComponent.name,
    'ui.router',
    analyticsModule.name,
    analyticsRun.name,
  ])
  .config(routingConfig)
  .component(componentName, {
    controller: MainController,
    templateUrl: template.name
  });
