import angular from 'angular'
import 'angular-gettext'
import includes from 'lodash/includes'

import sessionService from 'common/services/session/session.service'

import template from './signInForm.tpl.html'

const componentName = 'signInForm'

class SignInFormController {
  /* @ngInject */
  constructor ($log, sessionService, gettext) {
    this.$log = $log
    this.sessionService = sessionService
    this.gettext = gettext
  }

  $onInit () {
    this.isSigningIn = false
    this.signInState = 'identity'

    if (includes(['IDENTIFIED', 'REGISTERED'], this.sessionService.getRole())) {
      this.username = this.sessionService.session.email
    }
  }

  signIn () {
    this.isSigningIn = true
    delete this.errorMessage
    this.sessionService
      .signIn(this.username, this.password, this.mfa_token, this.trust_device, this.lastPurchaseId)
      .subscribe(() => {
        this.onSuccess()
      }, error => {
        this.isSigningIn = false
        if (error && error.data && error.data.error && error.data.error === 'invalid_grant' && error.data.thekey_authn_error) {
          switch (error.data.thekey_authn_error) {
            case 'mfa_required':
              if (this.signInState === 'mfa') {
                this.errorMessage = 'mfa'
                delete this.mfa_token
              }
              this.signInState = 'mfa'
              break
            case 'invalid_credentials':
            case 'stale_password':
            case 'email_unverified':
            default:
              this.errorMessage = 'Bad username or password'
              this.signInState = 'identity'
              this.onFailure()
          }
        } else {
          if (error && error.config && error.config.data && error.config.data.password) {
            delete error.config.data.password
          }
          this.$log.error('Sign In Error', error)
          this.signInState = 'identity'
          this.errorMessage = 'generic'
          this.onFailure()
        }
      })
  }
}

export default angular
  .module(componentName, [
    sessionService.name,
    'gettext'
  ])
  .component(componentName, {
    controller: SignInFormController,
    templateUrl: template,
    bindings: {
      onSuccess: '&',
      onFailure: '&',
      lastPurchaseId: '<'
    }
  })
