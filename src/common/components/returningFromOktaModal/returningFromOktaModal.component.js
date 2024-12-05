import angular from 'angular'
import includes from 'lodash/includes'
import sessionService, { Roles } from 'common/services/session/session.service'
import template from './returningFromOktaModal.tpl.html'
import signInButtonComponent from '../signInForm/signInButton/signInButton.component'

const componentName = 'returningFromOktaModal'

class returningFromOktaModalController {
  /* @ngInject */
  constructor (sessionService) {
    this.sessionService = sessionService
  }

  $onInit () {
    // Move to normal sign in if already registered with Cortex
    if (includes([Roles.identified, Roles.registered], this.sessionService.getRole())) {
      this.onStateChange({ state: 'sign-in' })
    }
  }

  onSuccessfulSignIn () {
    // Do nothing, as the sessionService will handle the redirect
  }
}

export default angular
  .module(componentName, [
    sessionService.name,
    signInButtonComponent.name
  ])
  .component(componentName, {
    controller: returningFromOktaModalController,
    templateUrl: template,
    bindings: {
      onStateChange: '&',
      onSuccess: '&',
      onFailure: '&',
      onCancel: '&',
      isInsideAnotherModal: '=',
      lastPurchaseId: '<'
    }
  })
