import angular from 'angular';
import 'angular-environment';
import appConfig from 'common/app.config';

import template from './paymentMethodDisplay.tpl';

let componentName = 'paymentMethodDisplay';

class PaymentMethodDisplayController{

  /* @ngInject */
  constructor(envService){
    this.imgDomain = envService.read('imgDomain');
  }

  getIcon(){
    return this.paymentMethod['card-type'] ? 'cc-'+this.paymentMethod['card-type'].toLowerCase() : 'bank';
  }
}

export default angular
  .module(componentName, [
    template.name,
    'environment',
    appConfig.name
  ])
  .component(componentName, {
    controller: PaymentMethodDisplayController,
    templateUrl: template.name,
    bindings: {
      paymentMethod: '<',
      withFaIcons: '@'
    }
  });
