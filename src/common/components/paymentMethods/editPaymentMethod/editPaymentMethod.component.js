import angular from 'angular';

import bankAccountForm from '../bankAccountForm/bankAccountForm.component';
import creditCardForm from '../creditCardForm/creditCardForm.component';

import template from './editPaymentMethod.tpl';

let componentName = 'editPaymentMethod';

class editPaymentMethodController{

  /* @ngInject */
  constructor(envService){
    this.submitted = false;
    this.imgDomain = envService.read('imgDomain');
  }

}

export default angular
  .module(componentName, [
    template.name,
    bankAccountForm.name,
    creditCardForm.name
  ])
  .component(componentName, {
    controller: editPaymentMethodController,
    templateUrl: template.name,
    bindings: {
      paymentType: '<',
      submitted: '<',
      onSubmit: '&'
    }
  });
