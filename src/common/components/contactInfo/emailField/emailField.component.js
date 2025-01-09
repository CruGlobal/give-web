import angular from 'angular'
import template from './emailField.tpl.html'

const componentName = 'emailField'

class emailFieldController {}

export default angular
  .module(componentName, [])
  .component(componentName, {
    controller: emailFieldController,
    templateUrl: template,
    bindings: {
      donorDetails: '<',
      detailsForm: '<',
    }
  })
