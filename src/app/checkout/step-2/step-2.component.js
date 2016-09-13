import angular from 'angular';

import addNewPaymentMethod from 'common/components/paymentMethods/addNewPaymentMethod/addNewPaymentMethod.component';
import existingPaymentMethods from './existingPaymentMethods/existingPaymentMethods.component';

import orderService from 'common/services/api/order.service';

import template from './step-2.tpl';

let componentName = 'checkoutStep2';

class Step2Controller{

  /* @ngInject */
  constructor($log, orderService){
    this.$log = $log;
    this.orderService = orderService;

    this.submitted = false;
    this.loadingPaymentMethods = true;
    this.existingPaymentMethods = true;
  }

  handleExistingPaymentLoading(success, hasExistingPaymentMethods, error){
    if(success){
      this.existingPaymentMethods = hasExistingPaymentMethods;
    }else{
      this.$log.warn('Error loading existing payment methods', error);
      //TODO: should we show the user that there was an error or should we let them just add a new payment method
    }
    this.loadingPaymentMethods = false;
  }

  onSubmit(success, data){
    if(success && data){
      this.orderService.addPaymentMethod(data)
        .subscribe(() => {
            this.changeStep({newStep: 'review'});
          },
          (error) => {
            this.$log.error('Error saving payment method', error);
            this.submitted = false;
          });
    }else if(success){
      this.changeStep({newStep: 'review'});
    }else{
      this.submitted = false;
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    addNewPaymentMethod.name,
    existingPaymentMethods.name,
    orderService.name
  ])
  .component(componentName, {
    controller: Step2Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&'
    }
  });
