import angular from 'angular'
import includes from 'lodash/includes'
import OktaSignIn from '@okta/okta-signin-widget'
import sessionService, { Roles } from 'common/services/session/session.service'
import orderService from 'common/services/api/order.service'
import template from './signUpModal.tpl.html'
import cartService from 'common/services/api/cart.service'
require('assets/okta-sign-in/css/okta-sign-in.min.css')

const componentName = 'signUpModal'

class SignUpModalController {
  /* @ngInject */
  constructor ($log, $scope, $rootScope, $location, $window, sessionService, cartService, orderService, envService) {
    this.$log = $log
    this.$scope = $scope
    this.$rootScope = $rootScope
    this.$location = $location
    this.$window = $window
    this.sessionService = sessionService
    this.orderService = orderService
    this.cartService = cartService
    this.imgDomain = envService.read('imgDomain')
    this.publicCru = envService.read('publicCru')
  }

  $onInit () {
    if (includes([Roles.identified, Roles.registered], this.sessionService.getRole())) {
      this.onStateChange({ state: 'sign-in' })
    }
    this.$window.currentStep = 1 // Default to step 1
    this.oktaSignInWidget = new OktaSignIn({
      ...this.sessionService.oktaSignInWidgetDefaultOptions,
      assets: {
        baseUrl: `${this.$window.location.origin}/assets/okta-sign-in/`
      },
      flow: 'signup',
      registration: {
        parseSchema: (schema, onSuccess) => {
          const step = this.$window.currentStep || 1
          const steps = {
            // Step 1: Name and email
            1: [schema[0], schema[1], schema[2]],
            // Step 2: Address plus phone number
            2: [schema[3], schema[4], schema[5], schema[6], schema[8]],
            // Step 3: Password
            3: [schema[8]]
          }
          onSuccess(steps[step])
        },
        preSubmit: (postData, onSuccess) => {
          const step = this.$window.currentStep
          const userProfile = postData.userProfile

          if (step === 1) {
            Object.assign(this.$rootScope, {
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              email: userProfile.email
            })
            this.$scope.$apply(() => this.$scope.goToNextStep('2'))
          } else if (step === 2) {
            Object.assign(this.$rootScope, {
              streetAddress: userProfile.streetAddress,
              city: userProfile.city,
              state: userProfile.state,
              zipCode: userProfile.zipCode,
              countryCode: userProfile.countryCode
            })
            this.$scope.$apply(() => this.$scope.goToNextStep('3'))
          } else if (step === 3) {
            // Add the user profile to the postData object
            // Okta widget handles the password
            postData.userProfile = {
              firstName: this.$rootScope.firstName,
              lastName: this.$rootScope.lastName,
              email: this.$rootScope.email,
              streetAddress: this.$rootScope.streetAddress,
              city: this.$rootScope.city,
              state: this.$rootScope.state,
              zipCode: this.$rootScope.zipCode,
              countryCode: this.$rootScope.countryCode
            }
            onSuccess(postData)
          }
        }
      }
    })
    this.signIn()

    this.oktaSignInWidget.on('afterRender', (context) => {
      // Change the text of the sign up button to ensure it's clear what the user is doing
      const signUpButton = angular.element(document.querySelector('.o-form-button-bar input.button.button-primary'));
      if (this.$window.currentStep === 3) {
        signUpButton.attr('value', 'Create an Account')
      } else {
        signUpButton.attr('value', 'Next')
      }
      // Stop tracking the current step after registration is complete
      if (context.controller === 'registration-complete') {
        this.$window.currentStep = null
      }
      if (context.controller === 'primary-auth') {
        this.$scope.$apply(() => this.onStateChange({state:'sign-in'}))
      }
      this.injectBackButton()
    })

    this.$scope.goToNextStep = (nextStep) => {
      // Set the current step to the next step
      this.$window.currentStep = nextStep
      // Render the widget again to show the next step
      this.oktaSignInWidget.remove()
      this.oktaSignInWidget.renderEl(
        { el: '#osw-container' },
        () => console.log('Widget rendered successfully'),
        (err) => console.error(err)
      )
    }

    this.$scope.goToPreviousStep = () => {
      // Set the current step to the previous step
      this.$window.currentStep = Math.max(this.$window.currentStep - 1, 1)
      // Render the widget again to show the next step
      this.oktaSignInWidget.remove()
      this.oktaSignInWidget.renderEl(
        { el: '#osw-container' },
        () => console.log('Widget rendered successfully'),
        (err) => console.error(err)
      )
    }

    if (!this.isInsideAnotherModal) {
      this.cartCount = 0
      this.getTotalQuantitySubscription = this.cartService.getTotalQuantity().subscribe(count => {
        this.cartCount = count
      }, () => {
        this.cartCount = 0
      })
    }
    this.loadDonorDetails()
    this.isLoading = true
    this.submitting = false
  }

  $onDestroy () {
    this.oktaSignInWidget.remove()
  }

  async signIn () {
    try {
      const tokens = await this.oktaSignInWidget.showSignInAndRedirect({
        el: '#osw-container'
      })
      this.oktaSignInWidget.authClient.handleLoginRedirect(tokens)
    } catch (error) {
      this.$log.error('Error showing Okta sign in widget.', error)
    }
  }

  injectBackButton () {
    // Do't show back button on the first step
    if (this.$window.currentStep  === 1) {
      return
    }
    const buttonBar = document.querySelector('.o-form-button-bar');
    // Ensure the button is only added once
    if (buttonBar && !document.querySelector('.o-form-button-bar #backButton')) {
      const backButton = angular.element('<button id="backButton" class="btn btn-secondary">Back</button>');
      // Add click behavior to go back a step
      backButton.on('click', (e) => {
        e.preventDefault();
        this.$scope.$apply(() => this.$scope.goToPreviousStep())
      });
      // Prepend the Back button before the "Next" button
      angular.element(buttonBar).prepend(backButton)
    }
  }

  loadDonorDetails () {
    this.loadingDonorDetails = true
    // Check to see if we have user details saved.
    this.orderService
      .getDonorDetails()
      .subscribe(
        (data) => {
          this.loadingDonorDetails = false
          this.donorDetails = data
          // Pre-populate first, last and email from session if missing from donorDetails
          if (!this.donorDetails.name['given-name'] && angular.isDefined(this.sessionService.session.first_name)) {
            this.donorDetails.name['given-name'] = this.sessionService.session.first_name
          }
          if (!this.donorDetails.name['family-name'] && angular.isDefined(this.sessionService.session.last_name)) {
            this.donorDetails.name['family-name'] = this.sessionService.session.last_name
          }
          if (angular.isUndefined(this.donorDetails.email) && angular.isDefined(this.sessionService.session.email)) {
            this.donorDetails.email = this.sessionService.session.email
          }
        },
        error => {
          this.loadingDonorDetails = false
          this.$log.error('Error loading donorDetails.', error)
        }
      )
  }

  async submitDetails () {
    this.submitting = true
    this.submissionError = []
    try {
      this.signUpForm.$setSubmitted()
      if (!this.signUpForm.$valid) {
        throw new Error('Some fields are invalid')
      }

      const details = this.donorDetails
      const { email, name } = details
      const createAccount = await this.sessionService.createAccount(email, name['given-name'], name['family-name'])
      if (createAccount.status === 'error') {
        if (createAccount.accountPending) {
          this.onStateChange({ state: 'sign-up-activation' })
        } else {
          if (createAccount.redirectToSignIn) {
            setTimeout(() => {
              this.onStateChange({ state: 'sign-in' })
              this.$scope.$apply()
            }, 5000)
          };
          this.submissionError = createAccount.data
        }
      } else {
        this.onStateChange({ state: 'sign-up-activation' })
      }
    } catch (error) {
      this.$scope.$apply(() => {
        this.submissionError = [error.message]
      })
    } finally {
      this.submitting = false
      this.$scope.$apply()
    }
  }
}

export default angular
  .module(componentName, [
    sessionService.name,
    orderService.name,
    cartService.name
  ])
  .component(componentName, {
    controller: SignUpModalController,
    templateUrl: template,
    bindings: {
      onStateChange: '&',
      onFailure: '&',
      onCancel: '&',
      isInsideAnotherModal: '='
    }
  })
