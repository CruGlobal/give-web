import angular from 'angular'
import 'angular-gettext'
import sessionService from 'common/services/session/session.service'
import template from './signInButton.tpl.html'

const componentName = 'signInButton'

class SignInButtonController {
  /* @ngInject */
  constructor ($log, $scope, $document, sessionService, gettext, envService) {
    this.$log = $log
    this.$scope = $scope
    this.$document = $document
    this.$injector = angular.injector()
    this.sessionService = sessionService
    this.gettext = gettext
    this.imgDomain = envService.read('imgDomain')
  }

  $onInit () {
    this.isSigningIn = false
    this.onSignInPage = this.onSignInPage || false;

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
        this.sessionService.removeLocationOnLogin()
        this.onFailure()
      }
      )
  }

  signInWithOkta () {
    this.isSigningIn = true
    delete this.errorMessage
    this.sessionService.signIn(this.lastPurchaseId).subscribe(() => {
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
      this.sessionService.removeLocationOnLogin()
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
    controller: SignInButtonController,
    templateUrl: template,
    bindings: {
      onSuccess: '&',
      onFailure: '&',
      lastPurchaseId: '<',
      errorMessage: '=',
      onSignInPage: '<'
    }
  })
