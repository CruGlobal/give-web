import angular from 'angular'

import template from './checkout-error-messages.tpl.html'

const componentName = 'checkoutErrorMessages'

class CheckoutErrorMessagesController {
  /* @ngInject */
  constructor () /* eslint-disable-line no-useless-constructor */ {}
}

export default angular
  .module(componentName, [])
  .component(componentName, {
    controller: CheckoutErrorMessagesController,
    templateUrl: template,
    bindings: {
      errors: '<',
      submissionError: '<',
      submissionErrorStatus: '<'
    }
  })
