import angular from 'angular'
import 'angular-gettext'
import sessionService from 'common/services/session/session.service'
import template from './signInButton.tpl.html'

const componentName = 'signInButton'

class SignInButtonController {
  /* @ngInject */
  constructor ($log, $scope, $rootScope, $document, sessionService, gettext, envService) {
    this.$log = $log
    this.$scope = $scope
    this.$rootScope = $rootScope
    this.$document = $document
    this.$injector = angular.injector()
    this.sessionService = sessionService
    this.gettext = gettext
    this.imgDomain = envService.read('imgDomain')

    // Listen for location change success event
    this.$rootScope.$on('$locationChangeSuccess', () => {
      this.isSigningIn = false
    })
  }

  $onInit () {
    this.isSigningIn = false
    this.onSignInPage = this.onSignInPage || false
    console.log('called #0')

    this.sessionService.handleOktaRedirect()
      .subscribe((data) => {
        console.log('called #3')
        if (data) {
          // Successfully redirected from Okta
          this.onSuccess()
        }
      },
      error => {
        console.log('called #4')
        this.errorMessage = 'generic'
        this.$log.error('Failed to redirect from Okta', error)
        this.sessionService.removeLocationOnLogin()
        this.onFailure()
      }
      )
  }

  $onDestroy () {
    console.log('called #8')
    this.isSigningIn = false
  }

  signInWithOkta () {
    this.isSigningIn = true
    delete this.errorMessage
    console.log('called #7')
    this.sessionService.signIn(this.lastPurchaseId).subscribe(() => {
      console.log('called #1')
      this.isSigningIn = false
      const $injector = this.$injector
      if (!$injector.has('sessionService')) {
        $injector.loadNewModules(['sessionService'])
      }
      this.$document[0].body.dispatchEvent(
        new window.CustomEvent('giveSignInSuccess', { bubbles: true, detail: { $injector } }))
      this.onSuccess()
    }, error => {
      console.log('called #5')
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
