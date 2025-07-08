import angular from 'angular';

const directiveName = 'valueMatch';

const valueMatch = /* @ngInject */ function () {
  const directiveDefinitionObject = {
    restrict: 'A',
    require: ['^ngModel', '^form'],
    link: function (scope, element, attributes, controllers) {
      const ngModel = controllers[0];
      const formController = controllers[1];
      const valueModel = formController[attributes.valueMatch];

      // Watch other model for changes
      scope.$watch(
        () => valueModel.$viewValue,
        function () {
          ngModel.$validate();
        },
      );

      ngModel.$validators.valueMatch = function (modelValue) {
        return (
          (!modelValue && !valueModel.$modelValue) ||
          modelValue === valueModel.$modelValue
        );
      };
    },
  };
  return directiveDefinitionObject;
};

export default angular
  .module(directiveName, [])
  .directive(directiveName, valueMatch);
