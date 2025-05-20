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

const componentName = 'resetPasswordModal'
const backButtonId = 'backButton'
const backButtonText = 'Back'

class ResetPasswordModalController {
  // --------------------------------------
  // Reset Password process.
  // It's a multi-step process, handled by this component.
  // --------------------------------------
  // Step 1: Identify (email)
  // Step 2: Select authenticator
  //    2.1: This shows a list of authenticators to choose from.
  //    2.2: Even if you haven't set them up. There is no way around this.
  //    2.3: If the user selects phone, they will also be prompted to authenticate with another option.
  // Step 3: Authenticator verification data
  //    3.1: You will only see this page for okta_email.
  // Step 4: Challenge authenticator
  // Step 5: Reset authenticator
  // Step 6: Reset password
  // Step 7: Upon a success password reset, the user will be logged in and redirected to their previous page
  // -------------------------------------- //

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
    this.setUpSignUpWidget()
  }

  $onDestroy () {
    if (this.oktaSignInWidget) {
      this.oktaSignInWidget.remove()
      // Unsubscribe all event listeners
      this.oktaSignInWidget.off()
    }
  }

  initializeVariables () {
    this.isLoading = true
    this.currentStep = 1
    this.floatingLabelAbortControllers = []
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
  }

  afterRender (context) {
    let step = this.currentStep

    switch (context.formName) {
      case 'identify':
        step = 1
        this.injectBackButton()
        break
      case 'select-authenticator-authenticate':
        // okta_email | google_otp | okta_verify | phone_number
        step = 2
        break
      case 'authenticator-verification-data':
        // okta_email | phone_number
        step = 3
        this.triggerNotificationClick()
        break
      case 'challenge-authenticator':
        // okta_email | google_otp | okta_verify | phone_number
        step = 4
        break
      case 'reset-authenticator':
        step = 5
        break
    }

    this.$scope.$apply(() => {
      this.currentStep = step
    })

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

  triggerNotificationClick () {
    // This step requires the user to click a button to trigger the notification to be sent to their email or phone.
    // We remove this step by clicking the button for the user.
    const verificationCodeButtonLink = document.querySelector(`
      .authenticator-verification-data--okta_email input.button[type="submit"],
      .authenticator-verification-data--phone_number input.button[type="submit"]
    `)
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
      null,
      (error) => {
        const errorName = 'Okta Forgot Password: Error rendering Okta widget.'
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
      isInsideAnotherModal: '='
    }
  })
