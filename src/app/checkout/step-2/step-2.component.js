import angular from 'angular';

import paymentMethodForm from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.component';
import existingPaymentMethods from './existingPaymentMethods/existingPaymentMethods.component';

import orderService from 'common/services/api/order.service';

import template from './step-2.tpl';

import analyticsFactory from 'app/analytics/analytics.factory';

let componentName = 'checkoutStep2';

class Step2Controller{

  /* @ngInject */
  constructor($log, orderService, analyticsFactory){
    this.$log = $log;
    this.orderService = orderService;

    this.loadingPaymentMethods = true;
    this.existingPaymentMethods = true;
    this.submissionError = {error: ''};
    this.analyticsFactory = analyticsFactory;
  }

  $onInit(){
    this.loadDonorDetails();
  }

  loadDonorDetails(){
    this.orderService.getDonorDetails()
      .subscribe((data) => {
        this.mailingAddress = data.mailingAddress;
      },
      error => {
        this.$log.error('Error loading donorDetails', error);
      });
  }

  handleExistingPaymentLoading(success, hasExistingPaymentMethods, error){
    if(success){
      this.existingPaymentMethods = hasExistingPaymentMethods;
    }else{
      this.existingPaymentMethods = false;
      this.$log.warn('Error loading existing payment methods', error);
      this.loadingExistingPaymentError = error;
    }
    this.loadingPaymentMethods = false;
  }

  onSubmit(success, data, error, stayOnStep){
    this.submissionError.error = '';
    this.submitSuccess = false;

    if(success && data){
      this.orderService.addPaymentMethod(data)
        .subscribe(() => {
          if(stayOnStep){
            this.submitSuccess = true;
          }else{
            this.changeStep({newStep: 'review'});
          }
        },
        (error) => {
          this.$log.error('Error saving payment method', error);
          this.submissionError.loading = false;
          this.submissionError.error = error.data;
        });
    }else if(success){
      this.changeStep({newStep: 'review'});
    }else{
      this.submissionError.loading = false;
      this.submissionError.error = error;
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    paymentMethodForm.name,
    existingPaymentMethods.name,
    orderService.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: Step2Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&'
    }
  });
