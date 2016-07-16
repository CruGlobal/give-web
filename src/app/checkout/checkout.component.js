import angular from 'angular';

import checkoutTemplate from './checkout.tpl';
import './checkout.css!';

class CheckoutController{

  /* @ngInject */
  constructor($log){
    $log.info('Loaded checkout controller');
  }

}

export default angular
  .module('checkout')
  .component('checkout', {
    controller: CheckoutController,
    templateUrl: checkoutTemplate.name
  });
