import angular from 'angular';

import paymentMethodForm from './paymentMethodForm.component.js';

import template from './paymentMethodForm.modal.tpl.html';

const componentName = 'paymentMethodFormModal';

class PaymentMethodFormModalController {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}
}

export default angular
  .module(componentName, [paymentMethodForm.name])
  .component(componentName, {
    controller: PaymentMethodFormModalController,
    templateUrl: template,
    bindings: {
      resolve: '<',
      dismiss: '&',
    },
  });
