import 'babel/external-helpers';
import angular from 'angular';

import cartService from 'common/services/api/cart.service';

import template from './cart.tpl';

let componentName = 'cart';

class CartController{

  /* @ngInject */
  constructor($log, cartService) {
    this.$log = $log;
    this.cartService = cartService;

    this.loadCart();
  }

  loadCart(){
    this.cartService.get()
      .then((data) => {
        this.$log.info('cart', data);
      });
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
