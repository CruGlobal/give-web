import angular from 'angular';
import 'angular-ui-router';

import checkoutTemplate from './checkout.tpl';

/* @ngInject */
function ConfigureModule($stateProvider){
  $stateProvider.state('checkout', {
    url: '/checkout',
    template: '<checkout></checkout>'
  });
}

export default angular
  .module('checkout', [
    checkoutTemplate.name,
    'ui.router'
  ])
  .config(ConfigureModule);
