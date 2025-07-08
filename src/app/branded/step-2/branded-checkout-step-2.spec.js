import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './branded-checkout-step-2.component';

describe('branded checkout step 2', () => {
  beforeEach(angular.mock.module(module.name));
  let $ctrl;

  beforeEach(inject(($componentController) => {
    $ctrl = $componentController(module.name, null, {
      next: jest.fn(),
      previous: jest.fn(),
    });
  }));

  describe('$onInit', () => {
    it('should load cart', () => {
      jest.spyOn($ctrl, 'loadCart').mockImplementation(() => {});
      jest.spyOn($ctrl, 'loadRadioStation').mockImplementation(() => {});
      $ctrl.$onInit();

      expect($ctrl.loadCart).toHaveBeenCalled();
      expect($ctrl.loadRadioStation).toHaveBeenCalled();
    });
  });

  describe('loadCart', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.brandedAnalyticsFactory, 'saveCoverFees');
      jest.spyOn($ctrl.brandedAnalyticsFactory, 'saveItem');
      jest.spyOn($ctrl.brandedAnalyticsFactory, 'addPaymentInfo');
      jest.spyOn($ctrl.brandedAnalyticsFactory, 'reviewOrder');
      jest
        .spyOn($ctrl.orderService, 'retrieveCoverFeeDecision')
        .mockReturnValue(true);
    });

    it('should load cart data', () => {
      const cartData = { items: [] };
      jest
        .spyOn($ctrl.cartService, 'get')
        .mockReturnValue(Observable.of(cartData));
      $ctrl.loadCart();

      expect($ctrl.cartData).toEqual(cartData);
      expect($ctrl.errorLoadingCart).toEqual(false);
      expect($ctrl.brandedAnalyticsFactory.saveCoverFees).toHaveBeenCalledWith(
        true,
      );
      expect($ctrl.brandedAnalyticsFactory.saveItem).toHaveBeenCalledWith(
        $ctrl.cartData.items[0],
      );
      expect($ctrl.brandedAnalyticsFactory.addPaymentInfo).toHaveBeenCalled();
      expect($ctrl.brandedAnalyticsFactory.reviewOrder).toHaveBeenCalled();
    });

    it('should handle error', () => {
      jest
        .spyOn($ctrl.cartService, 'get')
        .mockReturnValue(Observable.throw('some error'));
      $ctrl.loadCart();

      expect($ctrl.cartData).toBeUndefined();
      expect($ctrl.errorLoadingCart).toEqual(true);
      expect($ctrl.$log.error.logs[0]).toEqual([
        'Error loading cart data for branded checkout step 2',
        'some error',
      ]);
      expect(
        $ctrl.brandedAnalyticsFactory.addPaymentInfo,
      ).not.toHaveBeenCalled();
      expect($ctrl.brandedAnalyticsFactory.reviewOrder).not.toHaveBeenCalled();
    });
  });

  describe('loadRadioStation', () => {
    it('should load radio station name', () => {
      jest
        .spyOn($ctrl.orderService, 'retrieveRadioStationName')
        .mockReturnValue('some data');
      $ctrl.loadRadioStation();

      expect($ctrl.radioStationName).toEqual('some data');
    });
  });

  describe('changeStep', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.brandedAnalyticsFactory, 'checkoutChange');
      jest
        .spyOn($ctrl.orderService, 'retrieveCoverFeeDecision')
        .mockReturnValue(true);
    });

    it('should call next if nextStep is thankYou', () => {
      $ctrl.cartData = { items: [] };
      $ctrl.changeStep('thankYou');

      expect($ctrl.next).toHaveBeenCalled();
      expect(
        $ctrl.brandedAnalyticsFactory.checkoutChange,
      ).not.toHaveBeenCalled();
    });

    it('should call previous otherwise', () => {
      $ctrl.changeStep('otherStep');

      expect($ctrl.previous).toHaveBeenCalled();
      expect($ctrl.brandedAnalyticsFactory.checkoutChange).toHaveBeenCalledWith(
        'otherStep',
      );
    });
  });
});
