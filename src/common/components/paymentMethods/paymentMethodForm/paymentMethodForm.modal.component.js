import angular from 'angular';

import paymentMethodForm from './paymentMethodForm.component.js';

import template from './paymentMethodForm.modal.tpl';

let componentName = 'paymentMethodFormModal';

class PaymentMethodFormModalController {

  /* @ngInject */
  constructor() {

  }

  onSubmit(success, data){
    this.resolve.onSubmit({success: success, data: data});
  }
}

export default angular
  .module(componentName, [
    template.name,
    paymentMethodForm.name
  ])
  .component(componentName, {
    controller: PaymentMethodFormModalController,
    templateUrl: template.name,
    bindings: {
      resolve: '<',
      dismiss: '&'
    }
  });
