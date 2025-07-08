import angular from 'angular';

import template from './checkout-error-messages.tpl.html';

const componentName = 'checkoutErrorMessages';

class CheckoutErrorMessagesController {}

export default angular.module(componentName, []).component(componentName, {
  controller: CheckoutErrorMessagesController,
  templateUrl: template,
  bindings: {
    needinfoErrors: '<',
    submissionError: '<',
    submissionErrorStatus: '<',
  },
});
