import angular from 'angular';
import 'angular-sanitize';
import template from './specialInstructions.tpl.html';

const componentName = 'specialInstructions';

class SpecialInstructionsController {
  /* @ngInject */
  constructor() {
    this.showRecipientComments = false;
    this.showDSComments = false;
  }

  $onInit() {}
}

export default angular
  .module(componentName, ['ngSanitize'])
  .component(componentName, {
    controller: SpecialInstructionsController,
    templateUrl: template,
    bindings: {
      productData: '<',
      itemConfig: '=',
    },
  });
