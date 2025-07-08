import angular from 'angular';
import 'angular-mocks';
import module from './navCartIcon.component';

import { giftAddedEvent, cartUpdatedEvent } from 'common/lib/cartEvents';

describe('nav cart icon', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl;

  beforeEach(inject(function (_$componentController_) {
    $ctrl = _$componentController_(module.name);
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  it('$onInit()', () => {
    jest.spyOn($ctrl.$rootScope, '$on').mockImplementation(() => {});
    jest.spyOn($ctrl, 'giftAddedToCart').mockImplementation(() => {});

    $ctrl.$onInit();

    expect($ctrl.$rootScope.$on).toHaveBeenCalledWith(
      giftAddedEvent,
      expect.any(Function),
    );
    $ctrl.$rootScope.$on.mock.calls[0][1]();

    expect($ctrl.giftAddedToCart).toHaveBeenCalled();
  });

  describe('giftAddedToCart()', () => {
    it('opens nav cart when giftAdded', () => {
      $ctrl.giftAddedToCart();

      expect($ctrl.cartOpen).toEqual(true);
    });
  });

  describe('cartOpened()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.$rootScope, '$emit').mockImplementation(() => {});
    });

    it("should send event to load cart if nav cart hasn't been opened before", () => {
      $ctrl.cartOpened();

      expect($ctrl.cartOpenedPreviously).toEqual(true);
      expect($ctrl.$rootScope.$emit).toHaveBeenCalledWith(cartUpdatedEvent);
    });

    it('should not send event to load cart if nav cart has been opened before', () => {
      $ctrl.cartOpenedPreviously = true;
      $ctrl.cartOpened();

      expect($ctrl.cartOpenedPreviously).toEqual(true);
      expect($ctrl.$rootScope.$emit).not.toHaveBeenCalled();
    });
  });

  describe('miniCartViewAnalyticsEvent()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'miniCartViewAnalyticsEvent');
      jest
        .spyOn($ctrl.analyticsFactory, 'cartView')
        .mockImplementation(() => {});
    });

    it('should fire the analytics event', () => {
      $ctrl.miniCartViewAnalyticsEvent();
      expect($ctrl.miniCartViewAnalyticsEvent).toHaveBeenCalled();
      expect($ctrl.analyticsFactory.cartView).toHaveBeenCalledWith(true);
    });
  });
});
