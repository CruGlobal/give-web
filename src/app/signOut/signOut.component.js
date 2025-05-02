import angular from 'angular'
import commonModule from 'common/common.module'
import template from './signOut.tpl.html'

const componentName = 'signOut'

class SignOutController {
  /* @ngInject */
  constructor ($window) {
    this.$window = $window
  }
}

export default angular
  .module(componentName, [
    commonModule.name
  ])
  .component(componentName, {
    controller: SignOutController,
    templateUrl: template
  })
