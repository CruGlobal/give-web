import angular from 'angular';
import 'angular-mocks';
import module from './main.component';

describe('main', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope
    });
  }));

  it('has test which is 5', function() {
    expect(self.controller.test).toEqual(5);
  });
});
