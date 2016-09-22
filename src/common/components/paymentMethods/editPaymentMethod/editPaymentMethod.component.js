import angular from 'angular';

import bankAccountForm from '../bankAccountForm/bankAccountForm.component';
import creditCardForm from '../creditCardForm/creditCardForm.component';

import template from './editPaymentMethod.tpl';

let componentName = 'editPaymentMethod';

class editPaymentMethodController{

  /* @ngInject */
  constructor(envService){
    this.imgDomain = envService.read('imgDomain');
  }

  onSubmit(success, data){
    console.log(data)
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
      model: '<',
      paymentType: '<',
      submitted: '<'
    }
  });
