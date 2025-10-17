import angular from 'angular';
import 'angular-sanitize';
import template from './specialInstructions.tpl.html';

const componentName = 'specialInstructions';

class SpecialInstructionsController {
  /* @ngInject */
  constructor() {}

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
