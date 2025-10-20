import angular from 'angular';
import template from './specialInstructions.tpl.html';

const componentName = 'specialInstructions';

class SpecialInstructionsController {}

export default angular.module(componentName, []).component(componentName, {
  controller: SpecialInstructionsController,
  templateUrl: template,
  bindings: {
    productData: '<',
    itemConfig: '=',
  },
});
