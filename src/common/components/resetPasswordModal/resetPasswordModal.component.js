import angular from 'angular'
import 'angular-sanitize'
import 'angular-translate'
import includes from 'lodash/includes'
import assign from 'lodash/assign'
import pick from 'lodash/pick'
import 'rxjs/add/operator/finally'
import { Observable } from 'rxjs/Observable'
import merge from 'lodash/merge'
import 'rxjs/add/observable/forkJoin'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import OktaSignIn from '@okta/okta-signin-widget'
import sessionService, { Roles } from 'common/services/session/session.service'
import orderService from 'common/services/api/order.service'
import template from './resetPasswordModal.tpl.html'
import cartService from 'common/services/api/cart.service'
import geographiesService from 'common/services/api/geographies.service'

export const countryFieldSelector = '.o-form-fieldset[data-se="o-form-fieldset-userProfile.countryCode"]'
export const regionFieldSelector = '.o-form-fieldset[data-se="o-form-fieldset-userProfile.state"]'
export const inputFieldErrorSelectorPrefix = '.o-form-input-name-'
const componentName = 'resetPasswordModal'
const backButtonId = 'backButton'
const backButtonText = 'Back'

const createErrorIcon = () => {
  const icon = document.createElement('span')
  icon.className = 'icon icon-16 error-16-small'
  icon.ariaLabel = 'Error'
  icon.role = 'img'
  return icon
}

class ResetPasswordModalController {
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
    // unsure
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
      flow: 'resetPassword'
    })

    this.signIn()

    this.oktaSignInWidget.on('ready', this.ready.bind(this))
    this.oktaSignInWidget.on('afterRender', this.afterRender.bind(this))
    this.oktaSignInWidget.on('afterError', this.afterError.bind(this))
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
    let step = this.currentStep

    switch (context.formName) {
      case 'identify':
        step = 1
        this.injectBackButton()
        break
      case 'select-authenticator-authenticate':
        step = 2
        break
      case 'authenticator-verification-data':
        // The step to choose the authenticator to authenticate with
        step = 3
        break
      case 'challenge-authenticator':
        // "google_otp"
        // "okta_verify"
        step = 4
        break
      case 'reset-authenticator':
        step = 5
        break
    }

    this.$scope.$apply(() => {
      this.currentStep = step
    })
    

    // Step 1 of the MFA
    if (context.formName === 'authenticator-verification-data') {
      if (context.authenticatorKey === 'okta_email') {
        this.sendVerificationEmail()
      }
    }

    // Step 2 of the MFA
    if (context.formName === 'challenge-authenticator') {
      if (context.authenticatorKey === 'okta_email') {
        this.showVerificationCodeField()
      }
    }

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

    // All steps
    this.injectErrorMessages()
    // This needs to be after showVerificationCodeField to ensure even the verification code field is styled correctly
    this.initializeFloatingLabels()
  }

  ready () {
    this.$scope.$apply(() => {
      this.isLoading = false
    })
  }

  sendVerificationEmail () {
    // This step requires the user to click a button to confirm they want an email
    // This adds a step in the experience, so we do the click for the user.
    const verificationCodeButtonLink = document.querySelector('.authenticator-verification-data--okta_email input.button[type="submit"]')
    verificationCodeButtonLink?.click()
  }

  showVerificationCodeField () {
    // The verification code field is only shown when the button link "Enter a verification code instead" is clicked.
    // This makes the process of creating an account more streamlined as we remove that click.
    const verificationCodeButtonLink = document.querySelector('.button-link.enter-auth-code-instead-link')
    verificationCodeButtonLink?.click()
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

  injectBackButton () {
    const buttonBar = document.querySelector('.o-form-button-bar')
    // Ensure the button is only added once
    if (buttonBar && !buttonBar.querySelector(`#${backButtonId}`)) {
      const backButton = angular.element(`<button id="${backButtonId}" class="btn btn-secondary" type="button">${backButtonText}</button>`)
      // Add click behavior to go back a step
      backButton.on('click', (e) => {
        e.preventDefault()
        this.$scope.$apply(() => this.onSignIn())
      })
      // Prepend the Back button before the "Next" button
      angular.element(buttonBar).prepend(backButton)
    }
  }

  clearInjectedErrorMessages () {
    document.querySelectorAll('.okta-form-input-error').forEach((node) => {
      node.remove()
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
    controller: ResetPasswordModalController,
    templateUrl: template,
    bindings: {
      // Called when the user clicks back to sign in link
      onSignIn: '&',
      lastPurchaseId: '<',
      isInsideAnotherModal: '='
    }
  })
