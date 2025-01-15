import angular from 'angular'
import template from './emailField.tpl.html'

const componentName = 'emailField'

class EmailFieldController {}

export default angular
  .module(componentName, [])
  .component(componentName, {
    controller: EmailFieldController,
    templateUrl: template,
    bindings: {
      donorDetails: '<',
      detailsForm: '<',
    }
  })
