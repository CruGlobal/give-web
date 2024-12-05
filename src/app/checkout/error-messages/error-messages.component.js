import angular from 'angular'

import template from './error-messages.tpl.html'

const componentName = 'errorMessages'

class ErrorMessagesController {
  /* @ngInject */
  constructor () /* eslint-disable-line no-useless-constructor */ {}
}

export default angular
  .module(componentName, [])
  .component(componentName, {
    controller: ErrorMessagesController,
    templateUrl: template,
    bindings: {
      errors: '<',
      submissionError: '<',
      submissionErrorStatus: '<'
    }
  })
