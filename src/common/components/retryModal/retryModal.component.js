import angular from 'angular';
import template from './retryModal.tpl.html';

const componentName = 'retryModal';

class RetryModalController {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}
}

export default angular.module(componentName, []).component(componentName, {
  controller: RetryModalController,
  templateUrl: template,
  transclude: true,
  bindings: {
    title: '@',
    onRetry: '&',
    cancel: '&',
    previous: '&',
  },
});
