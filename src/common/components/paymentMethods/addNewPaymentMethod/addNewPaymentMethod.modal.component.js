import angular from 'angular';

import addNewPaymentMethod from './addNewPaymentMethod.component';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component.js';

import template from './addNewPaymentMethod.modal.tpl';

let componentName = 'addNewPaymentMethodModal';

class AddNewPaymentMethodModalController {

  /* @ngInject */
  constructor() {

  }

  onSubmit(success, data){
    if(data) {
      this.resolve.onSubmit({success: success, data: data});
      this.submitted = false;
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    addNewPaymentMethod.name,
    loadingOverlay.name
  ])
  .component(componentName, {
    controller: AddNewPaymentMethodModalController,
    templateUrl: template.name,
    bindings: {
      resolve: '<',
      dismiss: '&'
    }
  });
