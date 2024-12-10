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
  constructor ($log, $scope, $rootScope, $location, sessionService, cartService, orderService, envService) {
    this.$log = $log
    this.$scope = $scope
    this.$rootScope = $rootScope
    this.$location = $location
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
    window.currentStep = '1' // Default to step 1
    const rootScope = this.$rootScope // Capture the $rootScope
    const scope = this.$scope // Capture the $scope
    this.oktaSignInWidget = new OktaSignIn({
      ...this.sessionService.oktaSignInWidgetDefaultOptions,
      assets: {
        baseUrl: `${window.location.origin}/assets/okta-sign-in/`
      },
      flow: 'signup',
      registration: {
        parseSchema: (schema, onSuccess) => {
          const step = window.currentStep || '1'
          const steps = {
            1: [schema[0], schema[1], schema[2]],
            2: [schema[3], schema[4], schema[5], schema[6], schema[7]],
            3: [schema[8]]
          }
          onSuccess(steps[step])
        },
        preSubmit: (postData, onSuccess) => {
          const step = window.currentStep
          const userProfile = postData.userProfile

          if (step === '1') {
            Object.assign(rootScope, {
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              email: userProfile.email
            })
            scope.$apply(() => scope.goToNextStep('2'))
          } else if (step === '2') {
            Object.assign(rootScope, {
              streetAddress: userProfile.streetAddress,
              city: userProfile.city,
              state: userProfile.state,
              zipCode: userProfile.zipCode,
              countryCode: userProfile.countryCode
            })
            scope.$apply(() => scope.goToNextStep('3'))
          } else if (step === '3') {
            postData.userProfile = {
              firstName: rootScope.firstName,
              lastName: rootScope.lastName,
              email: rootScope.email,
              streetAddress: rootScope.streetAddress,
              city: rootScope.city,
              state: rootScope.state,
              zipCode: rootScope.zipCode,
              countryCode: rootScope.countryCode
            }
            onSuccess(postData)
          }
        }
      }
    })
    this.signIn()

    this.oktaSignInWidget.on('afterRender', (context) => {
      if (context.controller === 'registration-complete') {
        window.currentStep = null
      }
    })

    scope.goToNextStep = (nextStep) => {
      window.currentStep = nextStep
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
