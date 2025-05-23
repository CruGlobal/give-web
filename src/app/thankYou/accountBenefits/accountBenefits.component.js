import angular from 'angular'
import sessionModalService from 'common/services/session/sessionModal.service'
import sessionService, { Roles } from 'common/services/session/session.service'
import orderService from 'common/services/api/order.service'
import template from './accountBenefits.tpl.html'

const componentName = 'accountBenefits'

class AccountBenefitsController {
  /* @ngInject */
  constructor ($log, sessionModalService, sessionService, orderService) {
    this.$log = $log
    this.sessionModalService = sessionModalService
    this.sessionService = sessionService
    this.orderService = orderService
    this.isVisible = false
  }

  $onInit () {
    this.sessionService.removeOktaRedirectIndicator()
  }

  $onChanges (changes) {
    // donorDetails is undefined initially
    if (changes.donorDetails && angular.isDefined(changes.donorDetails.currentValue)) {
      // Show account benefits if registration state is NEW or MATCHED
      if (changes.donorDetails.currentValue['registration-state'] !== 'COMPLETED') {
        this.isVisible = true
        this.openAccountBenefitsModal()
      }
    }
  }

  openAccountBenefitsModal () {
    const lastPurchaseId = this.getLastPurchaseId()
    if (!lastPurchaseId) {
      return
    }

    this.sessionService.oktaIsUserAuthenticated().subscribe((isAuthenticated) => {
      const registrationState = this.donorDetails['registration-state']
      if (isAuthenticated && registrationState === 'NEW') {
        return this.sessionModalService.registerAccount(lastPurchaseId).then(() => {
          this.isVisible = false
        }, angular.noop)
      } else if (isAuthenticated && registrationState === 'MATCHED') {
        return this.sessionModalService.userMatch(lastPurchaseId).then(() => {
          this.isVisible = false
        }, angular.noop)
      } else {
        return this.sessionModalService.accountBenefits(lastPurchaseId).then(() => {
          this.isVisible = false
        }, angular.noop)
      }
    },
    error => {
      this.$log.error('Failed checking if user is authenticated', error)
    })
  }

  doUserMatch () {
    if (this.sessionService.getRole() === Roles.registered) {
      this.sessionModalService.userMatch()
    } else {
      this.sessionModalService.registerAccount(this.getLastPurchaseId()).then(() => {
        this.sessionModalService.userMatch().then(() => {
          // Hide component after successful user match
          this.isVisible = false
        }, angular.noop)
      }, angular.noop)
    }
  }

  getLastPurchaseId () {
    const lastPurchaseLink = this.orderService.retrieveLastPurchaseLink()
    return lastPurchaseLink ? lastPurchaseLink.split('/').pop() : undefined
  }
}

export default angular
  .module(componentName, [
    sessionModalService.name,
    sessionService.name,
    orderService.name
  ])
  .component(componentName, {
    controller: AccountBenefitsController,
    templateUrl: template,
    bindings: {
      donorDetails: '<'
    }
  })
