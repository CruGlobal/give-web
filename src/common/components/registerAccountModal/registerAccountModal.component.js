import angular from 'angular'
import template from './registerAccountModal.tpl.html'

import cartService from 'common/services/api/cart.service'
import orderService from 'common/services/api/order.service'
import sessionService, { Roles, LoginOktaOnlyEvent } from 'common/services/session/session.service'
import verificationService from 'common/services/api/verification.service'
import { scrollModalToTop } from 'common/services/modalState.service'

import signInModal from 'common/components/signInModal/signInModal.component'
import signUpModal from 'common/components/signUpModal/signUpModal.component'
import signUpActivationModal from 'common/components/signUpActivationModal/signUpActivationModal.component'
import userMatchModal from 'common/components/userMatchModal/userMatchModal.component'
import contactInfoModal from 'common/components/contactInfoModal/contactInfoModal.component'
import failedVerificationModal from 'common/components/failedVerificationModal/failedVerificationModal.component'

const componentName = 'registerAccountModal'

class RegisterAccountModalController {
  // Register Account Modal is a multi-step process.
  // 1. Sign In/Up
  //  1.1 Enter Sign Up Details
  //  1.2 Verify Email
  // 2. Fetch Donor Details
  // 3. Collect Contact Info
  // 4. Post to Donor Matches
  // 5. Complete User Match

  /* @ngInject */
  constructor ($element, $rootScope, $window, cartService, orderService, sessionService, verificationService, envService, gettext) {
    this.element = $element[0]
    this.$rootScope = $rootScope
    this.$window = $window
    this.cartService = cartService
    this.orderService = orderService
    this.sessionService = sessionService
    this.verificationService = verificationService
    this.gettext = gettext
    this.scrollModalToTop = scrollModalToTop
    this.imgDomain = envService.read('imgDomain')
  }

  $onInit () {
    this.$rootScope.$on(LoginOktaOnlyEvent, () => {
      this.getDonorDetails()
    })

    // Ensure loading icon isn't rendered on screen.
    this.sessionService.removeOktaRedirectIndicator()

    this.cartCount = 0
    this.getTotalQuantitySubscription = this.cartService.getTotalQuantity().subscribe({
      next: (count) => { this.cartCount = count },
      error: () => { this.cartCount = 0 }
    })

    // Step 1. Sign-In/Up (skipped if already Signed In)
    if (this.sessionService.getRole() === Roles.registered) {
      // Proceed to Step 2
      this.getDonorDetails()
    } else {
      // Proceed to Step 1.
      this.stateChanged('sign-in')
    }

    // If there is a session chnage, update the state if needed.
    this.subscription = this.sessionService.sessionSubject.subscribe(() => {
      if (this.sessionService.getRole() === Roles.registered) {
        // Proceed to Step 2
        this.getDonorDetails()
      }
    })
  }

  $onDestroy () {
    this.getTotalQuantitySubscription.unsubscribe()
    this.subscription.unsubscribe()
    if (angular.isDefined(this.getDonorDetailsSubscription)) this.getDonorDetailsSubscription.unsubscribe()
    if (angular.isDefined(this.verificationServiceSubscription)) this.verificationServiceSubscription.unsubscribe()
  }

  onIdentitySuccess () {
    // Success Sign-In/Up, Proceed to Step 2.
    this.getDonorDetails()
  }

  onIdentityFailure () {
    this.sessionService.removeOktaRedirectIndicator()
  }

  onContactInfoSuccess () {
    // Success gathering contact info, Proceed to Step 4
    this.postDonorMatches()
  }

  onUserMatchSuccess () {
    // User Match Success, Register Account Workflow complete
    this.onSuccess()
  }

  getDonorDetails () {
    // Show loading state
    this.modalTitle = this.gettext('Checking your donor account')
    this.stateChanged('loading')

    // Step 2. Fetch Donor Details
    if (angular.isDefined(this.getDonorDetailsSubscription)) this.getDonorDetailsSubscription.unsubscribe()
    this.getDonorDetailsSubscription = this.orderService.getDonorDetails().subscribe({
      next: (donorDetails) => {
        // Workflow Complete if 'registration-state' is COMPLETED
        if (donorDetails['registration-state'] === 'COMPLETED') {
          this.onSuccess()
        } else if (donorDetails['registration-state'] === 'FAILED') {
          this.stateChanged('failed-verification')
        } else {
          // Proceed to Step 3
          this.stateChanged('contact-info')
        }
      },
      error: () => this.stateChanged('contact-info') // Error fetching donor details, proceed to step 3.
    })
  }

  postDonorMatches () {
    this.setLoading({ loading: true })

    // Step 4. Post to Donor Matches.
    if (angular.isDefined(this.verificationServiceSubscription)) this.verificationServiceSubscription.unsubscribe()
    this.verificationServiceSubscription = this.verificationService.postDonorMatches().subscribe({
      next: () => { this.stateChanged('user-match') }, // Donor match success, Proceed to step 5.
      error: () => { this.onCancel() } // Donor Match failed, Register Account workflow failed
    })
  }

  stateChanged (state) {
    this.element.dataset.state = state
    this.setModalSize(this.$window.screen.width >= 1200 ? 'lg' : state === 'contact-info' ? undefined : 'sm')

    this.state = state
    if (!this.sessionService.isOktaRedirecting()) {
      this.setLoading({ loading: false })
    }
    this.scrollModalToTop()
  }

  setModalSize (size) {
    // Modal size is unchangeable after initialization. This fetches the modal and changes the size classes.
    const modal = angular.element(document.getElementsByClassName('session-modal'))
    modal.removeClass('modal-sm modal-md modal-lg')
    if (angular.isDefined(size)) {
      modal.addClass(`modal-${size}`)
    }
  }
}

export default angular
  .module(componentName, [
    contactInfoModal.name,
    cartService.name,
    orderService.name,
    sessionService.name,
    signInModal.name,
    signUpModal.name,
    signUpActivationModal.name,
    userMatchModal.name,
    failedVerificationModal.name,
    verificationService.name
  ])
  .component(componentName, {
    controller: RegisterAccountModalController,
    templateUrl: template,
    bindings: {
      firstName: '=',
      modalTitle: '=',
      onSuccess: '&',
      onCancel: '&',
      setLoading: '&'
    }
  })
