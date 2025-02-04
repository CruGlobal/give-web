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
    this.showRedirectingLoadingIcon = true
    const locationToReturnUser = this.sessionService.getLocationOnLogin()
    if (locationToReturnUser) {
      this.sessionService.removeLocationOnLogin()
      this.$window.location.href = locationToReturnUser
    } else {
      this.redirectToHomepage()
    }
  }

  closeRedirectingLoading () {
    this.showRedirectingLoadingIcon = false
    this.redirectToHomepage()
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
