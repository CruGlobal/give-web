import angular from 'angular';
import 'angular-mocks';
import checkoutModule from './checkout';

describe('checkout', function() {
  beforeEach(angular.mock.module(checkoutModule.name));
  var self = {};

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController('checkout', {
      $scope: $scope
    });
  }));

  it('has test which is 5', function() {
    expect(self.controller.test).toEqual(5);
  });
});
