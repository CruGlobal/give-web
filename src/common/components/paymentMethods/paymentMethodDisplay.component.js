import angular from 'angular';
import appConfig from 'common/app.config';

import template from './paymentMethodDisplay.tpl';

let componentName = 'paymentMethodDisplay';

class PaymentMethodDisplayController{

  /* @ngInject */
  constructor(envService){
    this.imgDomain = envService.read('imgDomain');
  }
}

export default angular
  .module(componentName, [
    template.name,
    appConfig.name
  ])
  .component(componentName, {
    controller: PaymentMethodDisplayController,
    templateUrl: template.name,
    bindings: {
      paymentMethod: '<'
    }
  });
