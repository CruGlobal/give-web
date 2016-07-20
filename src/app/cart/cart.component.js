import 'babel/external-helpers';
import angular from 'angular';

import cartService from 'common/services/api/cart.service';

import template from './cart.tpl';

let componentName = 'cart';

class CartController{

  /* @ngInject */
  constructor($log, cartService){
    $log.info(cartService);
  }

}

export default angular
  .module(componentName, [
    template.name,
    cartService.name
  ])
  .component(componentName, {
    controller: CartController,
    templateUrl: template.name
  });
