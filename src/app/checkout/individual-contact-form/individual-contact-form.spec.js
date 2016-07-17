import angular from 'angular';
import 'angular-mocks';
import individualConatactFormModule from './individual-contact-form.component';

describe('cart summary', function() {
  beforeEach(angular.mock.module(individualConatactFormModule.name));
  var self = {};

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(individualConatactFormModule.name, {
      $scope: $scope
    });
  }));

  it('has test which is 5', function() {
    expect(self.controller.test).toEqual(5);
  });
});
