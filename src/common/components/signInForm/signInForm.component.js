import angular from 'angular'
import 'angular-gettext'
import uibTooltip from 'angular-ui-bootstrap/src/tooltip'
import signInButtonComponent from './signInButton/signInButton.component'
import template from './signInForm.tpl.html'

const componentName = 'signInForm'

class SignInFormController {
  /* @ngInject */
  constructor (gettext) {
    this.$injector = angular.injector()
    this.gettext = gettext
  }

  $onInit () {
    this.onSignInPage = this.onSignInPage || false
  }
}

export default angular
  .module(componentName, [
    signInButtonComponent.name,
    uibTooltip,
    'gettext'
  ])
  .component(componentName, {
    controller: SignInFormController,
    templateUrl: template,
    bindings: {
      onSuccess: '&',
      onFailure: '&',
      onResetPassword: '&',
      lastPurchaseId: '<',
      // Optional if on-sign-in-page is true
      onSignUpWithOkta: '&?',
      onSignInPage: '<'
    }
  })
