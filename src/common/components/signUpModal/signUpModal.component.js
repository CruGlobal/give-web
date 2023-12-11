import angular from 'angular'
import includes from 'lodash/includes'
import sessionService, { Roles } from 'common/services/session/session.service'
import orderService from 'common/services/api/order.service'
import template from './signUpModal.tpl.html'
import cartService from 'common/services/api/cart.service'

const componentName = 'signUpModal'

class SignUpModalController {
  /* @ngInject */
  constructor ($log, $scope, $location, sessionService, cartService, orderService, envService) {
    this.$log = $log
    this.$scope = $scope
    this.$location = $location
    this.sessionService = sessionService
    this.orderService = orderService
    this.cartService = cartService
    this.imgDomain = envService.read('imgDomain')
  }

  $onInit () {
    if (includes([Roles.identified, Roles.registered], this.sessionService.getRole())) {
      this.identified = true;
      this.username = this.sessionService.session.email;
      this.onStateChange({ state: 'sign-in' });
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
    this.isLoading = true;
    this.submitting = false;
  }

  loadDonorDetails () {
    this.loadingDonorDetails = true
    // Check to see if we have user details saved.
    this.orderService
      .getDonorDetails()
      .subscribe(
        (data) => {
          this.loadingDonorDetails = false
          this.donorDetails = data;
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
      if (!this.signUpForm.$valid) throw new Error('Some fields are invalid');

      const details = this.donorDetails   
      const { email, name } = details;
      const createAccount = await this.sessionService.createAccount(email, name['given-name'], name['family-name']);
      console.log('createAccount', createAccount)
      if (createAccount.status === 'error') {
        if (createAccount.accountPending) {
          this.onStateChange({ state: 'sign-up-activation' });
        } else {
          if (createAccount.redirectToSignIn) {
            setTimeout(() => {
              this.onStateChange({ state: 'sign-in' });
              this.$scope.$apply();
            }, 5000)
          };
          this.submissionError = createAccount.data
        }
      } else {
        this.onStateChange({ state: 'sign-up-activation' });
      }
    } catch(error) {
      this.$scope.$apply(() => {
        this.submissionError = [error.message]
      })
    } finally {
      this.submitting = false;
      this.$scope.$apply();
    }
  }
}


export default angular
  .module(componentName, [
    sessionService.name,
    orderService.name,
    cartService.name,
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
