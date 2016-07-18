/* eslint angular/module-getter:0, angular/document-service:0 */
import 'babel/external-helpers';

// Import packages
import angular from 'angular';
import 'angular-ui-router';

// Import app code
import mainComponent from './main/main.component';
//import 'common/core';

let app = angular.module('app', [
    'ui.router',
    mainComponent.name
  ])
  .config(appConfig);

/* @ngInject */
function appConfig($urlRouterProvider, $locationProvider, $compileProvider, $logProvider, $httpProvider, $windowProvider) {
  var $window = $windowProvider.$get();

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
  $httpProvider.useApplyAsync(true);
  $urlRouterProvider.otherwise('/checkout/step-1');

  if($window.prod){
    $logProvider.debugEnabled(false);
    // http://ng-perf.com/2014/10/24/simple-trick-to-speed-up-your-angularjs-app-load-time/
    $compileProvider.debugInfoEnabled(false);
  }
}

export default app;
