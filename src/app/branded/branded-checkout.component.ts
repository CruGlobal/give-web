import * as angular from 'angular';

import commonModule from 'common/common.module';
import step1 from './step-1/branded-checkout-step-1.component';
import step2 from './step-2/branded-checkout-step-2.component';
import thankYou from 'app/thankYou/thankYou.component';

import 'common/lib/fakeLocalStorage';

import * as template from './branded-checkout.tpl.html';

let componentName = 'brandedCheckout';

class BrandedCheckoutController{

  private checkoutStep: 'giftContactPayment' | 'review' | 'thankYou';
  /* @ngInject */
  constructor(private $window: Window){}

  $onInit() {
    this.checkoutStep = 'giftContactPayment';
  }

  next(){
    switch(this.checkoutStep){
      case 'giftContactPayment':
        this.checkoutStep = 'review';
        break;
      case 'review':
        this.checkoutStep = 'thankYou';
        break;
    }
    this.$window.scrollTo(0, 0);
  }

  previous(){
    switch(this.checkoutStep){
      case 'review':
        this.checkoutStep = 'giftContactPayment';
        break;
    }
    this.$window.scrollTo(0, 0);
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    step1.name,
    step2.name,
    thankYou.name
  ])
  .component(componentName, {
    controller: BrandedCheckoutController,
    template: template,
    bindings: {
      code: '@',
      campaignCode: '@'
    }
  });
