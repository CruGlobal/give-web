import angular from 'angular';
import template from './retryModal.tpl';

let componentName = 'retryModal';

class RetryModalController {

  /* @ngInject */
  constructor() {
  }
}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: RetryModalController,
    templateUrl: template.name,
    transclude: true,
    bindings: {
      title: '@',
      onRetry: '&',
      cancel: '&',
      previous: '&'
    }
  });
