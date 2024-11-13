import angular from 'angular'
import * as cruPayments from '@cruglobal/cru-payments/dist/cru-payments'
import template from '../templates/creditCardCvv.tpl.html'

const directiveName = 'creditCardCvv'

const creditCardCvv = /* @ngInject */ function () {
  const directiveDefinitionObject = {
    restrict: 'E',
    templateUrl: template,
    scope: {
      setCvvValid: '&' 
    },

    link: function (scope) {
      const cvvForm = scope.$ctrl.form.cvv
      
      scope.$watch(() => cvvForm.$viewValue, function () {
        console.log('validate')
        scope.$ctrl.form.cvv.$validate()
      })

      cvvForm.$validators.creditCardCvv = function (modelValue) {
        const isCvvValid = (cruPayments.creditCard.cvv.validate.minLength(modelValue)) && (cruPayments.creditCard.cvv.validate.maxLength(modelValue))
        scope.setCvvValid({$event: isCvvValid})
				return isCvvValid
      }
    }
  }
  return directiveDefinitionObject
}

export default angular
  .module(directiveName, [])
  .directive(directiveName, creditCardCvv)
