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

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/forkJoin'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import merge from 'lodash/merge'

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
      this.checkDonorDetails()
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
      this.checkDonorDetails()
    } else {
      // Proceed to Step 1.
      this.stateChanged('sign-in')
    }

    // If there is a session change, update the state if needed.
    this.subscription = this.sessionService.sessionSubject.subscribe(() => {
      if (this.sessionService.getRole() === Roles.registered) {
        // Proceed to Step 2
        this.checkDonorDetails()
      }
    })
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

  // Called after the user finishes creating a new Okta account
  onSignUpSuccess (signUpDonorDetails) {
    this.checkDonorDetails(signUpDonorDetails)
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
    // Success gathering contact info, Proceed to Step 4
    this.postDonorMatches()
  }

  onUserMatchSuccess () {
    // User Match Success, Register Account Workflow complete
    this.onSuccess()
  }

  checkDonorDetails (signUpDonorDetails) {
    // Show loading state
    this.modalTitle = this.gettext('Checking your donor account')
    this.stateChanged('loading')

    // Step 2. Fetch Donor Details
    if (angular.isDefined(this.getDonorDetailsSubscription)) {
      this.getDonorDetailsSubscription.unsubscribe()
    }
    this.getDonorDetailsSubscription = this.orderService.getDonorDetails().switchMap((donorDetails) => {
      if (signUpDonorDetails && donorDetails['registration-state'] === 'NEW') {
        // Save the contact info from signup
        merge(donorDetails, signUpDonorDetails)

        // Send each of the requests and pass donorDetails to the next step after the requests complete
        return Observable.forkJoin([
          this.orderService.updateDonorDetails(donorDetails),
          this.orderService.addEmail(donorDetails.email, donorDetails.emailFormUri)
        ]).map(() => donorDetails).do({
          error: () => {
            // If there was an error, save the donor details from sign up so that they will be added
            // to the contact info form. The error handler below will change the step to contact-info.
            this.signUpDonorDetails = signUpDonorDetails
          }
        })
      }

      // Pass donorDetails to the next step
      return Observable.of(donorDetails)
    }).subscribe({
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
    if ((!this.welcomeBack && state === 'sign-in') || state === 'sign-up') {
      // Use a small modal for sign in modals without a welcome back message and for sign up modals
      // regardless of the screen size because they can't take advantage of the extra width
      this.setModalSize('sm')
    } else if (this.$window.innerWidth >= 1200) {
      // Use a large modal on wide screens for other modals
      this.setModalSize('lg')
    } else if (state === 'contact-info') {
      // Use a medium modal for contact info modals, even on narrow screens, because they need the extra width
      this.setModalSize('md')
    } else {
      // Use a small modal for all other modals on narrow screens
      this.setModalSize('sm')
    }

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
      firstName: '=',
      modalTitle: '=',
      // If true, show the "Welcome back!" message in the header/sidebar
      welcomeBack: '<?',
      lastPurchaseId: '<',
      onSuccess: '&',
      onCancel: '&',
      setLoading: '&'
    }
  })
