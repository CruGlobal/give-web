/* eslint-disable angular/no-private-call */
import angular from 'angular';
import 'angular-mocks';
import module from './showErrors.filter';

describe('showErrors filter', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function ($filter) {
    self.$filter = $filter;
  }));

  it('should return false if ngModelController is not set', () => {
    expect(self.$filter('showErrors')()).toEqual(false);
  });

  it('should return true if there is an error and it has been touched', () => {
    const ngModelController = {
      $invalid: true,
      $touched: true,
      $$parentForm: {
        $submitted: false,
      },
    };

    expect(self.$filter('showErrors')(ngModelController)).toEqual(true);
  });

  it('should return true if there is an error and it has been submitted', () => {
    const ngModelController = {
      $invalid: true,
      $touched: false,
      $$parentForm: {
        $submitted: true,
      },
    };

    expect(self.$filter('showErrors')(ngModelController)).toEqual(true);
  });

  it('should return true if there is an error and it has been touched and it has been submitted', () => {
    const ngModelController = {
      $invalid: true,
      $touched: true,
      $$parentForm: {
        $submitted: true,
      },
    };

    expect(self.$filter('showErrors')(ngModelController)).toEqual(true);
  });

  it('should return false if there is an error but it has not been touched or submitted', () => {
    const ngModelController = {
      $invalid: true,
      $touched: false,
      $$parentForm: {
        $submitted: false,
      },
    };

    expect(self.$filter('showErrors')(ngModelController)).toEqual(false);
  });

  it('should return false if there is no error', () => {
    const ngModelController = {
      $invalid: false,
      $touched: true,
      $$parentForm: {
        $submitted: true,
      },
    };

    expect(self.$filter('showErrors')(ngModelController)).toEqual(false);
    ngModelController.$touched = false;
    ngModelController.$$parentForm.$submitted = false;

    expect(self.$filter('showErrors')(ngModelController)).toEqual(false);
    ngModelController.$touched = true;
    ngModelController.$$parentForm.$submitted = false;

    expect(self.$filter('showErrors')(ngModelController)).toEqual(false);
    ngModelController.$touched = false;
    ngModelController.$$parentForm.$submitted = true;

    expect(self.$filter('showErrors')(ngModelController)).toEqual(false);
  });
});
