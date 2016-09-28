import angular from 'angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

import displayAddressComponent from 'common/components/display-address/display-address.component';
import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component';
import loadingComponent from 'common/components/loading/loading.component';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';

import orderService, {existingPaymentMethodFlag} from 'common/services/api/order.service';
import capitalizeFilter from 'common/filters/capitalize.filter';
import desigSrcDirective from 'common/directives/desigSrc.directive';

import template from './step-3.tpl';

let componentName = 'checkoutStep3';

class Step3Controller{

  /* @ngInject */
  constructor(orderService, $window, $log){
    this.orderService = orderService;
    this.$window = $window;
    this.$log = $log;
  }

  $onInit(){
    this.loadDonorDetails();
    this.loadCurrentPayment();
    this.loadBillingAddress();
    this.checkErrors();
  }

  $onChanges(changes) {
    if (changes.submit && changes.submit.currentValue === true) {
      this.submitOrder();
    }
  }

  loadDonorDetails(){
    this.orderService.getDonorDetails()
      .subscribe((data) => {
        this.donorDetails = data;
      });
  }

  loadCurrentPayment(){
    this.orderService.getCurrentPayment()
      .subscribe((data) => {
        if(!data){
          this.$log.error('Error loading current payment info: current payment doesn\'t seem to exist');
        }else if(data.self.type === 'elasticpath.bankaccounts.bank-account') {
          this.bankAccountPaymentDetails = data;
        }else if(data.self.type === 'cru.creditcards.named-credit-card'){
          this.creditCardPaymentDetails = data;
        }else{
          this.$log.error('Error loading current payment info: current payment type is unknown');
        }
      });
  }

  loadBillingAddress(){
    this.orderService.getBillingAddress()
      .subscribe((data) => {
        this.billingAddress = data.address;
      });
  }

  checkErrors(){
    this.orderService.checkErrors()
      .subscribe((data) => {
        this.needinfoErrors = data;
      });
  }

  canSubmitOrder(){
    let enableSubmitBtn = !!(this.cartData && this.donorDetails && (this.bankAccountPaymentDetails || this.creditCardPaymentDetails) && !this.needinfoErrors);
    enableSubmitBtn = enableSubmitBtn && !this.submittingOrder;
    this.onSubmitBtnChangeState({
      $event: {
        enabled: enableSubmitBtn
      }
    });
    return enableSubmitBtn;
  }

  submitOrder(){
    delete this.submissionError;
    // Prevent multiple submissions
    if(this.submittingOrder) return;
    this.onSubmittingOrder({value: true});

    let submitRequest;
    if(this.bankAccountPaymentDetails){
      submitRequest = this.orderService.submit();
    }else if(this.creditCardPaymentDetails){
      let encryptedCcv = this.orderService.retrieveCardSecurityCode();
      if(encryptedCcv === existingPaymentMethodFlag){
        submitRequest = this.orderService.submit();
      }else{
        submitRequest = encryptedCcv ? this.orderService.submit(encryptedCcv) : Observable.throw('Submitting a credit card purchase requires a CCV and the CCV was not retrieved correctly');
      }
    }else{
      submitRequest = Observable.throw('Current payment type is unknown');
    }
    submitRequest.subscribe(() => {
        this.onSubmittingOrder({value: false});
        this.orderService.clearCardSecurityCode();
        this.onSubmitted();
        this.$window.location.href = 'thank-you.html';
      },
      (error) => {
        this.onSubmittingOrder({value: false});
        this.$log.error('Error submitting purchase:', error);
        this.onSubmitted();
        this.submissionError = error;
      });
  }
}

export default angular
  .module(componentName, [
    template.name,
    displayAddressComponent.name,
    displayRateTotals.name,
    loadingComponent.name,
    orderService.name,
    capitalizeFilter.name,
    desigSrcDirective.name,
    loadingOverlay.name
  ])
  .component(componentName, {
    controller: Step3Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&',
      cartData: '<',
      submit: '<',
      onSubmitBtnChangeState: '&',
      onSubmitted: '&',
      onSubmittingOrder: '&',
      submittingOrder: '<'
    }
  });
