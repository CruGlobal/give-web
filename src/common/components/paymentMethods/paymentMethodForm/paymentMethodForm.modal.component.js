import angular from 'angular';

import paymentMethodForm from './paymentMethodForm.component.js';

import template from './paymentMethodForm.modal.tpl.html';

let componentName = 'paymentMethodFormModal';

class PaymentMethodFormModalController {

  /* @ngInject */
  constructor() {

  }
}

export default angular
  .module(componentName, [
    paymentMethodForm.name
  ])
  .component(componentName, {
    controller: PaymentMethodFormModalController,
    template: template,
    bindings: {
      resolve: '<',
      dismiss: '&'
    }
  });
