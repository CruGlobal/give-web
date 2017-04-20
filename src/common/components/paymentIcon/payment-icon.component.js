import angular from 'angular';
import template from './payment-icon.tpl';

let componentName = 'paymentIcon';

class paymentIconController {
  /* @ngInject */
  constructor(envService) {
    this.imgDomain = envService.read('imgDomain');
  }

  getPath(){
    return this.type
      ? 'cc-icons/' + this.type.toLowerCase().replace(' ','-') + '-curved-128px'
      : 'icon-bank';
  }
}

export default angular
  .module( componentName, [
    template.name
  ])
  .component( componentName, {
    controller:  paymentIconController,
    templateUrl: template.name,
    bindings: {
      type: '<'
    }
  });
