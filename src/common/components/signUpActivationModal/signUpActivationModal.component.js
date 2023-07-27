import angular from 'angular'
import includes from 'lodash/includes'
import sessionService, { Roles } from 'common/services/session/session.service'
import orderService from 'common/services/api/order.service'
import template from './signUpActivationModal.tpl.html'

const componentName = 'signUpActivationModal'

class signUpActivationModalController {
  /* @ngInject */
  constructor ($log, sessionService, orderService, envService) {
    this.$log = $log
    this.sessionService = sessionService
    this.orderService = orderService
    this.imgDomain = envService.read('imgDomain')
  }

  $onInit () {
    if (includes([Roles.identified, Roles.registered], this.sessionService.getRole())) {
      this.identified = true;
      this.username = this.session.email;
      this.onStateChange({ state: 'sign-in' });
    }
    this.showHelp = false;
    this.getUnverifiedEmails()
  }

  getUnverifiedEmails () {
    this.loadingUnverifiedEmailsError = false
    this.loadingUnverifiedEmails = true
    // TODO: API to fetch a list of emails which need verifying.
    // TODO: Might need a button to resend verify email if too much has passed.
    this.unverifiedEmails = [
      {
        email: 'daniel.bisgrove@hotmail.com',
        status: 'pending',
      },
      {
        email: 'daniel.bisgrove+test46@hotmail.com',
        status: 'pending',
      }
    ]
    this.loadingUnverifiedEmails = false
    // error => {
    //   this.loadingUnverifiedEmailsError = true
    //   this.loadingUnverifiedEmails = false
    //   this.$log.error('Error loading unverified emails.', error)
    // })
  }

  emailIsVerified () {
    // TODO: Check if email is verified
    this.verifyError = ''
    this.onSuccess();
  }
}


export default angular
  .module(componentName, [
    sessionService.name,
    orderService.name,
  ])
  .component(componentName, {
    controller: signUpActivationModalController,
    templateUrl: template,
    bindings: {
      modalTitle: '=',
      lastPurchaseId: '<',
      onStateChange: '&',
      onSuccess: '&',
      onFailure: '&'
    }
  })
