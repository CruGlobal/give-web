import angular from 'angular'
import 'angular-gettext'
import uibTooltip from 'angular-ui-bootstrap/src/tooltip'
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
    this.needHelpAccordionOpened = false
  }

  $onInit () {
    this.onSignInPage = this.onSignInPage || false
  }

  toggleNeedHelpAccordion () {
    this.needHelpAccordionOpened = !this.needHelpAccordionOpened
  };

  getOktaUrl () {
    return this.sessionService.getOktaUrl()
  }
}

export default angular
  .module(componentName, [
    sessionService.name,
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
      lastPurchaseId: '<',
      // Optional if on-sign-in-page is true
      onSignUpWithOkta: '&?',
      onSignInPage: '<'
    }
  })
