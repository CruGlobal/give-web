import angular from 'angular';
import 'angular-mocks';
import module, { modifyDisplay } from './creditCardNumber.directive';

describe('creditCardNumber directive', function () {
  beforeEach(angular.mock.module(module.name));

  let $compile, $scope, ngModelCtrl, form;
  const VISA = '4111111111111111';
  const FORMATTED_VISA = '4111 1111 1111 1111';
  const FORMATTED_DINERS_CLUB = '3056 930902 5904';
  const FORMATTED_AMEX = '3782 822463 10005';

  beforeEach(() => {
    inject(($injector, $rootScope) => {
      $scope = $rootScope.$new();
      $compile = $injector.get('$compile');

      const template =
        '<form name="form">' +
        '<input type="text" name="cardNumber" ng-model="cardNumber" credit-card-number>' +
        '</form>';

      ngModelCtrl = {
        $setViewValue: jest.fn(),
        $render: jest.fn(),
      };
      $compile(template)($scope);
      form = $scope.form;
    });
  });

  it('should skip logic if there is no ng-model', () => {
    const template =
      '<form name="form">' +
      '<input type="text" name="cardNumber" credit-card-number>' +
      '</form>';
    $compile(template)($scope);
    form = $scope.form;
    $scope.$digest();
  });

  it('should handle a Visa card format', () => {
    testCardNumber(VISA, FORMATTED_VISA);
  });

  it('should handle an American Express card format', () => {
    testCardNumber('378282246310005', FORMATTED_AMEX);
  });

  it('should handle a Diners Club card format', () => {
    testCardNumber('30569309025904', FORMATTED_DINERS_CLUB);
  });

  it('should trim a too-long MasterCard', () => {
    testCardNumber(' 51051051051051009 ', '5105 1051 0510 5100');
  });

  it('should trim a too-long American Express card', () => {
    testCardNumber(' 3782822463100059 ', FORMATTED_AMEX);
  });

  it('should trim a too-long Diners Club card', () => {
    testCardNumber(' 305693090259049 ', FORMATTED_DINERS_CLUB);
  });

  it('should handle an incomplete number', () => {
    testCardNumber('12345', '12345');
  });

  const testCardNumber = (unformatted, formatted) => {
    form.cardNumber.$setViewValue(unformatted);
    $scope.$digest();
    expect($scope.cardNumber).toEqual(formatted);
  };

  describe('modifyDisplay', () => {
    it('should format a number', () => {
      const partitions = [4, 4, 4, 4];
      const trimmedCardNumber = VISA;
      let numbers = [];
      const formattedNumber = modifyDisplay(
        ngModelCtrl,
        partitions,
        trimmedCardNumber,
        numbers,
      );
      expect(formattedNumber).toEqual(FORMATTED_VISA);
    });
  });
});
