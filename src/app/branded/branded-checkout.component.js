import angular from 'angular';

import commonModule from 'common/common.module';
import step1 from './step-1/branded-checkout-step-1.component';
import step2 from './step-2/branded-checkout-step-2.component';
import thankYouSummary from 'app/thankYou/summary/thankYouSummary.component';

import 'common/lib/fakeLocalStorage';

import template from './branded-checkout.tpl.html';

let componentName = 'brandedCheckout';

class BrandedCheckoutController{

  /* @ngInject */
  constructor($window){
    this.$window = $window;
  }

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
    thankYouSummary.name
  ])
  .component(componentName, {
    controller: BrandedCheckoutController,
    templateUrl: template,
    bindings: {
      code: '@',
      campaignCode: '@'
    }
  });
