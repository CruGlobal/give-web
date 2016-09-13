import angular from 'angular';

import bankAccountForm from '../bankAccountForm/bankAccountForm.component';
import creditCardForm from '../creditCardForm/creditCardForm.component';

import template from './addNewPaymentMethod.tpl';

let componentName = 'addNewPaymentMethod';

class AddNewPaymentMethodController{

  /* @ngInject */
  constructor($log, envService){
    this.$log = $log;

    this.paymentType = 'bankAccount';
    this.submitted = false;
    this.imgDomain = envService.read('imgDomain');
  }

  changePaymentType(type){
    this.paymentType = type;
    this.onSubmit({success: false});
  }

  onChildSubmit(success, data){
    this.onSubmit({success: success, data: data});
    if(!success){
      this.onSubmit({success: false});
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    bankAccountForm.name,
    creditCardForm.name
  ])
  .component(componentName, {
    controller: AddNewPaymentMethodController,
    templateUrl: template.name,
    bindings: {
      submitted: '<',
      onSubmit: '&'
    }
  });
