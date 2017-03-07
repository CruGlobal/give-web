import angular from 'angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

import displayAddressComponent from 'common/components/display-address/display-address.component';
import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component';

import orderService, {existingPaymentMethodFlag} from 'common/services/api/order.service';
import capitalizeFilter from 'common/filters/capitalize.filter';
import desigSrcDirective from 'common/directives/desigSrc.directive';
import {cartUpdatedEvent} from 'common/components/nav/navCart/navCart.component';

import template from './step-3.tpl';

import analyticsFactory from 'app/analytics/analytics.factory';

let componentName = 'checkoutStep3';

class Step3Controller{

  /* @ngInject */
  constructor(orderService, $window, $scope, $log, analyticsFactory){
    this.orderService = orderService;
    this.$window = $window;
    this.$scope = $scope;
    this.$log = $log;
    this.analyticsFactory = analyticsFactory;
  }

  $onInit(){
    this.loadDonorDetails();
    this.loadCurrentPayment();
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
      },
      error => {
        this.$log.error('Error loading donorDetails', error);
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
      },
      error => {
        this.$log.error('Error loading current payment info', error);
      });
  }

  checkErrors(){
    this.orderService.checkErrors()
      .subscribe((data) => {
        this.needinfoErrors = data;
      },
      error => {
        this.$log.error('Error loading checkErrors', error);
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
      const cvv = this.orderService.retrieveCardSecurityCode();
      if(cvv === existingPaymentMethodFlag){
        submitRequest = this.orderService.submit();
      }else{
        submitRequest = cvv ? this.orderService.submit(cvv) : Observable.throw('Submitting a credit card purchase requires a CVV and the CVV was not retrieved correctly');
      }
    }else{
      submitRequest = Observable.throw('Current payment type is unknown');
    }
    submitRequest.subscribe(() => {
        this.analyticsFactory.purchase(this.donorDetails, this.cartData);
        this.onSubmittingOrder({value: false});
        this.orderService.clearCardSecurityCode();
        this.onSubmitted();
        this.$scope.$emit( cartUpdatedEvent );
        this.$window.location = '/thank-you.html';
      },
      error => {
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
    orderService.name,
    capitalizeFilter.name,
    desigSrcDirective.name,
    analyticsFactory.name
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
