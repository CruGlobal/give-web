import angular from 'angular'
import commonModule from 'common/common.module'
import showErrors from 'common/filters/showErrors.filter'
import template from './oktaAuthCallback.tpl.html'

const componentName = 'oktaAuthCallback'
export const unknownErrorMessage = 'Failed to authenticate user when redirecting from Okta. Please try to sign in again.'

class OktaAuthCallbackController {
  /* @ngInject */
  constructor ($log, $window) {
    this.$log = $log
    this.$window = $window
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    showErrors.name
  ])
  .component(componentName, {
    controller: OktaAuthCallbackController,
    templateUrl: template
  })
