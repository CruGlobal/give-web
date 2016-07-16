import angular from 'angular';

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
    checkoutTemplate.name
  ])
  .config(ConfigureModule);
