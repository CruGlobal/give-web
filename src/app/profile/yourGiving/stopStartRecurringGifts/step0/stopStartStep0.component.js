import angular from 'angular';
import template from './stopStartStep0.tpl.html';

const componentName = 'stopStartStep0';

class StopStartStep0Controller {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}
}

export default angular.module(componentName, []).component(componentName, {
  controller: StopStartStep0Controller,
  templateUrl: template,
  bindings: {
    giftAction: '<',
    changeState: '&',
    cancel: '&',
  },
});
