import angular from 'angular'
import includes from 'lodash/includes'
import assign from 'lodash/assign'
import pick from 'lodash/pick'
import 'rxjs/add/operator/finally'
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable'
import OktaSignIn from '@okta/okta-signin-widget'
import sessionService, { Roles } from 'common/services/session/session.service'
import orderService from 'common/services/api/order.service'
import template from './signUpModal.tpl.html'
import cartService from 'common/services/api/cart.service'
require('assets/okta-sign-in/css/okta-sign-in.min.css')

const componentName = 'signUpModal'

class SignUpModalController {
  /* @ngInject */
  constructor ($log, $scope, $location, $translate, sessionService, cartService, orderService, envService) {
    this.$log = $log
    this.$scope = $scope
    this.$location = $location
    this.$translate = $translate
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
    this.currentStep = 1
    this.donorDetails = {}
    this.loadDonorDetails().finally(() => {
      this.setUpSignUpWidget()
    }).subscribe()

    this.$translate(['GIVE_AS_INDIVIDUAL', 'GIVE_AS_ORGANIZATION', 'ORGANIZATION_NAME']).then(translations => {
      this.giveAsIndividualTxt = translations.GIVE_AS_INDIVIDUAL
      this.giveAsOrganizationTxt = translations.GIVE_AS_ORGANIZATION
      this.organizationNameTxt = translations.ORGANIZATION_NAME
    })

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

  setUpSignUpWidget () {
    const donorData = this.donorDetails ?? {}
    this.currentStep = 1

    this.oktaSignInWidget = new OktaSignIn({
      ...this.sessionService.oktaSignInWidgetDefaultOptions,
      assets: {
        baseUrl: '/assets/okta-sign-in/'
      },
      flow: 'signup',
      registration: {
        parseSchema: (schema, onSuccess) => {
          const step = this.currentStep || 1
          // Split the form into multiple steps for better user experience.
          // Retain the values entered by the user in each step.
          // Pre-populate the form fields with existing user details.

          const organizationNameField = this.$scope.accountType === 'organization'
            ? [{
                name: 'organizationName',
                type: 'text',
                'label-top': true,
                label: this.organizationNameTxt,
                required: true,
                maxLength: 50,
                value: this.$scope.organizationName ?? donorData['organization-name'] ?? ''
              }]
            : []

          const steps = {
            // Step 1: Name, email and account type
            1: [
              {
                ...schema[0],
                value: this.$scope.firstName ?? donorData.name?.['given-name'] ?? this.sessionService.session.first_name ?? ''
              },
              {
                ...schema[1],
                value: this.$scope.lastName ?? donorData.name?.['family-name'] ?? this.sessionService.session.last_name ?? ''
              },
              {
                ...schema[2],
                value: this.$scope.email ?? donorData.email ?? this.sessionService.session.email ?? ''
              },
              {
                name: 'accountType',
                type: 'select',
                options: {
                  household: this.giveAsIndividualTxt,
                  organization: this.giveAsOrganizationTxt
                },
                'label-top': true,
                label: 'Account Type',
                required: true,
                wide: true,
                value: this.$scope.accountType ?? donorData['donor-type'] ?? 'household'
              }
            ],
            // Step 2: Address, phone number and organization name (if applicable)
            2: [
              ...organizationNameField,
              {
                ...schema[3],
                value: this.$scope.streetAddress ?? donorData.mailingAddress?.streetAddress ?? ''
              },
              {
                ...schema[4],
                value: this.$scope.city ?? donorData.mailingAddress?.locality ?? ''
              },
              {
                ...schema[5],
                value: this.$scope.state ?? donorData.mailingAddress?.region ?? ''
              },
              {
                ...schema[6],
                value: this.$scope.zipCode ?? donorData.mailingAddress?.postalCode ?? ''
              },
              {
                ...schema[7],
                value: this.$scope.countryCode ?? donorData.mailingAddress?.country ?? ''
              },
              {
                ...schema[8],
                value: this.$scope.primaryPhone ?? donorData['phone-number'] ?? ''
              }
            ],
            // Step 3: Password
            3: [schema[8]]
          }
          onSuccess(steps[step])
        },
        preSubmit: (postData, onSuccess) => {
          const step = this.currentStep
          const userProfile = postData.userProfile

          if (step === 1) {
            Object.assign(this.$scope, {
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              email: userProfile.email,
              accountType: postData.accountType
            })
            this.$scope.$apply(() => this.goToNextStep())
          } else if (step === 2) {
            Object.assign(this.$scope, {
              streetAddress: userProfile.streetAddress,
              city: userProfile.city,
              state: userProfile.state,
              zipCode: userProfile.zipCode,
              countryCode: userProfile.countryCode,
              primaryPhone: userProfile.primaryPhone,
              organizationName: postData.organizationName
            })
            this.$scope.$apply(() => this.goToNextStep())
          } else if (step === 3) {
            // Add the user profile to the postData object
            // Okta widget handles the password
            postData.userProfile = {
              firstName: this.$scope.firstName,
              lastName: this.$scope.lastName,
              email: this.$scope.email,
              streetAddress: this.$scope.streetAddress,
              city: this.$scope.city,
              state: this.$scope.state,
              zipCode: this.$scope.zipCode,
              countryCode: this.$scope.countryCode,
              primaryPhone: this.$scope.primaryPhone
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
    if (this.currentStep === 3) {
      signUpButton.attr('value', 'Create an Account')
    } else {
      signUpButton.attr('value', 'Next')
    }

    // Stop tracking the current step after registration is complete
    if (context.controller === 'registration-complete') {
      this.currentStep = null
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
    this.currentStep++
    this.reRenderWidget()
  }

  goToPreviousStep () {
    // Set the current step to the previous step
    this.currentStep = Math.max(this.currentStep - 1, 1)
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
    // Don't show back button on the first step
    if (this.currentStep === 1) {
      return
    }
    const buttonBar = document.querySelector('.o-form-button-bar')
    // Ensure the button is only added once
    if (buttonBar && !buttonBar.querySelector('#backButton')) {
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

  loadDonorDetails () {
    return this.orderService.getDonorDetails().map((data) => {
      let donorData = data
      const checkoutSavedData = this.sessionService.session.checkoutSavedData
      if (checkoutSavedData) {
        donorData = assign(this.donorDetails, pick(checkoutSavedData, [
          'name', 'email', 'mailingAddress', 'organization-name', 'phone-number'
        ]))
      }
      this.donorDetails = donorData
      return donorData
    })
      .catch(error => {
        this.$log.error('Error loading donorDetails.', error)
        return Observable.throw(error)
      })
      .finally(() => {
        this.loadingDonorDetails = false
      })
  }

  // On registration complete we need to send the data to Cortex and then redirect the user to the next step
  // this.onStateChange({ state: 'sign-up-activation' })
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
