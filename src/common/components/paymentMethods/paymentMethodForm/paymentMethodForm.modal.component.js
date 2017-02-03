import angular from 'angular';

import paymentMethodForm from './paymentMethodForm.component.js';

import template from './paymentMethodForm.modal.tpl';

let componentName = 'paymentMethodFormModal';

class PaymentMethodFormModalController {

  /* @ngInject */
  constructor() {

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
