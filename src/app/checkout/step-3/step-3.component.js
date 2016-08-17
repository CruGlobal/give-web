import angular from 'angular';

import cartService from 'common/services/api/cart.service';
import orderService from 'common/services/api/order.service';
import capitalizeFilter from 'common/filters/capitalize.filter';

import template from './step-3.tpl';

let componentName = 'checkoutStep3';

class Step3Controller{

  /* @ngInject */
  constructor(cartService, orderService, $log){
    this.cartService = cartService;
    this.orderService = orderService;
    this.$log = $log;
  }

  $onInit(){
    this.cartService.getDonorDetails()
      .subscribe((data) => {
        this.donorDetails = data;
      });

    this.orderService.getCurrentPayment()
      .subscribe((data) => {
        if(data.self.type === 'elasticpath.bankaccounts.bank-account') {
          this.bankAccountPaymentDetails = data;
        }else if(data.self.type === 'cru.creditcards.named-credit-card'){
          this.creditCardPaymentDetails = data;
        }else{
          this.$log.error('Error loading current payment info: current payment type is unknown');
        }
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
