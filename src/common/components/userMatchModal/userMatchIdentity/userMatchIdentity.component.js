import angular from 'angular'
import isEmpty from 'lodash/isEmpty'
import template from './userMatchIdentity.tpl.html'

const componentName = 'userMatchIdentity'

class UserMatchIdentityController {
  /* @ngInject */
  constructor () {
    this.hasError = false
  }

  $onChanges (changes) {
    if (changes.submitted && changes.submitted.currentValue === true) {
      this.selectContact()
    }
  }

  selectContact () {
    this.hasError = false
    if (!this.identityForm.$valid) {
      this.hasError = true
      this.onSubmit({
        success: false
      })
    } else {
      this.onSubmit({
        success: true,
        contact: isEmpty(this.contact) ? undefined : this.contact
      })
    }
  }
}

export default angular
  .module(componentName, [])
  .component(componentName, {
    controller: UserMatchIdentityController,
    templateUrl: template,
    bindings: {
      contacts: '<',
      // Set to true from the parent to cause the form to submit and call onSubmit
      submitted: '<',
      // Called with a `success` boolean to indicate whether the selection was valid
      // If the form was valid, it is also called with `contact` set to the selected contact
      onSubmit: '&'
    }
  })
