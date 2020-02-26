import angular from 'angular'
import template from './failedVerificationModal.tpl.html'

const componentName = 'failedVerificationModal'

class FailedVerificationModalController {
  /* @ngInject */
  constructor () /* eslint-disable-line no-useless-constructor */ {}
}

export default angular
  .module(componentName, [])
  .component(componentName, {
    controller: FailedVerificationModalController,
    templateUrl: template,
    bindings: {
      title: '@',
      onOk: '&'
    }
  })
