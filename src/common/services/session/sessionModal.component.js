import angular from 'angular'

import signInModal from 'common/components/signInModal/signInModal.component'
import signUpModal from 'common/components/signUpModal/signUpModal.component'
import resetPasswordModal from 'common/components/resetPasswordModal/resetPasswordModal.component'
import forgotPasswordModal from 'common/components/forgotPasswordModal/forgotPasswordModal.component'
import userMatchModal from 'common/components/userMatchModal/userMatchModal.component'
import contactInfoModal from 'common/components/contactInfoModal/contactInfoModal.component'
import accountBenefitsModal from 'common/components/accountBenefitsModal/accountBenefitsModal.component'
import registerAccountModal from 'common/components/registerAccountModal/registerAccountModal.component'
import analyticsFactory from 'app/analytics/analytics.factory'

import { scrollModalToTop } from 'common/services/modalState.service'

import template from './sessionModal.tpl.html'

const componentName = 'sessionModal'

class SessionModalController {
  /* @ngInject */
  constructor (sessionService, analyticsFactory, $document) {
    this.sessionService = sessionService
    this.analyticsFactory = analyticsFactory
    this.$document = $document
    this.$injector = angular.injector()
    this.isLoading = false
    this.scrollModalToTop = scrollModalToTop
  }

  $onInit () {
    this.stateChanged(this.resolve.state)
    this.lastPurchaseId = this.resolve.lastPurchaseId
  }

  stateChanged (state) {
    this.state = state
    this.scrollModalToTop()
  }

  onSignInSuccess () {
    const $injector = this.$injector
    if (!$injector.has('sessionService')) {
      $injector.loadNewModules(['sessionService'])
    }
    this.$document[0].body.dispatchEvent(
      new window.CustomEvent('giveSignInSuccess', { bubbles: true, detail: { $injector } }))
    this.close()
  }

  onSignUpSuccess () {
    this.analyticsFactory.track('ga-sign-in-create-login')
    this.close()
  }

  onFailure () {
    this.dismiss({ $value: 'error' })
  }

  onCancel () {
    this.dismiss({ $value: 'cancel' })
  }

  setLoading (loading) {
    this.isLoading = !!loading
  }
}

export default angular
  .module(componentName, [
    signInModal.name,
    signUpModal.name,
    resetPasswordModal.name,
    forgotPasswordModal.name,
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
