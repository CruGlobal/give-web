import angular from 'angular'
import * as cruPayments from '@cruglobal/cru-payments/dist/cru-payments'
import template from '../templates/creditCardCvv.tpl.html'

const directiveName = 'creditCardCvv'

const creditCardCvv = /* @ngInject */ function () {
  const directiveDefinitionObject = {
    restrict: 'E',
    templateUrl: template,
    scope: {
      disableContinue: '&',
    },
    link: function (scope) {
      console.log(scope)
      const cvvForm = scope.paymentMethodForm.securityCode
    
      scope.$watch(() => cvvForm.$viewValue, () => {
        cvvForm.$validators.minLength = modelValue => cruPayments.creditCard.cvv.validate.minLength(modelValue)
        cvvForm.$validators.maxLength = modelValue => cruPayments.creditCard.cvv.validate.maxLength(modelValue)
        scope.disableContinue({$event: cvvForm.$valid})
      })
    }
  }
  return directiveDefinitionObject
}

export default angular
  .module(directiveName, [])
  .directive(directiveName, creditCardCvv)
