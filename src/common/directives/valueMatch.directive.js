import angular from 'angular';

let directiveName = 'valueMatch';

/* @ngInject */
function valueMatch() {
  var directiveDefinitionObject = {
    restrict: 'A',
    require:  ['^ngModel', '^form'],
    link:     function ( scope, element, attributes, controllers ) {
      var ngModel = controllers[0],
        formController = controllers[1],
        valueModel = formController[attributes.valueMatch];

      // Watch other model for changes
      scope.$watch( () => valueModel.$viewValue, function () {
        ngModel.$validate();
      } );

      ngModel.$validators.valueMatch = function ( modelValue ) {
        return (!modelValue && !valueModel.$modelValue) || (modelValue === valueModel.$modelValue);
      };
    }
  };
  return directiveDefinitionObject;
}

export default angular
  .module( directiveName, [] )
  .directive( directiveName, valueMatch );
