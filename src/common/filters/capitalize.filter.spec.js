import angular from 'angular';
import 'angular-mocks';
import module from './capitalize.filter';

describe('capitalize filter', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function ($filter) {
    self.$filter = $filter;
  }));

  it('should leave the string untouched if it already capitalized', () => {
    expect(self.$filter('capitalize')('Capitalized string')).toEqual(
      'Capitalized string',
    );
  });

  it('should capitalize the first letter of a string', () => {
    expect(self.$filter('capitalize')('uncapitalized string')).toEqual(
      'Uncapitalized string',
    );
  });
});
