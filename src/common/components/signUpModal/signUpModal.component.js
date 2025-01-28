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
import { customFields } from './signUpFormCustomFields'
require('assets/okta-sign-in/css/okta-sign-in.min.css')

const componentName = 'signUpModal'
const signUpButtonText = 'Create an Account'
const nextButtonText = 'Next'
const backButtonId = 'backButton'
const backButtonText = 'Back'

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
      this.onSignIn()
    }
    this.initializeVariables()
    this.loadTranslations()
    this.loadDonorDetails().finally(() => {
      this.setUpSignUpWidget()
    }).subscribe()
  }

  $onDestroy () {
    this.oktaSignInWidget?.remove()
  }

  initializeVariables () {
    this.currentStep = 1
    this.donorDetails = {}
    this.signUpErrors = []
    this.isLoading = true
    this.submitting = false
  }

  loadTranslations () {
    this.$translate([
      'GIVE_AS_INDIVIDUAL',
      'GIVE_AS_ORGANIZATION',
      'ORGANIZATION_NAME',
      'COUNTRY',
      'ADDRESS',
      'CITY',
      'STATE',
      'ZIP',
    ]).then(translations => {
      this.giveAsIndividualTxt = translations.GIVE_AS_INDIVIDUAL
      this.giveAsOrganizationTxt = translations.GIVE_AS_ORGANIZATION
      this.organizationNameTxt = translations.ORGANIZATION_NAME
      this.countryField = translations.COUNTRY
      this.addressField = translations.ADDRESS
      this.cityField = translations.CITY
      this.stateField = translations.STATE
      this.zipField = translations.ZIP
    })
  }

  setUpSignUpWidget () {
    this.currentStep = 1

    this.oktaSignInWidget = new OktaSignIn({
      ...this.sessionService.oktaSignInWidgetDefaultOptions,
      assets: {
        baseUrl: '/assets/okta-sign-in/'
      },
      flow: 'signup',
      registration: {
        parseSchema: this.parseSchema.bind(this),
        preSubmit: this.preSubmit.bind(this),
        postSubmit: this.postSubmit.bind(this)
      }
    })

    this.signIn()

    this.oktaSignInWidget.on('afterRender', this.afterRender.bind(this))
    this.oktaSignInWidget.on('afterError', this.afterError.bind(this))
  }

  parseSchema (schema, onSuccess) {
    // Split the form into multiple steps for better user experience.
    const step = this.currentStep || 1
    const steps = this.getSteps(schema)
    onSuccess(steps[step])
  }

  getSteps (schema) {
    return {
      // Step 1: Name, email and account type
      1: this.getStep1Fields(schema),
      // Step 2: Address, phone number and organization name (if applicable)
      2: this.getStep2Fields(schema),
      // Step 3: Password (We don't save the password for security reasons.
      // Which is why it's the last step)
      3: [schema[9]]
    }
  }

  getStep1Fields (schema) {
    // Retain the values entered by the user when navigating between steps.
    // Pre-populate the form fields with existing user details.
    return [
      {
        ...schema[0],
        value: this.$scope.firstName || this.donorDetails?.name?.['given-name'] || this.sessionService.session.first_name || ''
      },
      {
        ...schema[1],
        value: this.$scope.lastName || this.donorDetails?.name?.['family-name'] || this.sessionService.session.last_name || ''
      },
      {
        ...schema[2],
        value: this.$scope.email || this.donorDetails?.email || this.sessionService.session.email || ''
      },
      {
        ...customFields.accountType,
        options: {
          Household: this.giveAsIndividualTxt,
          Organization: this.giveAsOrganizationTxt
        },
        value: this.$scope.accountType || this.donorDetails?.['donor-type'] || 'Household'
      },
      {
        ...customFields.countryCode,
        label: this.countryField,
        value: this.$scope.countryCode || this.donorDetails?.mailingAddress?.country || 'US'
      }
    ]
  }

  getStep2Fields (schema) {
    // Retain the values entered by the user when navigating between steps.
    // Pre-populate the form fields with existing user details.

    const organizationNameField = this.$scope.accountType === 'Organization'
    ? [{
        ...customFields.organizationName,
        label: this.organizationNameTxt,
        value: this.$scope.organizationName || this.donorDetails?.['organization-name'] || ''
      }]
    : []

    return [
      ...organizationNameField,
      {
        ...customFields.streetAddress,
        label: this.addressField,
        value: this.$scope.streetAddress || this.donorDetails?.mailingAddress?.streetAddress || ''
      },
      {
        ...customFields.streetAddressExtended,
        value: this.$scope.streetAddressExtended || this.donorDetails?.mailingAddress?.extendedAddress || ''
      },
      {
        ...customFields.city,
        label: this.cityField,
        value: this.$scope.city || this.donorDetails?.mailingAddress?.locality || ''
      },
      {
        ...customFields.state,
        options: this.stateOptions,
        label: this.stateField,
        value: this.$scope.state || this.donorDetails?.mailingAddress?.region || ''
      },
      {
        ...customFields.zipCode,
        label: this.zipField,
        value: this.$scope.zipCode || this.donorDetails?.mailingAddress?.postalCode || ''
      },
      {
        ...customFields.primaryPhone,
        value: this.$scope.primaryPhone || this.donorDetails?.['phone-number'] || ''
      }
    ]
  }

  preSubmit (postData, onSuccess) {
    const step = this.currentStep
    const userProfile = postData.userProfile
    if (step === 1) {
      this.saveStep1Data(userProfile, postData)
    } else if (step === 2) {
      this.saveStep2Data(userProfile, postData)
    } else if (step === 3) {
      this.submitFinalData(postData, onSuccess)
    }
  }

  saveStep1Data (userProfile, postData) {
    Object.assign(this.$scope, {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      accountType: postData.accountType,
      countryCode: userProfile.countryCode,
    })
  }

  saveStep2Data (userProfile, postData) {
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
  }

  submitFinalData (postData, onSuccess) {
    // Clear errors from previous steps
    this.signUpErrors = []
    // Add the user profile to the postData object
    // Okta widget handles the password
    postData.userProfile = {
      firstName: this.$scope.firstName,
      lastName: this.$scope.lastName,
      email: this.$scope.email,
      primaryPhone: this.$scope.primaryPhone
    }
    onSuccess(postData)
  }

  postSubmit (response, onSuccess) {
    const donorDetails = {
      name: {
        'given-name': this.$scope.firstName,
        'family-name': this.$scope.lastName
      },
      'donor-type': this.$scope.accountType,
      'organization-name': this.$scope.organizationName,
      email: this.$scope.email,
      phone: this.$scope.primaryPhone,
      mailingAddress: {
        streetAddress: this.$scope.streetAddress,
        locality: this.$scope.city,
        region: this.$scope.state,
        postalCode: this.$scope.zipCode,
        country: this.$scope.countryCode
      }
    }
    this.$scope.$apply(() => this.onSignUp({ donorDetails }))
    onSuccess(response)
  }

  afterError (_, error) {
    // Save errors to local variable to inject into the form
    // Since errors are cleared on each step change
    this.signUpErrors = error.xhr.responseJSON.errorCauses
  }

  afterRender (context) {
    this.updateSignUpButtonText()
    this.resetCurrentStepOnRegistrationComplete(context)
    this.redirectToSignInModalIfNeeded(context)
    this.injectErrorMessages()
    this.injectBackButton()
  }

  updateSignUpButtonText () {
    // Change the text of the sign up button to ensure it's clear what the user is doing
    const signUpButton = angular.element(document.querySelector('.o-form-button-bar input.button.button-primary'))
    signUpButton.attr('value', this.currentStep === 3 ? signUpButtonText : nextButtonText)
  }

  resetCurrentStepOnRegistrationComplete (context) {
    // Stop tracking the current step after registration is complete
    if (context.controller === 'registration-complete') {
      this.currentStep = null
    }
  }

  redirectToSignInModalIfNeeded (context) {
    // Send users to the login modal if they try to go to the login form
    if (context.controller === 'primary-auth') {
      this.$scope.$apply(() => this.onSignIn())
    }
  }

  injectErrorMessages () {
    // Inject error messages into the form since errors are cleared when switching steps/rerendering.
    this.signUpErrors.forEach(error => {
      const field = document.querySelector(`.o-form-input-name-${error.property.replace(/\./g, '\\.')}`)
      if (field) {
        const errorElement = document.createElement('div')
        errorElement.classList.add('okta-form-input-error', 'o-form-input-error', 'o-form-explain')
        field.parentNode.classList.add('o-form-has-errors')
        errorElement.setAttribute('role', 'alert')
        errorElement.innerHTML = `<span class="icon icon-16 error-16-small" role="img" aria-label="Error"></span> ${error.errorSummary}`
        field.parentNode.appendChild(errorElement)
      }
    })
  }

  injectBackButton () {
    // Don't show back button on the first step
    if (this.currentStep === 1) {
      return
    }
    const buttonBar = document.querySelector('.o-form-button-bar')
    // Ensure the button is only added once
    if (buttonBar && !buttonBar.querySelector(`#${backButtonId}`)) {
      const backButton = angular.element(`<button id="${backButtonId}" class="btn btn-secondary">${backButtonText}</button>`)
      // Add click behavior to go back a step
      backButton.on('click', (e) => {
        e.preventDefault()
        this.$scope.$apply(() => this.goToPreviousStep())
      })
      // Prepend the Back button before the "Next" button
      angular.element(buttonBar).prepend(backButton)
    }
  }

  goToNextStep () {
    this.currentStep++
    this.reRenderWidget()
  }

  goToPreviousStep () {
    this.currentStep = Math.max(this.currentStep - 1, 1)
    this.reRenderWidget()
  }

  reRenderWidget () {
    // Render the widget again to show new step
    // Unfortunately, this removes the error messages, which is why we inject them after rendering
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

  signIn () {
    return this.oktaSignInWidget.showSignInAndRedirect({
      el: '#osw-container'
    }).then(tokens => {
      this.oktaSignInWidget.authClient.handleLoginRedirect(tokens)
    }).catch(error => {
      this.$log.error('Error showing Okta sign in widget.', error)
    })
  }

  loadDonorDetails () {
    return this.orderService.getDonorDetails().map((data) => {
      let donorData = data
      const checkoutSavedData = this.sessionService.session.checkoutSavedData
      if (checkoutSavedData) {
        donorData = assign(data, pick(checkoutSavedData, [
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
      // Called with `donorDetails` after the user creates an account with Okta
      onSignUp: '&',
      // Called when the user clicks back to sign in link
      onSignIn: '&',
      // Called with the user dismisses the modal via the close button
      onCancel: '&',
      isInsideAnotherModal: '='
    }
  })
