import angular from 'angular';
import 'angular-mocks';
import module from 'app/profile/payment-methods/credit-card/credit-card.component.js';

describe('credit card payment methods', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {},
      orderService = jasmine.createSpyObj('orderService', ['formatAddressForTemplate']),
      envService = {
        read: angular.noop
      };

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope,
      envService: envService,
      orderService: orderService
    });
  }));

  beforeEach(() => {
    self.controller.model = {};
    self.controller.model['expiry-month'] = '05';
    self.controller.model.address = {};
    self.controller.model['expiry-year'] = '2019';
    self.controller.model['card-type'] = 'American Express';
  });

  it('to be defined', () => {
    expect(self.controller).toBeDefined();
  });

  it('should return call orderService.formatAddressForTemplate()', () => {
    self.controller.$onInit();
    expect(self.controller.orderService.formatAddressForTemplate).toHaveBeenCalled();
  });

  it('should return expiration date', () => {
    expect(self.controller.getExpiration()).toBe('05/2019');
  });

  it('should return part of image url path', () => {
    expect(self.controller.getImage()).toBe('american-express');
  });

});
