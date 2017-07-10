import angular from 'angular';
import template from './retryModal.tpl.html';

let componentName = 'retryModal';

class RetryModalController {

  /* @ngInject */
  constructor() {
  }
}

export default angular
  .module(componentName, [])
  .component(componentName, {
    controller: RetryModalController,
    template: template,
    transclude: true,
    bindings: {
      title: '@',
      onRetry: '&',
      cancel: '&',
      previous: '&'
    }
  });
