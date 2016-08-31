import angular from 'angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

import displayAddressComponent from 'common/components/display-address/display-address.component';

import orderService from 'common/services/api/order.service';
import capitalizeFilter from 'common/filters/capitalize.filter';

import template from './step-3.tpl';

let componentName = 'checkoutStep3';

class Step3Controller{

  /* @ngInject */
  constructor(orderService, $log){
    this.orderService = orderService;
    this.$log = $log;
  }

  $onInit(){
    this.loadDonorDetails();
    this.loadCurrentPayment();
    this.loadBillingAddress();
    this.checkErrors();
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
        this.errors = data;
      });
  }

  canSubmitOrder(){
    return !!(this.cartData && this.donorDetails && (this.bankAccountPaymentDetails || this.creditCardPaymentDetails) && !this.errors);
  }

  submitOrder(){
    let submitRequest;
    if(this.bankAccountPaymentDetails){
      submitRequest = this.orderService.submit();
    }else if(this.creditCardPaymentDetails){
      let encryptedCcv = this.orderService.retrieveCardSecurityCode();
      submitRequest = encryptedCcv ? this.orderService.submit(encryptedCcv) : Observable.throw('Submitting a credit card purchase requires a CCV and the CCV was not retrieved correctly');
    }else{
      submitRequest = Observable.throw('Current payment type is unknown');
    }
    submitRequest.subscribe(() => {
        this.orderService.clearCardSecurityCode();
        this.$log.info('Submitted purchase successfully');
        // TODO: transition to thank you page
      },
      (error) => {
        this.$log.error('Error submitting purchase:', error);
        // TODO: show error message
      });
  }
}

export default angular
  .module(componentName, [
    template.name,
    displayAddressComponent.name,
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
