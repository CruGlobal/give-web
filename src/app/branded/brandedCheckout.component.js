import angular from 'angular';
import find from 'lodash/find';
import every from 'lodash/every';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

import commonModule from 'common/common.module';

import productConfigForm from 'app/productConfig/productConfigForm/productConfigForm.component';
import contactInfo from 'common/components/contactInfo/contactInfo.component';
import checkoutStep2 from 'app/checkout/step-2/step-2.component';

import sessionService from 'common/services/session/session.service';
import cartService from 'common/services/api/cart.service';
import loading from 'common/components/loading/loading.component';

import 'common/lib/fakeLocalStorage';

import template from './brandedCheckout.tpl.html';

let componentName = 'brandedCheckout';

class BrandedCheckoutController{

  /* @ngInject */
  constructor($log, sessionService, cartService, analyticsFactory){
    this.$log = $log;
    this.sessionService = sessionService;
    this.cartService = cartService;
    this.analyticsFactory = analyticsFactory;

    this.resetSubmission();
  }

  $onInit() {
    this.loadingProductConfig = true;
    this.errorLoadingProductConfig = false;

    const downgradeSessionObservable = this.sessionService.downgradeToGuest(true)
      .catch(() => Observable.of('already guest'));

    const cartObservable = this.cartService.get()
      .do(data => {
        const item = find(data.items, {code: this.code});
        if(item){ // Edit first item with this code from user's cart if it exits
          this.isEdit = true;
          this.item = item;
        }
      });

    Observable.merge(downgradeSessionObservable, cartObservable)
      .subscribe(null,
        error => {
          this.errorLoadingProductConfig = true;
          this.loadingProductConfig = false;
          this.$log.error('Error loading cart for branded checkout', error);
        },
        () => {
          this.loadingProductConfig = false;
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
        this.checkSuccessfulSubmission();
        break;
      case 'errorSubmitting':
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
        break;
    }
  }

  checkSuccessfulSubmission(){
    if(every(this.submission, 'completed')){
      if(every(this.submission, {error: false})){
        this.$log.info('submitted forms successfully'); // TODO: transition to next page
        this.submitted = false; // TODO: remove
      }else{
        this.submitted = false;
      }
    }
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    productConfigForm.name,
    contactInfo.name,
    checkoutStep2.name,
    sessionService.name,
    cartService.name,
    loading.name
  ])
  .component(componentName, {
    controller: BrandedCheckoutController,
    templateUrl: template,
    bindings: {
      code: '@'
    }
  });
