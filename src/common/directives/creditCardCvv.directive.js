import angular from 'angular'
import * as cruPayments from '@cruglobal/cru-payments/dist/cru-payments'

const directiveName = 'creditCardCvv'

const creditCardCvv = /* @ngInject */ function () {
  const directiveDefinitionObject = {
    restrict: 'AE',
    require: ['^ngModel', '^form'],
    scope: {
      disableContinue: '&' 
    },

    link: function (scope, element, attributes, controllers) {
      const ngModel = controllers[0]
      const formController = controllers[1]
      const valueModel = formController[attributes.creditCardCvv]

      scope.$watch(() => valueModel.$viewValue, function () {
        ngModel.$validate()
      })

      ngModel.$validators.creditCardCvv = function (modelValue) {
        const isCvvValid = (cruPayments.creditCard.cvv.validate.minLength(modelValue)) && (cruPayments.creditCard.cvv.validate.maxLength(modelValue))
        scope.disableContinue({$event: isCvvValid})

				return isCvvValid
      }
    }
  }
  return directiveDefinitionObject
}

export default angular
  .module(directiveName, [])
  .directive(directiveName, creditCardCvv)
