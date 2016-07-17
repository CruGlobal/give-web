import angular from 'angular';
import 'angular-mocks';
import cartSummaryModule from './cart-summary.component';

describe('cart summary', function() {
  beforeEach(angular.mock.module(cartSummaryModule.name));
  var self = {};

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(cartSummaryModule.name, {
      $scope: $scope
    });
  }));

  it('has test which is 5', function() {
    expect(self.controller.test).toEqual(5);
  });
});
