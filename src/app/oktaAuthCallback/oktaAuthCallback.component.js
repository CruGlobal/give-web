import angular from 'angular'
import commonModule from 'common/common.module'
import showErrors from 'common/filters/showErrors.filter'
import sessionService from 'common/services/session/session.service'
import sessionModalService from 'common/services/session/sessionModal.service'
import orderService from 'common/services/api/order.service'
import template from './oktaAuthCallback.tpl.html'

const componentName = 'oktaAuthCallback'
export const unknownErrorMessage = 'Failed to authenticate user when redirecting from Okta. Please try to sign in again.'

class OktaAuthCallbackController {
  /* @ngInject */
  constructor ($log, $window, sessionService, sessionModalService, orderService) {
    this.$log = $log
    this.$window = $window
    this.sessionService = sessionService
    this.sessionModalService = sessionModalService
    this.orderService = orderService
  }

  $onInit () {
    this.initializeVariables()
    this.sessionService.handleOktaRedirect()
      .subscribe({
        next: (data) => this.onSignInSuccess(data),
        error: (error) => this.onSignInFailure(error)
      })
  }

  initializeVariables () {
    this.noticeToUser = 'Authenticating...'
    this.isLoading = true
    this.errorMessage = ''
  }

  onSignInSuccess (data) {
    if (!data) {
      this.onSignInFailure(data)
      return
    }
    this.orderService.getDonorDetails()
      .subscribe((data) => {
        const registrationState = data['registration-state']
        if (registrationState === 'NEW' || registrationState === 'MATCHED') {
          this.isLoading = false
          const modal = registrationState === 'NEW'
            ? this.sessionModalService.nonDismissibleRegisterAccount()
            : this.sessionModalService.userMatch()
          modal && modal.then(() => {
            this.redirectToLocationPriorToLogin()
          })
        } else {
          this.redirectToLocationPriorToLogin()
        }
      })
  }

  onSignInFailure (error) {
    const errorMessage = error || unknownErrorMessage
    this.$log.error(errorMessage)
    this.sessionService.removeLocationOnLogin()
    this.errorMessage = errorMessage
  }

  redirectToLocationPriorToLogin () {
    this.noticeToUser = 'Redirecting to prior location...'
    this.isLoading = true
    const previousLocation = this.sessionService.getLocationOnLogin()
    if (previousLocation) {
      this.sessionService.removeLocationOnLogin()
      this.$window.location = previousLocation
    } else {
      this.$window.location = `/checkout.html${window.location.search}`
    }
  }

  redirectToSignInPage () {
    this.$window.location = '/sign-in.html'
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    sessionService.name,
    sessionModalService.name,
    orderService.name,
    showErrors.name
  ])
  .component(componentName, {
    controller: OktaAuthCallbackController,
    templateUrl: template
  })
