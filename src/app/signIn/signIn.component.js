import angular from 'angular'
import signInForm from 'common/components/signInForm/signInForm.component'
import commonModule from 'common/common.module'
import showErrors from 'common/filters/showErrors.filter'
import analyticsFactory from 'app/analytics/analytics.factory'
import sessionService, { Roles, LoginOktaOnlyEvent } from 'common/services/session/session.service'
import sessionModalService from 'common/services/session/sessionModal.service'
import sessionEnforcerService, {
  EnforcerCallbacks,
  EnforcerModes
} from 'common/services/session/sessionEnforcer.service'
import orderService from 'common/services/api/order.service'
import template from './signIn.tpl.html'

const componentName = 'signIn'

class SignInController {
  /* @ngInject */
  constructor ($window, $log, $rootScope, sessionService, analyticsFactory, sessionModalService, sessionEnforcerService, orderService) {
    this.$window = $window
    this.$log = $log
    this.$rootScope = $rootScope
    this.sessionService = sessionService
    this.analyticsFactory = analyticsFactory
    this.sessionModalService = sessionModalService
    this.sessionEnforcerService = sessionEnforcerService
    this.orderService = orderService
  }

  $onInit () {
    this.subscription = this.sessionService.sessionSubject.subscribe(() => this.sessionChanged())
    this.analyticsFactory.pageLoaded()
    if (this.sessionService.hasLocationOnLogin()) {
      this.showRedirectingLoadingIcon = true
    } else {
      this.showRedirectingLoadingIcon = false
    }
  }

  $onDestroy () {
    this.subscription.unsubscribe()
  }

  sessionChanged () {
    if (this.sessionService.getRole() !== Roles.registered) {
      return
    }

    const redirectToLocationPriorToLogin = () => {
      this.showRedirectingLoadingIcon = true
      const locationToReturnUser = this.sessionService.hasLocationOnLogin()
      if (locationToReturnUser) {
        this.sessionService.removeLocationOnLogin()
        this.$window.location = locationToReturnUser
      } else {
        this.$window.location = `/checkout.html${window.location.search}`
      }
    }

    this.orderService.getDonorDetails()
      .subscribe((data) => {
        const registrationState = data['registration-state']
        if (registrationState === 'NEW' || registrationState === 'MATCHED') {
          this.showRedirectingLoadingIcon = false
          const modal = registrationState === 'NEW' 
            ? this.sessionModalService.registerAccount()
            : this.sessionModalService.userMatch()
          modal && modal.then(() => {
            redirectToLocationPriorToLogin()
          })
        } else {
          redirectToLocationPriorToLogin()
        }
      })
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

  getOktaUrl () {
    return this.sessionService.getOktaUrl()
  }

  onSignUpWithOkta () {
    this.sessionModalService.createAccount()
  }

  closeRedirectingLoading () {
    this.showRedirectingLoadingIcon = false
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    analyticsFactory.name,
    sessionService.name,
    sessionModalService.name,
    sessionEnforcerService.name,
    orderService.name,
    signInForm.name,
    showErrors.name
  ])
  .component(componentName, {
    controller: SignInController,
    templateUrl: template
  })
