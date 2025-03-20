import angular from 'angular'
import commonModule from 'common/common.module'
import showErrors from 'common/filters/showErrors.filter'
import sessionService from 'common/services/session/session.service'
import sessionModalService from 'common/services/session/sessionModal.service'
import orderService from 'common/services/api/order.service'
import verificationService from 'common/services/api/verification.service'
import template from './oktaAuthCallback.tpl.html'

const componentName = 'oktaAuthCallback'
export const unknownErrorMessage = 'Failed to authenticate user when redirecting from Okta. Please try to sign in again.'

class OktaAuthCallbackController {
  /* @ngInject */
  constructor ($log, $window, sessionService, sessionModalService, orderService, verificationService) {
    this.$log = $log
    this.$window = $window
    this.sessionService = sessionService
    this.sessionModalService = sessionModalService
    this.orderService = orderService
    this.verificationService = verificationService
  }

  $onInit () {
    this.initializeVariables()
    this.sessionService.handleOktaRedirect()
      .subscribe({
        next: (data) => this.onSignInSuccess(data),
        error: (error) => this.onSignInFailure(error)
      })
  }

  $onDestroy () {
    if (angular.isDefined(this.verificationServiceSubscription)) {
      this.verificationServiceSubscription.unsubscribe()
    }
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
        if (registrationState === 'NEW') {
          this.isLoading = false
          const isValid = this.areRequiredFieldsFilled(data)
          if (isValid) {
            this.postDonorMatches()
          } else {
            this.openContactInfoModalThenRedirect()
          }
        } else if (registrationState === 'MATCHED') {
          this.isLoading = false
          this.openUserMatchModalThenRedirect()
        } else {
          this.redirectToLocationPriorToLogin()
        }
      })
  }

  openUserMatchModalThenRedirect () {
    this.sessionModalService.userMatch().then(() => {
      this.redirectToLocationPriorToLogin()
    })
  }

  openContactInfoModalThenRedirect () {
    this.sessionModalService.registerAccount({ dismissable: false }).then(() => {
      this.redirectToLocationPriorToLogin()
    })
  }

  postDonorMatches () {
    if (angular.isDefined(this.verificationServiceSubscription)) {
      this.verificationServiceSubscription.unsubscribe()
    }
    this.verificationServiceSubscription = this.verificationService.postDonorMatches().subscribe({
      next: () => this.openUserMatchModalThenRedirect(),
      error: () => this.openContactInfoModalThenRedirect()
    })
  }

  areRequiredFieldsFilled (donorDetails) {
    const requiredFields = [
      'name.given-name',
      'name.family-name',
      'email',
      'donor-type',
      'mailingAddress.country',
      'mailingAddress.streetAddress'
    ]

    if (donorDetails['donor-type'] === 'Organization') {
      requiredFields.push('organization-name')
    }
    if (donorDetails.mailingAddress.country === 'US') {
      requiredFields.push(
        'mailingAddress.locality',
        'mailingAddress.region',
        'mailingAddress.postalCode'
      )
    }

    return requiredFields.every(field => {
      // Split the field name into individual keys to handle nested objects.
      // For example, 'mailingAddress.streetAddress' becomes ['mailingAddress', 'streetAddress'].
      const keys = field.split('.')
      // Check if each key's value returns a truthy value.
      // If any property is falsy, the reduce function returns a falsy value,
      // and the every method returns false.
      return keys.reduce((obj, key) => obj && obj[key], donorDetails)
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
    verificationService.name,
    showErrors.name
  ])
  .component(componentName, {
    controller: OktaAuthCallbackController,
    templateUrl: template
  })
