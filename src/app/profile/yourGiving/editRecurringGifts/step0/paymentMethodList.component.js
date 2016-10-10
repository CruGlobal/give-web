import angular from 'angular';

import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';

import template from './paymentMethodList.tpl';

let componentName = 'step0PaymentMethodList';

class PaymentMethodListController {

  /* @ngInject */
  constructor() {

  }

  $onInit(){
    // Select the first payment method
    this.selectedPaymentMethod = this.paymentMethods[0];
  }

  $onDestroy(){

  }
}

export default angular
  .module(componentName, [
    template.name,
    paymentMethodDisplay.name
  ])
  .component(componentName, {
    controller: PaymentMethodListController,
    templateUrl: template.name,
    bindings: {
      paymentMethods: '<',
      next: '&',
      dismiss: '&'
    }
  });
