import angular from 'angular'

const directiveName = 'valueMatch'

const valueMatch = /* @ngInject */ function () {
  var directiveDefinitionObject = {
    restrict: 'A',
    require: ['^ngModel', '^form'],
    link: function (scope, element, attributes, controllers) {
      var ngModel = controllers[0]
      var formController = controllers[1]
      var valueModel = formController[attributes.valueMatch]

      // Watch other model for changes
      scope.$watch(() => valueModel.$viewValue, function () {
        ngModel.$validate()
      })

      ngModel.$validators.valueMatch = function (modelValue) {
        return (!modelValue && !valueModel.$modelValue) || (modelValue === valueModel.$modelValue)
      }
    }
  }
  return directiveDefinitionObject
}

export default angular
  .module(directiveName, [])
  .directive(directiveName, valueMatch)
