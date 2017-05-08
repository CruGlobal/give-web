import angular from 'angular';

import paymentMethodForm from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.component';
import existingPaymentMethods from './existingPaymentMethods/existingPaymentMethods.component';

import orderService from 'common/services/api/order.service';
import {SignInEvent} from 'common/services/session/session.service';
import analyticsFactory from 'app/analytics/analytics.factory';
import {scrollModalToTop} from 'common/services/modalState.service';

import template from './step-2.tpl.html';

let componentName = 'checkoutStep2';

class Step2Controller{

  /* @ngInject */
  constructor($window, $log, $scope, orderService, analyticsFactory){
    this.$window = $window;
    this.$log = $log;
    this.$scope = $scope;
    this.orderService = orderService;
    this.analyticsFactory = analyticsFactory;
    this.scrollModalToTop = scrollModalToTop;

    this.$scope.$on(SignInEvent, () => {
      this.$onInit();
    });
  }

  $onInit(){
    this.loadingPaymentMethods = true;
    this.existingPaymentMethods = true;
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

  onPaymentFormStateChange($event){
    this.paymentFormState = $event.state;
    if($event.state === 'loading' && $event.payload){
      const request = $event.update ?
        this.orderService.updatePaymentMethod($event.paymentMethodToUpdate, $event.payload) :
        this.orderService.addPaymentMethod($event.payload);
      request.subscribe(() => {
          if($event.stayOnStep){
            this.paymentFormState = 'success';
          }else{
            this.changeStep({newStep: 'review'});
          }
        },
        error => {
          if(error.status !== 409) {
            this.$log.error('Error saving payment method', error);
          }
          this.paymentFormState = 'error';
          this.paymentFormError = error.data;
          if(this.existingPaymentMethods){
            this.scrollModalToTop();
          }else{
            this.$window.scrollTo(0, 0);
          }
        });
    }else if($event.state === 'loading') {
      this.changeStep({newStep: 'review'});
    }
  }
}

export default angular
  .module(componentName, [
    paymentMethodForm.name,
    existingPaymentMethods.name,
    orderService.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: Step2Controller,
    templateUrl: template,
    bindings: {
      changeStep: '&'
    }
  });
