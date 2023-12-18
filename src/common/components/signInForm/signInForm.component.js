import angular from 'angular'
import 'angular-gettext'
import includes from 'lodash/includes'

import sessionService from 'common/services/session/session.service'

import template from './signInForm.tpl.html'

const componentName = 'signInForm'

class SignInFormController {
  /* @ngInject */
  constructor ($log, $scope, $document, $location, sessionService, gettext) {
    this.$log = $log
    this.$scope = $scope
    this.$document = $document
    this.$location = $location
    this.$injector = angular.injector()
    this.sessionService = sessionService
    this.gettext = gettext
  }

  $onInit () {
    this.isSigningIn = false
    if (includes(['IDENTIFIED', 'REGISTERED'], this.sessionService.getRole())) {
      this.username = this.sessionService.session.email
    }
    this.sessionService.handleOktaRedirect()
      .subscribe((data) => {
        if (data) {
          // Successfully redirected from Okta
          this.onSuccess()
        }
      },
      error => {
        this.errorMessage = 'generic'
        this.$log.error('Failed to redirect from Okta', error)
        this.onFailure()
      }
      )
    const autoLogin = this.$location.search()?.autoLogin
    if (autoLogin === 'true') this.signInWithOkta()
  }

  signInWithOkta () {
    this.isSigningIn = true
    delete this.errorMessage
    this.sessionService.oktaSignIn(this.lastPurchaseId).subscribe(() => {
      const $injector = this.$injector
      if (!$injector.has('sessionService')) {
        $injector.loadNewModules(['sessionService'])
      }
      this.$document[0].body.dispatchEvent(
        new window.CustomEvent('giveSignInSuccess', { bubbles: true, detail: { $injector } }))
      this.onSuccess()
    }, error => {
      this.isSigningIn = false
      if (error && error.config && error.config.data && error.config.data.password) {
        delete error.config.data.password
      }

      if (error && error.data && error.data.code && error.data.code === 'SIEB-DOWN') {
        this.$log.error('Siebel is down', error)
        this.errorMessage = error.data.message
      } else {
        this.$log.error('Sign In Error', error)
        this.errorMessage = 'generic'
      }
      this.$scope.$apply()
      this.onFailure()
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
      onStateChange: '&',
      lastPurchaseId: '<',
      onSignUpWithOkta: '&'
    }
  })
