import angular from 'angular';
import 'angular-mocks';
import module from './recurring-gifts.component';

describe('recurringGiftsController', function () {
  beforeEach(angular.mock.module(module.name));
  const self = {};

  beforeEach(inject(function ($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope,
    });
  }));

  it('to be defined', () => {
    expect(self.controller).toBeDefined();
  });
});
