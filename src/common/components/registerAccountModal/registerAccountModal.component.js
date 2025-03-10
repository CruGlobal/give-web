import angular from 'angular'
import template from './registerAccountModal.tpl.html'

import cartService from 'common/services/api/cart.service'
import orderService from 'common/services/api/order.service'
import sessionService, { Roles, LoginOktaOnlyEvent } from 'common/services/session/session.service'
import verificationService from 'common/services/api/verification.service'
import { scrollModalToTop } from 'common/services/modalState.service'

import signInModal from 'common/components/signInModal/signInModal.component'
import signUpModal from 'common/components/signUpModal/signUpModal.component'
import userMatchModal from 'common/components/userMatchModal/userMatchModal.component'
import contactInfoModal from 'common/components/contactInfoModal/contactInfoModal.component'
import failedVerificationModal from 'common/components/failedVerificationModal/failedVerificationModal.component'

const componentName = 'registerAccountModal'

class RegisterAccountModalController {
  // Register Account Modal is a multi-step process.
  // 1. Sign In/Up
  //  1.1 Sign in or Sign Up
  //  1.2 Verify Email
  //  1.3 Sign In
  // 2. Fetch Donor Details
  // 3. Collect Contact Info
  // 4. Post to Donor Matches
  // 5. Complete User Match

  /* @ngInject */
  constructor ($element, $rootScope, $window, $document, cartService, orderService, sessionService, verificationService, envService, gettext) {
    this.element = $element[0]
    this.$rootScope = $rootScope
    this.$window = $window
    this.$document = $document
    this.cartService = cartService
    this.orderService = orderService
    this.sessionService = sessionService
    this.verificationService = verificationService
    this.gettext = gettext
    this.scrollModalToTop = scrollModalToTop
    this.imgDomain = envService.read('imgDomain')
    this.newUser = sessionService.getRole() === Roles.public
    this.$injector = angular.injector()
  }

  $onInit () {
    this.$rootScope.$on(LoginOktaOnlyEvent, () => {
      this.checkDonorDetails()
    })

    // Ensure loading icon isn't rendered on screen.
    this.sessionService.removeOktaRedirectIndicator()

    this.cartCount = 0
    this.getTotalQuantitySubscription = this.cartService.getTotalQuantity().subscribe({
      next: (count) => { this.cartCount = count },
      error: () => { this.cartCount = 0 }
    })

    // If there is a session change, update the state if needed.
    this.subscription = this.sessionService.sessionSubject.subscribe(() => {
      // Step 1. Sign-In/Up (skipped if already Signed In)
      if (this.sessionService.getRole() === Roles.registered) {
        // Proceed to Step 2
        this.checkDonorDetails()
      } else {
        // Proceed to Step 1.
        this.stateChanged('sign-in')
      }
    })
    this.cortexSignUpError = false
  }

  $onDestroy () {
    this.getTotalQuantitySubscription.unsubscribe()
    this.subscription.unsubscribe()
    if (angular.isDefined(this.getDonorDetailsSubscription)) {
      this.getDonorDetailsSubscription.unsubscribe()
    }
    if (angular.isDefined(this.verificationServiceSubscription)) {
      this.verificationServiceSubscription.unsubscribe()
    }
  }

  // Called if there was an error saving the Cortex sign up details.
  onSignUpError (signUpDonorDetails) {
    // Save the donor details so that they can be added to the contact info form, so the user can try again.
    this.signUpDonorDetails = signUpDonorDetails
    this.cortexSignUpError = true
    this.stateChanged('contact-info')
  }

  // Called when the user requests to sign up from the sign in modal
  onSignUp () {
    this.stateChanged('sign-up')
  }

  onSignIn () {
    this.stateChanged('sign-in')
  }

  onIdentitySuccess () {
    this.sessionService.removeOktaRedirectIndicator()

    // Success Sign-In/Up, Proceed to Step 2.
    this.checkDonorDetails()
  }

  onIdentityFailure () {
    this.sessionService.removeOktaRedirectIndicator()
  }

  onContactInfoSuccess () {
    // If a Cortex error occurred during sign up, redirect user to okta to continue the sign up process.
    if (this.cortexSignUpError) {
      this.redirectToOktaForLogin()
      return
    }
    // Success gathering contact info, Proceed to Step 4
    this.postDonorMatches()
  }

  onUserMatchSuccess () {
    // User Match Success, Register Account Workflow complete
    this.onSuccess()
  }

  checkDonorDetails () {
    // Show loading state
    this.stateChanged('loading-donor')

    // Step 2. Fetch Donor Details
    if (angular.isDefined(this.getDonorDetailsSubscription)) {
      this.getDonorDetailsSubscription.unsubscribe()
    }
    this.getDonorDetailsSubscription = this.orderService.getDonorDetails().subscribe({
      next: (donorDetails) => {
        // Workflow Complete if 'registration-state' is COMPLETED
        if (donorDetails['registration-state'] === 'COMPLETED') {
          this.onSuccess()
        } else if (donorDetails['registration-state'] === 'MATCHED') {
          this.onContactInfoSuccess()
        } else if (donorDetails['registration-state'] === 'FAILED') {
          this.stateChanged('user-match')
        } else {
          // Proceed to Step 3
          this.stateChanged('contact-info')
        }
      },
      error: () => this.stateChanged('contact-info') // Error fetching donor details, proceed to step 3.
    })
  }

  postDonorMatches () {
    // Step 4. Post to Donor Matches.
    if (angular.isDefined(this.verificationServiceSubscription)) {
      this.verificationServiceSubscription.unsubscribe()
    }
    this.verificationServiceSubscription = this.verificationService.postDonorMatches().subscribe({
      next: () => { this.stateChanged('user-match') }, // Donor match success, Proceed to step 5.
      error: () => { this.onCancel() } // Donor Match failed, Register Account workflow failed
    })
  }

  stateChanged (state) {
    this.element.dataset.state = state
    this.setModalSize(state === 'contact-info' ? 'lg' : 'md')

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
    modal.addClass(`modal-${size}`)
  }

  redirectToOktaForLogin () {
    this.sessionService.signIn(this.lastPurchaseId).subscribe(() => {
      const $injector = this.$injector
      if (!$injector.has('sessionService')) {
        $injector.loadNewModules(['sessionService'])
      }

      this.$document[0].body.dispatchEvent(
        new window.CustomEvent('giveSignInSuccess', { bubbles: true, detail: { $injector } })
      )
    })
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
    userMatchModal.name,
    failedVerificationModal.name,
    verificationService.name
  ])
  .component(componentName, {
    controller: RegisterAccountModalController,
    templateUrl: template,
    bindings: {
      modalTitle: '=',
      lastPurchaseId: '<',
      onSuccess: '&',
      onCancel: '&',
      setLoading: '&',
      hideCloseButton: '<?'
    }
  })
