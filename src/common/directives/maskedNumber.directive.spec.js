import angular from 'angular';
import 'angular-mocks';
import module, { getMaskedNumber } from './maskedNumber.directive';

describe('maskedNumber directive', () => {
  beforeEach(angular.mock.module(module.name));

  describe('getMaskedNumber', () => {
    it('should return an empty string when there is no value', () => {
      expect(getMaskedNumber(undefined, 'card')).toBe('');
      expect(getMaskedNumber('', 'account')).toBe('');
    });

    it('should show a card number as four groups with the last four digits', () => {
      expect(getMaskedNumber('4111 1111 1111 1234', 'card')).toBe(
        '**** **** **** 1234',
      );
    });

    it('should ignore spaces and other non-digits', () => {
      expect(getMaskedNumber('3782 822463 1-0005', 'card')).toBe(
        '**** **** **** 0005',
      );
    });

    it('should use one star for each hidden account digit', () => {
      expect(getMaskedNumber('123456789012', 'account')).toBe('********9012');
      expect(getMaskedNumber('12345678', 'account')).toBe('****5678');
    });

    it('should not crash on account numbers shorter than four digits', () => {
      expect(getMaskedNumber('12', 'account')).toBe('12');
    });
  });

  describe('link', () => {
    let $scope, form, input, wrapper;

    const compile = (format = 'account') => {
      inject(($compile, $rootScope) => {
        $scope = $rootScope.$new();
        const element = $compile(
          '<form name="form"><div class="masked-number-wrapper">' +
            `<input type="text" name="number" ng-model="number" ng-minlength="4" masked-number="${format}">` +
            '</div></form>',
        )($scope);
        $scope.$digest();
        form = $scope.form;
        wrapper = element[0].querySelector('.masked-number-wrapper');
        input = angular.element(wrapper.querySelector('input'));
      });
    };
    const getMask = () => wrapper.querySelector('.masked-number');
    const type = (value) => {
      input.val(value).triggerHandler('input');
      $scope.$digest();
    };

    beforeEach(() => compile());

    it('should not mask an empty field', () => {
      expect(getMask()).toBeNull();
      expect(input.hasClass('is-masked')).toBe(false);
    });

    it('should mask a valid field that is not focused', () => {
      type('123456789012');

      expect(getMask().textContent).toBe('********9012');
      expect(getMask().getAttribute('aria-hidden')).toBe('true');
      expect(input.hasClass('is-masked')).toBe(true);
    });

    it('should put the overlay right after the input', () => {
      type('123456789012');

      expect(input[0].nextElementSibling).toBe(getMask());
    });

    it('should not mask an invalid field', () => {
      type('12');

      expect(form.number.$valid).toBe(false);
      expect(getMask()).toBeNull();
      expect(input.hasClass('is-masked')).toBe(false);
    });

    it('should unmask on focus and mask again on blur', () => {
      type('123456789012');

      input.triggerHandler('focus');
      expect(getMask()).toBeNull();
      expect(input.hasClass('is-masked')).toBe(false);

      input.triggerHandler('blur');
      expect(getMask().textContent).toBe('********9012');
      expect(input.hasClass('is-masked')).toBe(true);
    });

    it('should not mask while typing in a focused field', () => {
      input.triggerHandler('focus');
      type('123456789012');

      expect(getMask()).toBeNull();
      expect(input.hasClass('is-masked')).toBe(false);
    });

    it('should only ever add one overlay', () => {
      type('123456789012');
      type('1234567890123');

      expect(wrapper.querySelectorAll('.masked-number').length).toBe(1);
      expect(getMask().textContent).toBe('*********0123');
    });

    it('should keep the full value in the model while masked', () => {
      type('123456789012');

      expect($scope.number).toBe('123456789012');
    });

    it('should use the card format when asked', () => {
      compile('card');
      type('4111111111111111');

      expect(getMask().textContent).toBe('**** **** **** 1111');
    });

    it('should fall back to the account format for an unknown format', () => {
      compile('unknown');
      type('123456789012');

      expect(getMask().textContent).toBe('********9012');
    });

    it('should remove the overlay when the scope is destroyed', () => {
      type('123456789012');
      $scope.$destroy();

      expect(getMask()).toBeNull();
    });
  });
});
