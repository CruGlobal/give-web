import angular from 'angular';
import 'angular-mocks';
import module from './bank-account.component';

describe('bank account payment method', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {},
      envService = {
        read: angular.noop
      };

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope,
      envService: envService
    });
  }));

  it('to be defined', function() {
    expect(self.controller).toBeDefined();
  });

  it('should return expiration date', () => {
    self.controller.model = {};
    self.controller.model['expiry-month'] = '05';
    self.controller.model['expiry-year'] = '2019';
    expect(self.controller.getExpiration()).toBe('05/2019');
  });

});
