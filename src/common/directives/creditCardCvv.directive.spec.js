import angular from 'angular';
import 'angular-mocks';
import module from './creditCardCvv.directive';
import showErrors from 'common/filters/showErrors.filter';

describe('creditCardCvv', function () {
  beforeEach(angular.mock.module(module.name, showErrors.name));
  let scope, element, input;

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    scope = _$rootScope_.$new();
    scope.$ctrl = { creditCardPayment: {} };
    element = _$compile_('<credit-card-cvv></credit-card-cvv>')(scope);
    scope.$digest();
    input = element.find('input');
  }));

  it('never uses a password field, so browsers do not offer to save the CVV', () => {
    expect(input.attr('type')).toEqual('text');
    input.triggerHandler('focus');
    input.triggerHandler('blur');
    scope.$digest();

    expect(input.attr('type')).toEqual('text');
  });

  it('masks the input before the user focuses it', () => {
    expect(input.hasClass('is-cvv-masked')).toBe(true);
  });

  it('shows the value while the input is focused', () => {
    input.triggerHandler('focus');
    scope.$digest();

    expect(input.hasClass('is-cvv-masked')).toBe(false);
  });

  it('masks the value again after the input loses focus', () => {
    input.triggerHandler('focus');
    scope.$digest();
    input.triggerHandler('blur');
    scope.$digest();

    expect(input.hasClass('is-cvv-masked')).toBe(true);
  });

  it('still updates the model while masked', () => {
    input.val('123').triggerHandler('input');
    scope.$digest();

    expect(scope.$ctrl.creditCardPayment.securityCode).toEqual('123');
  });

  it('keeps the focus flag on its own scope', () => {
    input.triggerHandler('focus');
    scope.$digest();

    expect(scope.isCvvFocused).toBeUndefined();
  });
});
