import angular from 'angular';

import bankAccount from './bank-account/bank-account.component';
import creditCard from './credit-card/credit-card.component';
import existingPaymentMethods from './existingPaymentMethods/existingPaymentMethods.component';

import template from './step-2.tpl';

let componentName = 'checkoutStep2';

class Step2Controller{

  /* @ngInject */
  constructor($log, envService){
    this.$log = $log;

    this.paymentType = 'bankAccount';
    this.submitted = false;
    this.imgDomain = envService.read('imgDomain');
    this.loadingPaymentMethods = true;
    this.existingPaymentMethods = false;
  }

  changePaymentType(type){
    this.paymentType = type;
    this.submitted = false;
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

  onSave(success){
    if(success){
      this.changeStep({newStep: 'review'});
    }else{
      this.submitted = false;
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    bankAccount.name,
    creditCard.name,
    existingPaymentMethods.name
  ])
  .component(componentName, {
    controller: Step2Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&'
    }
  });
