import angular from 'angular';
import every from 'lodash/every';

import productConfigForm from 'app/productConfig/productConfigForm/productConfigForm.component';
import contactInfo from 'common/components/contactInfo/contactInfo.component';
import checkoutStep2 from 'app/checkout/step-2/step-2.component';

import cartService from 'common/services/api/cart.service';

import template from './branded-checkout-step-1.tpl.html';

let componentName = 'brandedCheckoutStep1';

class BrandedCheckoutStep1Controller{

  /* @ngInject */
  constructor($log, cartService){
    this.$log = $log;
    this.cartService = cartService;
  }

  $onInit() {
    this.resetSubmission();
    this.initItemConfig();
    this.initCart();
  }

  initItemConfig(){
    this.itemConfig = {};
    this.itemConfig['campaign-code'] = this.campaignCode;
    this.itemConfig['campaign-page'] = this.campaignPage;
    this.itemConfig.amount = this.amount;
    switch(this.frequency){
      case 'monthly':
        this.defaultFrequency = 'MON';
        break;
      case 'quarterly':
        this.defaultFrequency = 'QUARTERLY';
        break;
      case 'annually':
        this.defaultFrequency = 'ANNUAL';
        break;
    }
    this.itemConfig['recurring-day-of-month'] = this.day;
  }

  initCart(){
    this.loadingProductConfig = true;
    this.errorLoadingProductConfig = false;

    this.cartService.get().subscribe(data => {
        const item = data.items && data.items[0];
        if (item) { // Edit first item from user's cart if it exits
          this.isEdit = true;
          this.item = item;
          this.code = item.code;
          this.itemConfig = item.config;

          //add campaign page
          this.itemConfig['campaign-page'] = this.campaignPage;
        }
        this.loadingProductConfig = false;
      },
      error => {
        this.errorLoadingProductConfig = true;
        this.loadingProductConfig = false;
        this.$log.error('Error loading cart data for branded checkout step 1', error);
      });
  }

  submit(){
    this.resetSubmission();
    this.submitted = true;
  }

  resetSubmission(){
    this.submission = {
      giftConfig: {
        completed: false,
        error: false
      },
      contactInfo: {
        completed: false,
        error: false
      },
      payment: {
        completed: false,
        error: false
      }
    };
  }

  onGiftConfigStateChange(state){
    switch(state){
      case 'submitted':
        this.submission.giftConfig.completed = true;
        this.isEdit = true;
        this.checkSuccessfulSubmission();
        break;
      case 'errorSubmitting':
      case 'errorAlreadyInCart':
        this.submission.giftConfig.completed = true;
        this.submission.giftConfig.error = true;
        this.checkSuccessfulSubmission();
        break;
    }
  }

  onContactInfoSubmit(success) {
    if (success) {
      this.submission.contactInfo.completed = true;
    }else{
      this.submission.contactInfo.completed = true;
      this.submission.contactInfo.error = true;
    }
    this.checkSuccessfulSubmission();
  }

  onPaymentStateChange(state){
    switch(state){
      case 'submitted':
        this.submission.payment.completed = true;
        this.checkSuccessfulSubmission();
        break;
      case 'errorSubmitting':
      case 'unsubmitted':
        this.submission.payment.completed = true;
        this.submission.payment.error = true;
        this.checkSuccessfulSubmission();
        this.onPaymentFailed({$event: {donorDetails: this.donorDetails}});
        break;
    }
  }

  checkSuccessfulSubmission(){
    if(every(this.submission, 'completed')){
      if(every(this.submission, {error: false})){
        this.next();
      }else{
        this.submitted = false;
      }
    }
  }
}

export default angular
  .module(componentName, [
    productConfigForm.name,
    contactInfo.name,
    checkoutStep2.name,
    cartService.name
  ])
  .component(componentName, {
    controller: BrandedCheckoutStep1Controller,
    templateUrl: template,
    bindings: {
      code: '<',
      campaignCode: '<',
      campaignPage: '<',
      amount: '<',
      frequency: '<',
      day: '<',
      donorDetails: '<',
      next: '&',
      onPaymentFailed: '&'
    }
  });
