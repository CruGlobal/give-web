import angular from 'angular'
import 'angular-gettext'
import sessionService from 'common/services/session/session.service'
import signInButtonComponent from './signInButton/signInButton.component'
import template from './signInForm.tpl.html'

const componentName = 'signInForm'

class SignInFormController {
  /* @ngInject */
  constructor (sessionService, gettext) {
    this.$injector = angular.injector()
    this.sessionService = sessionService
    this.gettext = gettext
  }
}

export default angular
  .module(componentName, [
    sessionService.name,
    signInButtonComponent.name,
    'gettext'
  ])
  .component(componentName, {
    controller: SignInFormController,
    templateUrl: template,
    bindings: {
      onSuccess: '&',
      onFailure: '&',
      onStateChange: '&',
      lastPurchaseId: '<',
      onSignUpWithOkta: '&'
    }
  })
