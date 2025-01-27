import angular from 'angular'
import signInForm from 'common/components/signInForm/signInForm.component'
import commonModule from 'common/common.module'
import showErrors from 'common/filters/showErrors.filter'
import analyticsFactory from 'app/analytics/analytics.factory'
import sessionService, { Roles } from 'common/services/session/session.service'
import sessionModalService from 'common/services/session/sessionModal.service'
import template from './signIn.tpl.html'

const componentName = 'signIn'

class SignInController {
  /* @ngInject */
  constructor ($window, sessionService, analyticsFactory, sessionModalService) {
    this.$window = $window
    this.$log = $log
    this.sessionService = sessionService
    this.analyticsFactory = analyticsFactory
    this.sessionModalService = sessionModalService
  }

  $onInit () {
    this.subscription = this.sessionService.sessionSubject.subscribe(() => this.sessionChanged())
    this.analyticsFactory.pageLoaded()
  }

  $onDestroy () {
    this.subscription.unsubscribe()
  }

  sessionChanged () {
    if (this.sessionService.getRole() === Roles.registered) {
      this.$window.location = `/checkout.html${window.location.search}`
    }
  }

  checkoutAsGuest () {
    this.sessionService.downgradeToGuest(true).subscribe({
      error: () => {
        this.$window.location = `/checkout.html${window.location.search}`
      },
      complete: () => {
        this.$window.location = `/checkout.html${window.location.search}`
      }
    })
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    analyticsFactory.name,
    sessionService.name,
    sessionModalService.name,
    signInForm.name,
    showErrors.name
  ])
  .component(componentName, {
    controller: SignInController,
    templateUrl: template
  })
