import angular from 'angular';
import 'angular-mocks';
import mainModule from './main';

describe('main', function() {
  beforeEach(angular.mock.module(mainModule.name));
  var self = {};

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController('main', {
      $scope: $scope
    });
  }));

  it('has test which is 5', function() {
    expect(self.controller.test).toEqual(5);
  });
});
