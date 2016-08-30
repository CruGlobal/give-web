import angular from 'angular';
import 'angular-mocks';
import module from './payment-method.component';

describe('payment-method', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope
    });
  }));

  it('to be defined', function() {
    expect(self.controller).toBeDefined();
  });

  it('should return last 4 digits of card number', () => {
    self.controller.model = {
      card_number: '4444444444442222'
    }
    expect(self.controller.getLastFourDigits()).toBe('ending in ****2222')
  })

  it('should return expiration date', () => {
    self.controller.model = {
      expiry_month: '05',
      expiry_year: '2019'
    }
    expect(self.controller.getExpiration()).toBe('EXPIRES 05/2019')
  })

});
