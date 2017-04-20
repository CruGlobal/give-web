import angular from 'angular';
import 'angular-mocks';
import module from './payment-icon.component';

describe('payment-method', function() {
  beforeEach(angular.mock.module(module.name));
  let self = {};
  let envService = {read:angular.noop};

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
  it('should return a path',() => {
    self.controller.type = 'American Express';
    expect(self.controller.getPath()).toBe('cc-icons/american-express-curved-128px');
    self.controller.type = undefined; // case for bank account
    expect(self.controller.getPath()).toBe('icon-bank');
  });

});
