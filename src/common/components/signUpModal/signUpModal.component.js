import angular from 'angular'
import 'angular-gettext'
import 'angular-messages'
import sessionService from 'common/services/session/session.service'
import showErrors from 'common/filters/showErrors.filter'
import template from './signUpModal.tpl.html'
import valueMatch from 'common/directives/valueMatch.directive'

const componentName = 'signUpModal'

class SignUpModalController {
  /* @ngInject */
  constructor (gettext, sessionService) {
    this.gettext = gettext
    this.sessionService = sessionService
  }

  $onInit () {
    this.modalTitle = this.gettext('Sign Up')
    this.isLoading = false
    this.setPristine()
  }

  signUp () {
    if (!this.signUpForm.$valid) {
      return
    }
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

  setPristine () {
    this.signUpErrors = {}
    this.hasError = false
  }

  getOktaUrl () {
    return this.sessionService.getOktaUrl()
  }
}

export default angular
  .module(componentName, [
    'gettext',
    'ngMessages',
    sessionService.name,
    showErrors.name,
    valueMatch.name
  ])
  .component(componentName, {
    controller: SignUpModalController,
    templateUrl: template,
    bindings: {
      modalTitle: '=',
      onStateChange: '&',
      onSuccess: '&'
    }
  })
