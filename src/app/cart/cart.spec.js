import angular from 'angular';
import 'angular-mocks';
import module from './cart.component';

describe('cart', function() {
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

  it('should convert start day and month to js date', () => {
    expect(self.controller.donationStartDate(10, 5)).toEqual(new Date(0, 9, 5));
  });
});
