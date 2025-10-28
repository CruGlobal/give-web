import angular from 'angular';
import 'angular-mocks';
import module, { submitOrderEvent } from './cart-summary.component';

describe('checkout', function () {
  describe('cart summary', function () {
    let $rootScope, $scope, $componentController, controller;

    beforeEach(angular.mock.module(module.name));

    beforeEach(inject(function (_$rootScope_, _$componentController_) {
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      $componentController = _$componentController_;

      controller = $componentController(module.name, { $scope });
    }));

    it('should be defined', function () {
      expect(controller).toBeDefined();
    });

    describe('buildCartUrl', () => {
      it('should get the url from the cart service', () => {
        jest.spyOn(controller.cartService, 'buildCartUrl');
        controller.buildCartUrl();
        expect(controller.cartService.buildCartUrl).toHaveBeenCalled();
      });
    });

    describe('onSubmit', () => {
      it('should trigger the submitOrderEvent listener', () => {
        const listenerSpy = jest.fn();

        const deregister = $rootScope.$on(submitOrderEvent, listenerSpy);

        controller.onSubmit();
        $rootScope.$digest();

        expect(listenerSpy).toHaveBeenCalled();
        deregister();
      });
    });
  });
});
