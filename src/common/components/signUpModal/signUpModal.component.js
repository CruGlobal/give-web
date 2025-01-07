import angular from 'angular'
import includes from 'lodash/includes'
import assign from 'lodash/assign'
import pick from 'lodash/pick'
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

    this.setUpSignUpWidget()

    if (!this.isInsideAnotherModal) {
      this.cartCount = 0
      this.getTotalQuantitySubscription = this.cartService.getTotalQuantity().subscribe(count => {
        this.cartCount = count
      }, () => {
        this.cartCount = 0
      })
    }

    this.isLoading = true
    this.submitting = false
  }

  $onDestroy () {
    this.oktaSignInWidget.remove()
  }

  async setUpSignUpWidget () {
    const donorData = await this.loadDonorDetails()
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
          // Split the form into multiple steps for better user experience.
          // Retain the values entered by the user in each step.
          // Pre-populate the form fields with existing user details to save time.
          const steps = {
            // Step 1: Name and email
            1: [
              {
                ...schema[0],
                value: this.$rootScope.firstName ?? donorData.name['given-name'] ?? this.sessionService.session.first_name ?? ''
              },
              {
                ...schema[1],
                value: this.$rootScope.lastName ?? donorData.name['family-name'] ?? this.sessionService.session.last_name ?? ''
              },
              {
                ...schema[2],
                value: this.$rootScope.email ?? donorData.email ?? this.sessionService.session.email ?? ''
              }
            ],
            // Step 2: Address plus phone number
            2: [
              {
                ...schema[3],
                value: this.$rootScope.streetAddress ?? donorData.mailingAddress.streetAddress ?? ''
              },
              {
                ...schema[4],
                value: this.$rootScope.city ?? donorData.mailingAddress.locality ?? ''
              },
              {
                ...schema[5],
                value: this.$rootScope.state ?? donorData.mailingAddress.region ?? ''
              },
              {
                ...schema[6],
                value: this.$rootScope.zipCode ?? donorData.mailingAddress.postalCode ?? ''
              },
              {
                ...schema[7],
                value: this.$rootScope.countryCode ?? donorData.mailingAddress.country ?? ''
              },
              {
                ...schema[8],
                value: this.$rootScope.primaryPhone ?? donorData['phone-number'] ?? ''
              }],
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
            this.$scope.$apply(() => this.goToNextStep())
          } else if (step === 2) {
            Object.assign(this.$rootScope, {
              streetAddress: userProfile.streetAddress,
              city: userProfile.city,
              state: userProfile.state,
              zipCode: userProfile.zipCode,
              countryCode: userProfile.countryCode,
              primaryPhone: userProfile.primaryPhone
            })
            this.$scope.$apply(() => this.goToNextStep())
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
              countryCode: this.$rootScope.countryCode,
              primaryPhone: this.$rootScope.primaryPhone
            }
            onSuccess(postData)
          }
        }
      }
    })

    this.signIn()

    this.oktaSignInWidget.on('afterRender', this.afterRenderFn.bind(this))
  }

  afterRenderFn (context) {
    // Change the text of the sign up button to ensure it's clear what the user is doing
    const signUpButton = angular.element(document.querySelector('.o-form-button-bar input.button.button-primary'))
    if (this.$window.currentStep === 3) {
      signUpButton.attr('value', 'Create an Account')
    } else {
      signUpButton.attr('value', 'Next')
    }

    // Stop tracking the current step after registration is complete
    if (context.controller === 'registration-complete') {
      this.$window.currentStep = null
      console.log('Registration complete')
    }

    // Send users to the login modal if they try to go to the login form
    if (context.controller === 'primary-auth') {
      this.$scope.$apply(() => this.onStateChange({ state: 'sign-in' }))
    }

    this.injectBackButton()
  }

  goToNextStep () {
    // Set the current step to the next step
    this.$window.currentStep++
    this.reRenderWidget()
  }

  goToPreviousStep () {
    // Set the current step to the previous step
    this.$window.currentStep = Math.max(this.$window.currentStep - 1, 1)
    this.reRenderWidget()
  }

  reRenderWidget () {
  // Render the widget again to show new step
    this.oktaSignInWidget.remove()
    this.oktaSignInWidget.renderEl(
      { el: '#osw-container' },
      null,
      (error) => {
        const errorName = 'Error rendering Okta sign up widget.'
        console.error(errorName, error)
        this.$log.error(errorName, error)
      }
    )
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
    if (this.$window.currentStep === 1) {
      return
    }
    const buttonBar = document.querySelector('.o-form-button-bar')
    // Ensure the button is only added once
    if (buttonBar && !document.querySelector('.o-form-button-bar #backButton')) {
      const backButton = angular.element('<button id="backButton" class="btn btn-secondary">Back</button>')
      // Add click behavior to go back a step
      backButton.on('click', (e) => {
        e.preventDefault()
        this.$scope.$apply(() => this.goToPreviousStep())
      })
      // Prepend the Back button before the "Next" button
      angular.element(buttonBar).prepend(backButton)
    }
  }

  async loadDonorDetails () {
    this.loadingDonorDetails = true
    return new Promise((resolve) => {
      this.orderService.getDonorDetails().subscribe(
        (data) => {
          this.loadingDonorDetails = false

          let donorData = data

          const checkoutSavedData = this.sessionService.session.checkoutSavedData
          if (checkoutSavedData) {
            donorData = assign(this.donorDetails, pick(checkoutSavedData, [
              'name', 'email', 'mailingAddress', 'phone-number'
            ]))
          }
          resolve(donorData)
        },
        (error) => {
          this.loadingDonorDetails = false
          this.$log.error('Error loading donorDetails.', error)
          resolve({})
        }
      )
    })
  }

  // TODO list
  // make sure errors on the Okta are displayed on the form. - could just be Okta enroll issue
  // Make sure checkoutSessiondata is used on this form.
  // Should we add spouse and organization name to the form?
  // Remove submit detail method and create account session.service method.
  // Remove the verification modal
  // Make sure this form redirects to the user matching modal after a successful account creation.

  //   async submitDetails () {
  //     this.submitting = true
  //     this.submissionError = []
  //     try {
  //       this.signUpForm.$setSubmitted()
  //       if (!this.signUpForm.$valid) {
  //         throw new Error('Some fields are invalid')
  //       }

//       const details = this.donorDetails
//       const { email, name } = details
//       const createAccount = await this.sessionService.createAccount(email, name['given-name'], name['family-name'])
//       if (createAccount.status === 'error') {
//         if (createAccount.accountPending) {
//           this.onStateChange({ state: 'sign-up-activation' })
//         } else {
//           if (createAccount.redirectToSignIn) {
//             setTimeout(() => {
//               this.onStateChange({ state: 'sign-in' })
//               this.$scope.$apply()
//             }, 5000)
//           };
//           this.submissionError = createAccount.data
//         }
//       } else {
//         this.onStateChange({ state: 'sign-up-activation' })
//       }
//     } catch (error) {
//       this.$scope.$apply(() => {
//         this.submissionError = [error.message]
//       })
//     } finally {
//       this.submitting = false
//       this.$scope.$apply()
//     }
//   }
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
