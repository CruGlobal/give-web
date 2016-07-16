import angular from 'angular';
import 'angular-ui-router';

import checkoutTemplate from './checkout.tpl';
import './checkout.css!';

class CheckoutController{

  /* @ngInject */
  constructor($log){
    this.test = 5;
    $log.info('Loaded checkout controller');
  }

}

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
  .config(ConfigureModule)
  .component('checkout', {
    controller: CheckoutController,
    templateUrl: checkoutTemplate.name
  });
