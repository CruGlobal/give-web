import angular from 'angular';
import 'angular-mocks';
import suggestedGiftAmounts from './suggestedGiftAmounts.component';

describe('suggestedGiftAmounts', () => {
  let $ctrl;

  beforeEach(() => {
    angular.mock.module(suggestedGiftAmounts.name);

    angular.mock.inject(($componentController) => {
      $ctrl = $componentController(
        'suggestedGiftAmounts',
        {},
        { premiumMinimum: 5, itemConfig: {} },
      );
    });
  });

  describe('showPremiumMinimumMessage()', () => {
    it('is false without a premium minimum', () => {
      $ctrl.premiumMinimum = null;
      $ctrl.itemConfig.AMOUNT = 4;

      expect($ctrl.showPremiumMinimumMessage()).toBe(false);
    });

    it('is true when the amount is below the minimum', () => {
      $ctrl.itemConfig.AMOUNT = 4.99;

      expect($ctrl.showPremiumMinimumMessage()).toBe(true);
    });

    it('is false when the amount meets the minimum', () => {
      $ctrl.itemConfig.AMOUNT = 5;

      expect($ctrl.showPremiumMinimumMessage()).toBe(false);
    });

    it('is false when the amount is missing or not a number', () => {
      expect($ctrl.showPremiumMinimumMessage()).toBe(false);

      $ctrl.itemConfig.AMOUNT = NaN;

      expect($ctrl.showPremiumMinimumMessage()).toBe(false);
    });

    it('uses the amount from before the custom field was focused', () => {
      $ctrl.amountAtFocus = 4;
      $ctrl.itemConfig.AMOUNT = 10;

      expect($ctrl.showPremiumMinimumMessage()).toBe(true);

      $ctrl.amountAtFocus = 10;
      $ctrl.itemConfig.AMOUNT = 4;

      expect($ctrl.showPremiumMinimumMessage()).toBe(false);
    });
  });
});
