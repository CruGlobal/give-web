import angular from 'angular';
import 'angular-mocks';
import module from './payment-methods.component';

describe('payment methods', function() {
  beforeEach(angular.mock.module(module.name));
  let self = {},
      uibModal = jasmine.createSpyObj('$uibModal', ['open']);

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope,
      $uibModal: uibModal
    });
  }));

  it('to be defined', () => {
    expect(self.controller).toBeDefined();
  });

  it('should open a modal', () => {
    self.controller.addPaymentMethod();
    expect(self.controller.$uibModal.open).toHaveBeenCalled();
  });
});
