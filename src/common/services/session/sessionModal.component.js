import angular from 'angular'

import signInModal from 'common/components/signInModal/signInModal.component'
import signUpModal from 'common/components/signUpModal/signUpModal.component'
import signUpActivationModal from 'common/components/signUpActivationModal/signUpActivationModal.component'
import userMatchModal from 'common/components/userMatchModal/userMatchModal.component'
import contactInfoModal from 'common/components/contactInfoModal/contactInfoModal.component'
import accountBenefitsModal from 'common/components/accountBenefitsModal/accountBenefitsModal.component'
import registerAccountModal from 'common/components/registerAccountModal/registerAccountModal.component'
import analyticsFactory from 'app/analytics/analytics.factory'

import { scrollModalToTop } from 'common/services/modalState.service'
import { LoginOktaOnlyEvent } from 'common/services/session/session.service'

import template from './sessionModal.tpl.html'

const componentName = 'sessionModal'

class SessionModalController {
  /* @ngInject */
  constructor ($rootScope, sessionService, analyticsFactory) {
    this.$rootScope = $rootScope
    this.$document = $document
    this.sessionService = sessionService
    this.analyticsFactory = analyticsFactory
    this.$injector = angular.injector()
    this.isLoading = false
    this.scrollModalToTop = scrollModalToTop
  }

  $onInit () {
    this.$rootScope.$on(LoginOktaOnlyEvent, (event, state) => {
      this.stateChanged(state)
    })
    this.subscription = this.sessionService.sessionSubject.subscribe((session) => {
      this.firstName = session.first_name
    })
    this.stateChanged(this.resolve.state)
    this.lastPurchaseId = this.resolve.lastPurchaseId
    if (this.sessionService.isOktaRedirecting()) {
      this.setLoading({ loading: true })
    }
  }

  $onDestroy () {
    this.subscription.unsubscribe()
  }

  stateChanged (state) {
    this.state = state
    this.scrollModalToTop()
    this.setLoading(!!this.sessionService.isOktaRedirecting())
  }

  onSignInSuccess () {
    this.sessionService.removeOktaRedirectIndicator()
    this.close()
  }

  onSignUpSuccess () {
    this.analyticsFactory.track('ga-sign-in-create-login')
    this.sessionService.removeOktaRedirectIndicator()
    this.close()
  }

  onAccountBenefitsSuccess () {
    this.sessionService.removeOktaRedirectIndicator()
    this.stateChanged('register-account')
  }

  onFailure () {
    this.sessionService.removeOktaRedirectIndicator()
    this.dismiss({ $value: 'error' })
  }

  onCancel () {
    this.sessionService.removeOktaRedirectIndicator()
    this.dismiss({ $value: 'cancel' })
  }

  setLoading (loading) {
    this.isLoading = !!loading
  }

  onSignUpActivationSuccess () {
    this.stateChanged('register-account')
  }
}

export default angular
  .module(componentName, [
    signInModal.name,
    signUpModal.name,
    signUpActivationModal.name,
    userMatchModal.name,
    contactInfoModal.name,
    accountBenefitsModal.name,
    registerAccountModal.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: SessionModalController,
    templateUrl: template,
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    }
  })
