import angular from 'angular'
import template from './retryModal.tpl.html'

const componentName = 'retryModal'

class RetryModalController {
}

export default angular
  .module(componentName, [])
  .component(componentName, {
    controller: RetryModalController,
    templateUrl: template,
    transclude: true,
    bindings: {
      title: '@',
      onRetry: '&',
      cancel: '&',
      previous: '&'
    }
  })
