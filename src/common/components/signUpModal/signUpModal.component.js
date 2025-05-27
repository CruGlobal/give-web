import angular from 'angular'
import 'angular-sanitize'
import 'angular-translate'
import includes from 'lodash/includes'
import assign from 'lodash/assign'
import pick from 'lodash/pick'
import 'rxjs/add/operator/finally'
import { map, catchError } from 'rxjs/operators'
import { Observable } from 'rxjs/Observable'
import merge from 'lodash/merge'
import 'rxjs/add/observable/forkJoin'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import OktaSignIn from '@okta/okta-signin-widget'
import sessionService, { Roles } from 'common/services/session/session.service'
import orderService from 'common/services/api/order.service'
import template from './signUpModal.tpl.html'
import cartService from 'common/services/api/cart.service'
import geographiesService from 'common/services/api/geographies.service'
import { customFields } from './signUpFormCustomFields'

export const countryFieldSelector = '.o-form-fieldset[data-se="o-form-fieldset-userProfile.countryCode"]'
export const regionFieldSelector = '.o-form-fieldset[data-se="o-form-fieldset-userProfile.state"]'
export const inputFieldErrorSelectorPrefix = '.o-form-input-name-'
const componentName = 'signUpModal'
const signUpButtonText = 'Create Account'
const nextButtonText = 'Continue'
const backButtonId = 'backButton'
const backButtonText = 'Back'

const createErrorIcon = () => {
  const icon = document.createElement('span')
  icon.className = 'icon icon-16 error-16-small'
  icon.ariaLabel = 'Error'
  icon.role = 'img'
  return icon
}

class SignUpModalController {
  /* @ngInject */
  constructor ($log, $scope, $location, $sanitize, $timeout, $translate, sessionService, cartService, orderService, envService, geographiesService) {
    this.$log = $log
    this.$scope = $scope
    this.$location = $location
    this.$sanitize = $sanitize
    this.$timeout = $timeout
    this.$translate = $translate
    this.sessionService = sessionService
    this.orderService = orderService
    this.cartService = cartService
    this.geographiesService = geographiesService
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
    if (this.oktaSignInWidget) {
      this.oktaSignInWidget.remove()
      // Unsubscribe all event listeners
      this.oktaSignInWidget.off()
    }
    if (angular.isDefined(this.getDonorDetailsSubscription)) {
      this.getDonorDetailsSubscription.unsubscribe()
    }
  }

  initializeVariables () {
    this.isLoading = true
    this.currentStep = 1
    this.donorDetails = {}
    this.translations = {}
    this.signUpErrors = []
    this.submitting = false
    this.countryCodeOptions = {}
    this.countriesData = []
    this.stateOptions = {}
    this.selectedCountry = {}
    this.floatingLabelAbortControllers = []
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
      'COUNTRY_LIST_ERROR',
      'REGIONS_LOADING_ERROR',
      'RETRY',
      'ORG_NAME_ERROR',
      'CITY_ERROR',
      'SELECT_STATE_ERROR',
      'ZIP_CODE_ERROR',
      'INVALID_US_ZIP_ERROR',
      'OKTA_SIGNUP_FIELDS_ERROR',
      'OKTA_FIRST_NAME_FIELD',
      'OKTA_LAST_NAME_FIELD',
      'OKTA_EMAIL_FIELD',
      'OKTA_PASSWORD_FIELD'
    ]).then(translations => {
      this.translations = {
        giveAsIndividual: translations.GIVE_AS_INDIVIDUAL,
        giveAsOrganization: translations.GIVE_AS_ORGANIZATION,
        organizationName: translations.ORGANIZATION_NAME,
        country: translations.COUNTRY,
        address: translations.ADDRESS,
        city: translations.CITY,
        state: translations.STATE,
        zip: translations.ZIP,
        countryListError: translations.COUNTRY_LIST_ERROR,
        regionsLoadingError: translations.REGIONS_LOADING_ERROR,
        retry: translations.RETRY,
        orgNameError: translations.ORG_NAME_ERROR,
        cityError: translations.CITY_ERROR,
        selectStateError: translations.SELECT_STATE_ERROR,
        zipCodeError: translations.ZIP_CODE_ERROR,
        invalidUSZipError: translations.INVALID_US_ZIP_ERROR,
        signupFieldsError: translations.OKTA_SIGNUP_FIELDS_ERROR,
        firstNameField: translations.OKTA_FIRST_NAME_FIELD,
        lastNameField: translations.OKTA_LAST_NAME_FIELD,
        emailField: translations.OKTA_EMAIL_FIELD,
        passwordField: translations.OKTA_PASSWORD_FIELD
      }
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
    this.loadCountries({ initial: true }).subscribe()

    this.oktaSignInWidget.on('ready', this.ready.bind(this))
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
    const passwordInput = schema.find(field => field.name === 'credentials.passcode')
    return {
      // Step 1: Name, email, account type and organization name (if applicable)
      1: this.getStep1Fields(schema),
      // Step 2: Address
      2: this.getStep2Fields(schema),
      // Step 3: Password (We don't save the password for security reasons.
      // Which is why it's the last step)
      3: [passwordInput]
    }
  }

  getStep1Fields (schema) {
    const firstNameInput = schema.find(field => field.name === 'userProfile.firstName')
    const lastNameInput = schema.find(field => field.name === 'userProfile.lastName')
    const emailInput = schema.find(field => field.name === 'userProfile.email')
    // Retain the values entered by the user when navigating between steps.
    // Pre-populate the form fields with existing user details.
    return [
      {
        ...firstNameInput,
        value: this.$scope.firstName || this.donorDetails?.name?.['given-name'] || this.sessionService.session.first_name || ''
      },
      {
        ...lastNameInput,
        value: this.$scope.lastName || this.donorDetails?.name?.['family-name'] || this.sessionService.session.last_name || ''
      },
      {
        ...emailInput,
        value: this.$scope.email || this.donorDetails?.email || this.sessionService.session.email || ''
      },
      {
        ...customFields.accountType,
        options: {
          Household: this.translations.giveAsIndividual,
          Organization: this.translations.giveAsOrganization
        },
        value: this.$scope.accountType || this.donorDetails?.['donor-type'] || 'Household'
      },
      {
        ...customFields.organizationName,
        label: this.translations.organizationName,
        value: this.$scope.organizationName || this.donorDetails?.['organization-name'] || ''
      }
    ]
  }

  getStep2Fields (schema) {
    // Retain the values entered by the user when navigating between steps.
    // Pre-populate the form fields with existing user details.
    return [
      {
        ...customFields.countryCode,
        options: this.countryCodeOptions,
        label: this.translations.country,
        value: this.$scope.countryCode || this.donorDetails?.mailingAddress?.country || 'US'
      },
      {
        ...customFields.streetAddress,
        label: this.translations.address,
        value: this.$scope.streetAddress || this.donorDetails?.mailingAddress?.streetAddress || ''
      },
      {
        ...customFields.streetAddressExtended,
        value: this.$scope.streetAddressExtended || this.donorDetails?.mailingAddress?.extendedAddress || ''
      },
      {
        ...customFields.internationalAddressLine3,
        value: this.$scope.internationalAddressLine3 || this.donorDetails?.mailingAddress?.intAddressLine3 || ''
      },
      {
        ...customFields.internationalAddressLine4,
        value: this.$scope.internationalAddressLine4 || this.donorDetails?.mailingAddress?.intAddressLine4 || ''
      },
      {
        ...customFields.city,
        label: this.translations.city,
        value: this.$scope.city || this.donorDetails?.mailingAddress?.locality || ''
      },
      {
        ...customFields.state,
        options: {
          '': '',
          ...this.stateOptions
        },
        label: this.translations.state,
        value: this.$scope.state || this.donorDetails?.mailingAddress?.region || ''
      },
      {
        ...customFields.zipCode,
        label: this.translations.zip,
        value: this.$scope.zipCode || this.donorDetails?.mailingAddress?.postalCode || ''
      }
    ]
  }

  loadCountries ({ initial = false }) {
    this.loadingCountriesError = false
    return this.geographiesService.getCountries()
      .map((data) => {
        this.countriesData = data
        this.countryCodeOptions = {}
        data.forEach(country => {
          this.countryCodeOptions[country.name] = country['display-name']
        })
        if (initial || this.$scope.countryCode) {
          this.refreshRegions(this.$scope.countryCode || this.donorDetails?.mailingAddress?.country || 'US').subscribe()
        }

        return this.countryCodeOptions
      })
      .catch(error => {
        this.loadingCountriesError = true
        this.$log.error('Okta Sign up: Error loading countries.', error)
      })
  }

  refreshRegions (country, forceRetry = false) {
    this.loadingRegionsError = false
    // Prevent multiple calls for the same country, unless it's a retry
    if (this.selectedCountry.name === country && !forceRetry) {
      return Observable.of(null)
    }
    const countryData = this.countriesData.find(c => c.name === country)
    if (!countryData) {
      return Observable.throw(new Error('Country not found'))
    }
    this.selectedCountry = countryData

    return this.geographiesService.getRegions(countryData).pipe(
      map((data) => {
        this.stateOptions = {}
        data.forEach(state => {
          this.stateOptions[state.name] = state['display-name']
        })
        return this.stateOptions
      }),
      catchError((error) => {
        this.loadingRegionsError = true
        this.$log.error('Okta Sign up: Error loading regions.', error)
        return Observable.throw(error)
      })
    )
  }

  preSubmit (postData, onSuccess) {
    // Clear errors from previous steps
    this.signUpErrors = []
    this.clearInjectedErrorMessages()

    const step = this.currentStep
    const userProfile = postData.userProfile
    if (step === 1) {
      this.saveStep1Data(userProfile, postData)
    } else if (step === 2) {
      this.saveStep2Data(userProfile)
    } else if (step === 3) {
      this.submitFinalData(postData, onSuccess)
    }
  }

  saveStep1Data (userProfile, postData) {
    const isOrganization = postData.accountType === 'Organization'
    Object.assign(this.$scope, {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      accountType: postData.accountType,
      organizationName: isOrganization ? postData.organizationName : ''
    })

    const errors = []
    if (isOrganization && !this.$scope.organizationName) {
      errors.push({
        errorSummary: this.translations.orgNameError,
        property: 'organizationName'
      })
    }
    if (errors.length) {
      this.injectErrorMessages(errors)
    } else {
      this.$scope.$apply(() => this.goToNextStep())
    }
  }

  saveStep2Data (userProfile) {
    const isUSAddress = userProfile.countryCode === 'US'
    Object.assign(this.$scope, {
      countryCode: userProfile.countryCode,
      streetAddress: userProfile.streetAddress,
      streetAddressExtended: userProfile.streetAddressExtended,
      internationalAddressLine3: isUSAddress ? '' : userProfile.internationalAddressLine3,
      internationalAddressLine4: isUSAddress ? '' : userProfile.internationalAddressLine4,
      city: isUSAddress ? userProfile.city : '',
      state: isUSAddress ? userProfile.state : '',
      zipCode: isUSAddress ? userProfile.zipCode : ''
    })

    const errors = []
    if (isUSAddress) {
      if (!this.$scope.city) {
        errors.push({
          errorSummary: this.translations.cityError,
          property: 'userProfile.city'
        })
      }
      if (!this.$scope.state) {
        errors.push({
          errorSummary: this.translations.selectStateError,
          property: 'userProfile.state'
        })
      }
      if (!this.$scope.zipCode) {
        errors.push({
          errorSummary: this.translations.zipCodeError,
          property: 'userProfile.zipCode'
        })
      } else {
        const zipCodeRegex = /^\d{5}(?:[-\s]\d{4})?$/
        if (!zipCodeRegex.test(this.$scope.zipCode)) {
          errors.push({
            errorSummary: this.translations.invalidUSZipError,
            property: 'userProfile.zipCode'
          })
        }
      }
    }

    if (errors.length) {
      this.injectErrorMessages(errors)
      return
    }

    this.$scope.$apply(() => this.goToNextStep())
  }

  submitFinalData (postData, onSuccess) {
    // Add the user profile to the postData object
    // Okta widget handles the password
    postData.userProfile = {
      firstName: this.$scope.firstName,
      lastName: this.$scope.lastName,
      email: this.$scope.email
    }
    onSuccess(postData)
  }

  postSubmit (response, onSuccess) {
    onSuccess(response)
  }

  afterError (_, error) {
    // Save errors to local variable to inject into the form
    // Since errors are cleared on each step change
    this.signUpErrors = error.xhr.responseJSON.errorCauses
    // Wait for the Okta widget to create the error message box and set the sign up button text
    // before augmenting the error message box and resetting the sign up button text
    this.$timeout(() => {
      this.updateSignUpButtonText()
      this.injectErrorMessages()
    })
  }

  afterRender (context) {
    // Handle inactivity error
    // The Okta widget has an issue where if the page is idle for a period of time,
    // the Okta interaction session will expire, causing the widget to show an error "You have been logged out due to inactivity..."
    // The user then has to click "back to sign in," to rerender the Okta widget.
    // To avoid the error showing, we check if the context formName is 'terminal'. If it is, we know there was an error,
    // and we re-render the widget to refresh the widget.
    if (context.formName === 'terminal') {
      this.reRenderWidget()
      return
    }

    // Step 4: Email Verification
    if (context.formName === 'enroll-authenticator') {
      // If the user has signed up but hasn't submitted the verification code yet and comes back to
      // the sign up modal, Okta will skip the sign up form and take them directly to the verify
      // email step. We detect that here and update the current step and click the "Enter a
      // verification code instead" for them.
      this.$scope.$apply(() => {
        this.currentStep = 4
      })
      this.showVerificationCodeField()
    }

    // Step 5: Optional MFA setup
    if (context.formName === 'select-authenticator-enroll') {
      // As Okta enforces the MFA screen to be shown during sign up, we need to skip it.
      // This step does not have good UX as it's long, causing users to scroll to see the continue button.
      // We are okay with skipping this step as users can set up MFA later.
      this.$scope.$apply(() => {
        this.isLoading = true
        this.currentStep = 5
      })
      this.skipOptionalMFAEnrollment()
    }

    // All steps
    this.updateSignUpButtonText()
    this.resetCurrentStepOnRegistrationComplete(context)
    this.redirectToSignInModalIfNeeded(context)
    this.injectErrorMessages()
    this.injectBackButton()
    // This needs to be after showVerificationCodeField to ensure even the verification code field is styled correctly
    this.initializeFloatingLabels()

    // Step 1: Identity
    if (this.loadingCountriesError && this.currentStep === 1) {
      this.injectCountryLoadError()
    }
    // Step 2: Address
    if (this.loadingRegionsError && this.currentStep === 2) {
      this.injectRegionLoadError()
    }
  }

  ready () {
    this.$scope.$apply(() => {
      this.isLoading = false
    })
  }

  showVerificationCodeField () {
    // The verification code field is only shown when the button link "Enter a verification code instead" is clicked.
    // This makes the process of creating an account more streamlined as we remove that click.
    const verificationCodeButtonLink = document.querySelector('.button-link.enter-auth-code-instead-link')
    verificationCodeButtonLink?.click()
  }

  skipOptionalMFAEnrollment () {
    // Hide MFA options while we wait for the redirect to happen.
    // The loading icon will be shown, so the user will know something is happening.
    const mfaOptions = document.querySelector('.select-authenticator-enroll')
    if (mfaOptions) {
      mfaOptions.style.display = 'none'
      // As Okta enforces the MFA screen to be shown during sign up, we need to skip it to streamline the process.
      // The user can setup MFA at a later date in their account settings.
      const skipMFAButton = mfaOptions.querySelector('.button.skip-all')
      skipMFAButton?.click()
    }
  }

  updateSignUpButtonText () {
    // Leave the default text on the verify step
    if (this.currentStep !== 4) {
      // Change the text of the sign up button to ensure it's clear what the user is doing
      const signUpButton = angular.element(document.querySelector('.o-form-button-bar input.button.button-primary'))
      signUpButton.attr('value', this.currentStep === 3 ? signUpButtonText : nextButtonText)
    }
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

  injectErrorMessages (errors = this.signUpErrors) {
    this.clearInjectedErrorMessages()

    if (!errors?.length) {
      return
    }

    // Inject error messages into the form since errors are cleared when switching steps/rerendering.
    errors.forEach(error => {
      const field = document.querySelector(`${inputFieldErrorSelectorPrefix}${error.property.replace(/\./g, '\\.')}`)
      if (field) {
        const errorElement = document.createElement('div')
        errorElement.classList.add('okta-form-input-error', 'o-form-input-error', 'o-form-explain')
        errorElement.setAttribute('role', 'alert')

        const errorSummary = error.errorSummary
        errorElement.textContent = Array.isArray(errorSummary) ? errorSummary.join(' ') : errorSummary
        errorElement.prepend(createErrorIcon())

        field.parentNode.classList.add('o-form-has-errors')
        field.parentNode.appendChild(errorElement)
      }
    })

    // Augment the error message box to specify which fields had errors. Since the email and
    // password fields are on step 1 and the submission happens on step 3, the error messages for
    // those fields won't be visible to the user.
    if (this.currentStep === 4) {
      // Skip the verification step because an invalid code comes back as "credentials.passcode" and
      // to say that the password field was invalid would confuse the user
      return
    }

    const errorBox = document.querySelector('.okta-form-infobox-error')
    if (!errorBox) {
      return
    }

    const errorFields = errors.map(error => {
      if (error.property === 'userProfile.firstName') {
        return this.translations.firstNameField
      } else if (error.property === 'userProfile.lastName') {
        return this.translations.lastNameField
      } else if (error.property === 'userProfile.email') {
        return this.translations.emailField
      } else if (error.property === 'credentials.passcode') {
        return this.translations.passwordField
      }
      return null
    }).filter(Boolean)
    if (!errorFields.length) {
      return
    }

    // Remove the previous error fields
    errorBox.querySelector('.error-fields')?.remove()

    const errorMessage = document.createElement('p')
    errorMessage.className = 'error-fields'
    // The OKTA_SIGNUP_FIELDS_ERROR translation key is already loaded, so we can use
    // $translate.instant to synchronously interpolate our fields into it
    errorMessage.textContent = this.$translate.instant('OKTA_SIGNUP_FIELDS_ERROR', { fields: errorFields.join(', ') })
    errorBox.append(errorMessage)
  }

  clearInjectedErrorMessages () {
    document.querySelectorAll('.okta-form-input-error').forEach((node) => {
      node.remove()
    })
  }

  injectBackButton () {
    // Don't show back button on the first step or verify step
    if (this.currentStep === 1 || this.currentStep === 4) {
      return
    }
    const buttonBar = document.querySelector('.o-form-button-bar')
    // Ensure the button is only added once
    if (buttonBar && !buttonBar.querySelector(`#${backButtonId}`)) {
      const backButton = angular.element(`<button id="${backButtonId}" class="btn btn-secondary" type="button">${backButtonText}</button>`)
      // Add click behavior to go back a step
      backButton.on('click', (e) => {
        e.preventDefault()
        this.$scope.$apply(() => this.goToPreviousStep())
      })
      // Prepend the Back button before the "Next" button
      angular.element(buttonBar).prepend(backButton)
    }
  }

  injectLoadError ({ fieldSelector, errorMessage, retryCallback }) {
    const errorElement = document.createElement('div')
    errorElement.classList.add('okta-form-input-error', 'o-form-input-error', 'o-form-explain', 'cru-error')
    errorElement.setAttribute('role', 'alert')
    errorElement.innerHTML = this.$sanitize(errorMessage)
    errorElement.prepend(createErrorIcon())

    const retryButtonElement = document.createElement('a')
    retryButtonElement.classList.add('cru-retry-button')
    retryButtonElement.innerHTML = this.$sanitize(this.translations.retry)

    const field = document.querySelector(fieldSelector)
    field.classList.add('o-form-has-errors')
    field.appendChild(errorElement)
    field.appendChild(retryButtonElement)

    retryButtonElement.addEventListener('click', () => {
      retryCallback().finally(() => {
        this.reRenderWidget()
      }).subscribe()
    })
  }

  injectCountryLoadError () {
    this.injectLoadError({
      fieldSelector: countryFieldSelector,
      errorMessage: this.translations.countryListError,
      retryCallback: () => this.loadCountries({ initial: false })
    })
  }

  injectRegionLoadError () {
    this.injectLoadError({
      fieldSelector: regionFieldSelector,
      errorMessage: this.translations.regionsLoadingError,
      retryCallback: () => this.refreshRegions(this.$scope.countryCode, true)
    })
  }

  initializeFloatingLabels () {
    // As the Label and Input fields are not directly related in the DOM, we need to manually
    // add the active class to the label when the input is focused or has a value.

    // Remove any existing listeners before adding new ones
    this.floatingLabelAbortControllers.forEach(controller => controller.abort())
    this.floatingLabelAbortControllers = []

    document.querySelectorAll('.o-form-content input[type="text"], .o-form-content input[type="password"]')?.forEach(input => {
      const label = input.labels[0]?.parentNode
      if (!label) {
        return
      }
      // if the input already has a value, mark the label as active
      if (input.value.trim() !== '') {
        label.classList.add('active')
      }
      // Create and save the controller so we can later remove the listeners.
      const controller = new AbortController()
      this.floatingLabelAbortControllers.push(controller)

      input.addEventListener('focus', () => {
        label.classList.add('active')
      }, { signal: controller.signal })
      input.addEventListener('blur', () => {
        // When the input loses focus, check its value.
        if (input.value.trim() === '') {
          label.classList.remove('active')
        }
      }, { signal: controller.signal })
    })
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
    return this.oktaSignInWidget.renderEl(
      { el: '#osw-container' },
      (res) => {
        // On sign up and email verification success, save the donor details
        if (res.status === 'SUCCESS') {
          this.saveDonorDetails()
        } else {
          // Handle the case where tokens are not available
          const errorName = 'Okta Sign up: Tokens not available in response'
          this.$log.error(errorName)
        }
      },
      (error) => {
        const errorName = 'Okta Sign up: Error rendering Okta sign up widget.'
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
      this.$log.error('Okta Sign up: Error showing Okta sign in widget.', error)
    })
  }

  loadDonorDetails () {
    return this.orderService.getDonorDetails().map((data) => {
      let donorData = data
      const checkoutSavedData = this.sessionService.session.checkoutSavedData
      if (checkoutSavedData) {
        donorData = assign(data, pick(checkoutSavedData, [
          'name', 'email', 'mailingAddress', 'organization-name'
        ]))
      }
      this.donorDetails = donorData
      return donorData
    })
      .catch(error => {
        this.$log.error('Okta Sign up: Error loading donorDetails.', error)
        return Observable.throw(error)
      })
      .finally(() => {
        this.loadingDonorDetails = false
      })
  }

  saveDonorDetails () {
    this.isLoading = true
    this.oktaSignInWidget.remove()
    this.oktaSignInWidget.off()

    const signUpDonorDetails = {
      name: {
        'given-name': this.$scope.firstName,
        'family-name': this.$scope.lastName
      },
      'donor-type': this.$scope.accountType,
      'organization-name': this.$scope.organizationName,
      email: this.$scope.email,
      mailingAddress: {
        streetAddress: this.$scope.streetAddress,
        extendedAddress: this.$scope.streetAddressExtended,
        intAddressLine3: this.$scope.internationalAddressLine3,
        intAddressLine4: this.$scope.internationalAddressLine4,
        locality: this.$scope.city,
        region: this.$scope.state,
        postalCode: this.$scope.zipCode,
        country: this.$scope.countryCode
      }
    }

    if (angular.isDefined(this.getDonorDetailsSubscription)) {
      this.getDonorDetailsSubscription.unsubscribe()
    }
    this.getDonorDetailsSubscription = this.orderService.getDonorDetails().switchMap((donorDetails) => {
      merge(donorDetails, signUpDonorDetails)
      // Send each of the requests
      return Observable.forkJoin([
        this.orderService.updateDonorDetails(donorDetails),
        this.orderService.addEmail(donorDetails.email, donorDetails.emailFormUri)
      ]).map(() => donorDetails)
    }).subscribe({
      next: () => this.redirectToOktaForLogin(),
      error: (donorDetails) => this.onSignUpError({ donorDetails })
    })
  }

  redirectToOktaForLogin () {
    this.sessionService.signIn(this.lastPurchaseId, this.$scope.email).subscribe(() => {})
  }
}

export default angular
  .module(componentName, [
    'pascalprecht.translate',
    'ngSanitize',
    sessionService.name,
    orderService.name,
    cartService.name,
    geographiesService.name
  ])
  .component(componentName, {
    controller: SignUpModalController,
    templateUrl: template,
    bindings: {
      // Called with `donorDetails` if there is an error while signing up to the Cortex DB
      onSignUpError: '&',
      // Called when the user clicks back to sign in link
      onSignIn: '&',
      lastPurchaseId: '<',
    }
  })
