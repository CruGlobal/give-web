import angular from 'angular'
import 'angular-sanitize'
import 'angular-translate'
import includes from 'lodash/includes'
import OktaSignIn from '@okta/okta-signin-widget'
import sessionService, { Roles } from 'common/services/session/session.service'
import orderService from 'common/services/api/order.service'
import template from './resetPasswordModal.tpl.html'
import cartService from 'common/services/api/cart.service'
import geographiesService from 'common/services/api/geographies.service'
import { initializeFloatingLabels, injectBackButton, showVerificationCodeField } from 'common/lib/oktaSignInWidgetHelper/oktaSignInWidgetHelper'

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
        injectBackButton({
          $scope: this.$scope,
          functionCallback: this.onSignIn,
          backButtonId,
          backButtonText
        })
        break
      case 'select-authenticator-authenticate':
        //  Auth options: okta_email | google_otp | okta_verify | phone_number
        step = 2
        break
      case 'authenticator-verification-data':
        // Only for auth options: okta_email | phone_number
        step = 3
        this.triggerNotificationClick()
        break
      case 'challenge-authenticator':
        //  Auth options: okta_email | google_otp | okta_verify | phone_number
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
        showVerificationCodeField()
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

    // This needs to be after showVerificationCodeField to ensure even the verification code field is styled correctly
    initializeFloatingLabels(this.floatingLabelAbortControllers)
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
