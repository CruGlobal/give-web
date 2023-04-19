import angular from 'angular'
import appConfig from 'common/app.config'
import * as cruPayments from '@cruglobal/cru-payments/dist/cru-payments'

const directiveName = 'creditCardNumber'

const creditCardNumberDirective = /* @ngInject */ function () {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function (scope, element, attrs, ngModelCtrl) {
      if (!ngModelCtrl) {
        return
      }

      ngModelCtrl.$parsers.unshift(function (creditCardNumber) {
        let trimmedCardNum = creditCardNumber.replace(/\s+/g, '').replace(/\D/gi, '')
        const cardType = cruPayments.creditCard.card.info.type(creditCardNumber)
        const numbers = []

        if (cardType === 'Visa' || cardType === 'MasterCard' || cardType === 'Discover') {
          if (trimmedCardNum.length > 16) {
            trimmedCardNum = trimmedCardNum.substr(0, 16)
          }
          const partitions = [4, 4, 4, 4]
          let position = 0
          partitions.forEach(partition => {
            const part = trimmedCardNum.substr(position, partition)
            if (part) numbers.push(part)
            position += partition
          })
          ngModelCtrl.$setViewValue(numbers.join(' '))
          ngModelCtrl.$commitViewValue()
          ngModelCtrl.$render()
          return numbers.join(' ')
        }

        if (cardType === 'American Express') {
          if (trimmedCardNum.length > 15) {
            trimmedCardNum = trimmedCardNum.substr(0, 15)
          }
          const partitions = [4, 6, 5]
          let position = 0
          partitions.forEach(partition => {
            const part = trimmedCardNum.substr(position, partition)
            if (part) {
              numbers.push(part)
              position += partition
            }
          })
          ngModelCtrl.$setViewValue(numbers.join(' '))
          ngModelCtrl.$commitViewValue()
          ngModelCtrl.$render()
          return numbers.join(' ')
        }

        if (cardType === 'Diners Club') {
          if (trimmedCardNum.length > 14) {
            trimmedCardNum = trimmedCardNum.substr(0, 14)
          }
          const partitions = [4, 6, 4]
          let position = 0
          partitions.forEach(partition => {
            const part = trimmedCardNum.substr(position, partition)
            if (part) numbers.push(part)
            position += partition
          })
          ngModelCtrl.$setViewValue(numbers.join(' '))
          ngModelCtrl.$commitViewValue()
          ngModelCtrl.$render()
          return numbers.join(' ')
        }
        return creditCardNumber
      })
    }
  }
}

export default angular
  .module(directiveName, [
    appConfig.name
  ])
  .directive(directiveName, creditCardNumberDirective)
