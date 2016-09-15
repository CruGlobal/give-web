import angular from 'angular';

import addNewPaymentMethod from './addNewPaymentMethod.component';

import template from './addNewPaymentMethod.modal.tpl';

let componentName = 'addNewPaymentMethodModal';

class AddNewPaymentMethodModalController {

  /* @ngInject */
  constructor() {

  }

  onSubmit(success, data){
    this.resolve.onSubmit({success: success, data: data});
    this.submitted = false;
  }
}

export default angular
  .module(componentName, [
    template.name,
    addNewPaymentMethod.name
  ])
  .component(componentName, {
    controller: AddNewPaymentMethodModalController,
    templateUrl: template.name,
    bindings: {
      resolve: '<',
      dismiss: '&'
    }
  });
