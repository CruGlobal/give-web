import angular from 'angular';
import 'angular-mocks';
import module from './productConfig.modal';

describe('product config modal', function() {
  beforeEach(angular.mock.module(module.name));
  let self = {}, uibModalInstance, productData, itemConfig;

  beforeEach(inject(function($rootScope, $controller) {
    uibModalInstance = {
      close:   angular.noop,
      dismiss: angular.noop
    };

    productData = {};
    itemConfig = {
      amount: 100
    };

    self.controller = $controller(module.name, {
      $uibModalInstance: uibModalInstance,
      productData: productData,
      itemConfig: itemConfig
    });

  }));

  it('to be defined', function() {
    expect(self.controller).toBeDefined();
  });

  it('should change amount', function() {
    self.controller.itemConfig = {
      amount: 100
    };
    self.controller.changeAmount(5000);
    expect(self.controller.itemConfig.amount).toEqual(5000);
  });
});
