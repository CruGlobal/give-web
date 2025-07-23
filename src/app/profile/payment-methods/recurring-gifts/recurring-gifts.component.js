import angular from 'angular';
import template from './recurring-gifts.tpl.html';

class recurringGiftsController {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}
}

const componentName = 'recurringGifts';

export default angular.module(componentName, []).component(componentName, {
  controller: recurringGiftsController,
  templateUrl: template,
  bindings: {
    gifts: '<',
  },
});
