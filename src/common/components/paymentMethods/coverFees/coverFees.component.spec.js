import angular from 'angular';
import 'angular-mocks';
import module from './coverFees.component';

describe('coverFees', () => {
  beforeEach(angular.mock.module(module.name));
  const self = {};

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(
      module.name,
      {},
      {
        cartData: { items: [] },
      },
    );
  }));

  describe('$onInit', () => {
    it('should configure a common "item" object for the template if the cart has one item', () => {
      const cartItem = {};
      self.controller.cartData = { items: [cartItem] };
      const expectedItem = cartItem;

      self.controller.$onInit();
      expect(self.controller.item).toEqual(expectedItem);
    });

    it('should configure a common "item" object for the template if we are in branded checkout', () => {
      const brandedCheckoutItem = { AMOUNT: 1.02 };
      self.controller.brandedCheckoutItem = brandedCheckoutItem;
      self.controller.cartData = undefined;

      self.controller.$onInit();
      expect(self.controller.item).toEqual(brandedCheckoutItem);
    });

    it('should not configure a common "item" object if the cart has multiple items', () => {
      self.controller.cartData = { items: [{}, {}] };
      self.controller.$onInit();
      expect(self.controller.item).not.toBeDefined();
    });
  });

  describe('storeCoverFeeDecision', () => {
    beforeEach(() => {
      jest
        .spyOn(self.controller.orderService, 'storeCoverFeeDecision')
        .mockImplementation(() => {});
    });

    it('should store true for the cover fee decision', () => {
      self.controller.coverFees = true;
      self.controller.storeCoverFeeDecision();
      expect(
        self.controller.orderService.storeCoverFeeDecision,
      ).toHaveBeenCalledWith(true);
    });

    it('should store false for the cover fee decision', () => {
      self.controller.coverFees = false;
      self.controller.storeCoverFeeDecision();
      expect(
        self.controller.orderService.storeCoverFeeDecision,
      ).toHaveBeenCalledWith(false);
    });
  });
});
