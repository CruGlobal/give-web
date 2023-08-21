import angular from 'angular'
import includes from 'lodash/includes'
import sessionService, { Roles } from 'common/services/session/session.service'
import orderService from 'common/services/api/order.service'
import template from './signUpModal.tpl.html'

const componentName = 'signUpModal'

class SignUpModalController {
  /* @ngInject */
  constructor ($log, $scope, $location, sessionService, orderService) {
    this.$log = $log
    this.$scope = $scope
    this.$location = $location
    this.sessionService = sessionService
    this.orderService = orderService
  }

  $onInit () {
    if (includes([Roles.identified, Roles.registered], this.sessionService.getRole())) {
      this.identified = true;
      this.username = this.session.email;
      this.onStateChange({ state: 'sign-in' });
    }
    this.loadDonorDetails()
    // https://github.com/CruGlobal/thekey/wiki/Self-Service-REST-API#create-user
    // https://github.com/CruGlobal/cortex_gateway/wiki/Create-User
    this.setPristine()
    this.isLoading = true
    this.sessionService
      .signUp(this.email, this.password, this.first_name, this.last_name)
      .subscribe((data) => {
        this.isLoading = false
        this.onSuccess(data)
      }, (error) => {
        this.hasError = true
        switch (error.status) {
          case 400:
            if (error.data && error.data.error === 'invalid_password') {
              this.signUpErrors.invalid_password = true
              this.invalidPasswordMessage = error.data.description
            } else {
              this.signUpErrors[error.status] = true
            }
            break
          case 403:
          case 409:
            this.signUpErrors[error.status] = true
            break
          default:
            this.signUpErrors.generic = true
        }
        this.isLoading = false
      })
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

  submitDetails () {
    this.submitted = true
    this.signUpForm.$setSubmitted()
    if (this.signUpForm.$valid) {
      const details = this.donorDetails
      this.submissionError = ''
      // TODO: send data to API
      // this.submissionError = 'Invalid email address'
      // this.submissionError = 'Account already exists'
      this.onStateChange({ state: 'sign-up-activation' });
    } else {
      this.submitted = false
    }
  }
}


export default angular
  .module(componentName, [
    sessionService.name,
    orderService.name,
  ])
  .component(componentName, {
    controller: SignUpModalController,
    templateUrl: template,
    bindings: {
      onStateChange: '&',
      onSuccess: '&',
      onFailure: '&'
    }
  })
