import angular from 'angular'
import 'angular-gettext'
import sessionService, { Roles } from 'common/services/session/session.service'
import template from './accountBenefitsModal.tpl.html'
import signInButton from '../../../common/components/signInForm/signInButton/signInButton.component'

const componentName = 'accountBenefitsModal'

class AccountBenefitsModalController {
  /* @ngInject */
  constructor ($location, gettext, sessionService) {
    this.$location = $location
    this.gettext = gettext
    this.sessionService = sessionService
  }

  $onInit () {
    this.modalTitle = this.gettext('Register Your Account for Online Access')
    const shouldShowRegisterAccountModal = !!this.$location.search()?.code && !!this.$location.search()?.state
    if (shouldShowRegisterAccountModal) {
      this.onStateChange({ state: 'register-account' })
    }
  }

  registerAccount () {
    if (this.sessionService.getRole() === Roles.registered) {
      // No need to sign in if we already are
      this.onSuccess()
    } else {
      this.onStateChange({ state: 'sign-up' })
    }
  }

  onFailure () {
    this.sessionService.removeOktaRedirectIndicator()
  }
}

export default angular
  .module(componentName, [
    'gettext',
    sessionService.name,
    signInButton.name
  ])
  .component(componentName, {
    controller: AccountBenefitsModalController,
    templateUrl: template,
    bindings: {
      modalTitle: '=',
      onStateChange: '&',
      onSuccess: '&',
      onCancel: '&'
    }
  })
