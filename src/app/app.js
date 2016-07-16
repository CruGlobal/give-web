/* eslint angular/module-getter:0, angular/document-service:0 */
import 'babel/external-helpers';

import angular from 'angular';
import 'angular-ui-router';
import 'ocLazyLoad';

import './main/main';
//import 'common/core';
import routing from 'common/utils/routing';

let app = angular.module('app', [
    'ui.router',
    'oc.lazyLoad',
    'main'
  ])
  .config(routing(angular.module('app')))
  .config(appConfig);

/* @ngInject */
function appConfig($urlRouterProvider, $locationProvider, $compileProvider, $logProvider, $httpProvider, $ocLazyLoadProvider, $windowProvider) {
  var $window = $windowProvider.$get();

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
  $httpProvider.useApplyAsync(true);
  $urlRouterProvider.otherwise('/checkout');

  if($window.prod){
    $logProvider.debugEnabled(false);
    // http://ng-perf.com/2014/10/24/simple-trick-to-speed-up-your-angularjs-app-load-time/
    $compileProvider.debugInfoEnabled(false);
  }

  $ocLazyLoadProvider.config({
    debug: true
  });
}

angular.element(document).ready(function() {
  angular.bootstrap(document.body, [ app.name ], {
    strictDi: true
  });
});

export default app;
