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
  // 2. Fetch Donor Details
  // 3. Collect Contact Info
  // 4. Post to Donor Matches
  // 5. Complete User Match

  /* @ngInject */
  constructor ($element, $rootScope, $window, cartService, orderService, sessionService, verificationService, gettext) {
    this.element = $element[0]
    this.$rootScope = $rootScope
    this.$window = $window
    this.cartService = cartService
    this.orderService = orderService
    this.sessionService = sessionService
    this.verificationService = verificationService
    this.gettext = gettext
    this.scrollModalToTop = scrollModalToTop
  }

  $onInit () {
    this.$rootScope.$on(LoginOktaOnlyEvent, () => {
      this.getDonorDetails()
    })

    this.cartCount = 0
    // TODO: Do we need to unsubscribe from this?
    this.cartService.getTotalQuantity().subscribe(count => {
      this.cartCount = count
    }, () => {
      this.cartCount = 0
    })

    // Step 1. Sign-In/Up (skipped if already Signed In)
    if (this.sessionService.getRole() === Roles.registered) {
      // Proceed to Step 2
      this.getDonorDetails()
    } else {
      // Proceed to Step 1.
      this.stateChanged('sign-in')
    }
  }

  onIdentitySuccess () {
    // Success Sign-In/Up, Proceed to Step 2.
    this.getDonorDetails()
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
    this.orderService.getDonorDetails().subscribe((donorDetails) => {
      // Workflow Complete if 'registration-state' is COMPLETED
      if (donorDetails['registration-state'] === 'COMPLETED') {
        this.onSuccess()
      } else if (donorDetails['registration-state'] === 'FAILED') {
        this.stateChanged('failed-verification')
      } else {
        // Proceed to Step 3
        this.stateChanged('contact-info')
      }
    }, () => {
      // Error fetching donor details, proceed to step 3.
      this.stateChanged('contact-info')
    })
  }

  postDonorMatches () {
    this.setLoading({ loading: true })

    // Step 4. Post to Donor Matches.
    this.verificationService.postDonorMatches().subscribe(() => {
      // Donor match success, Proceed to step 5.
      this.stateChanged('user-match')
    }, () => {
      // Donor Match failed, Register Account workflow failed
      this.onCancel()
    })
  }

  stateChanged (state) {
    if (state === 'sign-in') {
      this.element.classList.add('sign-in')
    } else {
      this.element.classList.remove('sign-in')
    }

    switch (state) {
      case 'contact-info':
        this.setModalSize()
        break
      default:
        this.setModalSize(this.$window.screen.width >= 1200 ? 'lg' : 'sm')
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
