import angular from 'angular';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import changeCaseObject from 'change-case-object';

import commonModule from 'common/common.module';
import step1 from './step-1/branded-checkout-step-1.component';
import step2 from './step-2/branded-checkout-step-2.component';
import thankYouSummary from 'app/thankYou/summary/thankYouSummary.component';

import 'common/lib/fakeLocalStorage';

import template from './branded-checkout.tpl.html';

let componentName = 'brandedCheckout';

class BrandedCheckoutController {

  /* @ngInject */
  constructor($window) {
    this.$window = $window;
  }

  $onInit() {
    this.checkoutStep = 'giftContactPayment';
    this.formatDonorDetails();
  }

  formatDonorDetails(){
    if(this.donorDetails){
      //change donorDetails to param-case but leave mailing address alone since this Angular app uses a different format than EP
      const mailingAddress = this.donorDetails.mailingAddress;
      this.donorDetails = changeCaseObject.paramCase(omit(this.donorDetails, 'mailingAddress'));
      this.donorDetails.mailingAddress = mailingAddress;
    }
  }

  next() {
    switch (this.checkoutStep) {
      case 'giftContactPayment':
        this.checkoutStep = 'review';
        break;
      case 'review':
        this.checkoutStep = 'thankYou';
        break;
    }
    this.$window.scrollTo(0, 0);
  }

  previous() {
    switch (this.checkoutStep) {
      case 'review':
        this.checkoutStep = 'giftContactPayment';
        break;
    }
    this.$window.scrollTo(0, 0);
  }

  onThankYouPurchaseLoaded(purchase) {
    this.onOrderCompleted({$event: {$window: this.$window, purchase: changeCaseObject.camelCase(pick(purchase, ['donorDetails', 'lineItems']))}});
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
      campaignCode: '@',
      amount: '@',
      frequency: '@',
      day: '@',
      donorDetails: '<',
      onOrderCompleted: '&'
    }
  });
