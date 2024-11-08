import angular from 'angular'
import * as cruPayments from '@cruglobal/cru-payments/dist/cru-payments'

const directiveName = 'creditCardCvv'

const creditCardCvv = /* @ngInject */ function () {
  const directiveDefinitionObject = {
    restrict: 'A',
    require: ['^ngModel', '^form'],
    link: function (scope, element, attributes, controllers) {
      const ngModel = controllers[0]
      const formController = controllers[1]
      const valueModel = formController[attributes.creditCardCvv]

      scope.$watch(() => valueModel.$viewValue, function () {
        ngModel.$validate()
      })

      ngModel.$validators.creditCardCvv = function (modelValue) {
				return (cruPayments.creditCard.cvv.validate.minLength(modelValue)) && (cruPayments.creditCard.cvv.validate.maxLength(modelValue))
      }
    }
  }
  return directiveDefinitionObject
}

export default angular
  .module(directiveName, [])
  .directive(directiveName, creditCardCvv)
