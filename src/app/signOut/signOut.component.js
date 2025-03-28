import angular from 'angular'
import commonModule from 'common/common.module'
import sessionService, { Roles } from 'common/services/session/session.service'
import template from './signOut.tpl.html'

const componentName = 'signOut'

class SignOutController {
  /* @ngInject */
  constructor ($window, sessionService) {
    this.$window = $window
    this.sessionService = sessionService
  }

  $onInit () {
    this.redirectToPreviousLocation = false
    if (this.sessionService.getRole() !== Roles.public) {
      this.redirectToHomepage()
    } else {
      this.redirectToLocationPriorToSignOut()
    }
  }

  redirectToHomepage () {
    this.$window.location.href = '/'
  }

  redirectToLocationPriorToSignOut () {
    const locationToReturnUser = this.sessionService.getStoredLocation()
    if (locationToReturnUser) {
      this.redirectToPreviousLocation = true
      this.sessionService.removeStoredLocation()
      this.$window.location.href = locationToReturnUser
    } else {
      this.redirectToHomepage()
    }
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    sessionService.name
  ])
  .component(componentName, {
    controller: SignOutController,
    templateUrl: template
  })
