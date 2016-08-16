import angular from 'angular';

import cartService from 'common/services/api/cart.service';
import orderService from 'common/services/api/order.service';
import capitalizeFilter from 'common/filters/capitalize.filter';

import template from './step-3.tpl';

let componentName = 'checkoutStep3';

class Step3Controller{

  /* @ngInject */
  constructor(cartService, orderService){
    this.cartService = cartService;
    this.orderService = orderService;

    this.init();
  }

  init(){
    this.cartService.getDonorDetails()
      .subscribe((data) => {
        this.donorDetails = data;
      });

    this.orderService.getCurrentPayment()
      .subscribe((data) => {
        this.paymentDetails = data;
      });
  }
}

export default angular
  .module(componentName, [
    template.name,
    cartService.name,
    orderService.name,
    capitalizeFilter.name
  ])
  .component(componentName, {
    controller: Step3Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&',
      cartData: '<'
    }
  });
