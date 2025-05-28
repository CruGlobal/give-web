import angular from 'angular'
import 'angular-gettext'
import sessionService, { Roles } from 'common/services/session/session.service'
import signInForm from 'common/components/signInForm/signInForm.component'
import template from './signInModal.tpl.html'

const componentName = 'signInModal'

class SignInModalController {
  /* @ngInject */
  constructor ($window, gettext, sessionService) {
    this.$window = $window
    this.gettext = gettext
    this.sessionService = sessionService
    this.session = sessionService.session
  }

  $onInit () {
    this.modalTitle = this.gettext('Sign In')
    if (this.sessionService.getRole() === Roles.registered) {
      this.$window.location = `/checkout.html${window.location.search}`
    }
  }
}

export default angular
  .module(componentName, [
    'gettext',
    signInForm.name,
    sessionService.name
  ])
  .component(componentName, {
    controller: SignInModalController,
    templateUrl: template,
    bindings: {
      modalTitle: '=',
      lastPurchaseId: '<',
      // Called when the user clicks the create account link
      onSignUp: '&',
      onSuccess: '&',
      onFailure: '&',
    }
  })
