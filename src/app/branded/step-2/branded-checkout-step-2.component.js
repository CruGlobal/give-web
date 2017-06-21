import angular from 'angular';
import checkoutStep3 from 'app/checkout/step-3/step-3.component';

import template from './branded-checkout-step-2.tpl.html';

let componentName = 'brandedCheckoutStep2';

class BrandedCheckoutStep2Controller{

  /* @ngInject */
  constructor($log, cartService){
    this.$log = $log;
    this.cartService = cartService;
  }

  $onInit() {
    this.loadCart();
  }

  loadCart() {
    this.errorLoadingCart = false;
    this.cartService.get()
      .subscribe(
        data => this.cartData = data,
        () => this.errorLoadingCart = true
      );
  }

  changeStep(newStep){
    if(newStep === 'thankYou'){
      this.next();
    }else{
      this.previous();
    }
  }
}

export default angular
  .module(componentName, [
    checkoutStep3.name
  ])
  .component(componentName, {
    controller: BrandedCheckoutStep2Controller,
    templateUrl: template,
    bindings: {
      previous: '&',
      next: '&'
    }
  });
