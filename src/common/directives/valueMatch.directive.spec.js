import angular from 'angular';
import 'angular-mocks';
import module from './valueMatch.directive';

describe('valueMatch', function () {
  beforeEach(angular.mock.module(module.name));
  let form, scope;

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    const tpl =
      '<form name="form">' +
      '<input type="password" name="password" ng-model="password">' +
      '<input type="password" name="check" ng-model="check" value-match="password">' +
      '</form>';
    scope = _$rootScope_.$new();
    _$compile_(tpl)(scope);
    form = scope.form;
  }));

  it('is valid when values match', () => {
    form.password.$setViewValue('Cerebro123');
    form.check.$setViewValue('Cerebro123');
    scope.$digest();

    expect(scope.check).toEqual('Cerebro123');
    expect(form.check.$valid).toEqual(true);
    expect(form.check.$error.valueMatch).not.toBeDefined();
  });

  it('is invalid when values do not match', () => {
    form.password.$setViewValue('hello123');
    form.check.$setViewValue('Cerebro123');
    scope.$digest();

    expect(scope.check).not.toBeDefined();
    expect(form.check.$valid).toEqual(false);
    expect(form.check.$error.valueMatch).toBeDefined();
  });
});
