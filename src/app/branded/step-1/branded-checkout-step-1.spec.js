import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './branded-checkout-step-1.component';

describe('branded checkout step 1', () => {
  beforeEach(angular.mock.module(module.name));
  let $ctrl;

  beforeEach(inject(($componentController) => {
    $ctrl = $componentController(module.name, null, {
      next: jest.fn(),
      onPaymentFailed: jest.fn(),
    });
  }));

  describe('$onInit', () => {
    it('should load cart', () => {
      jest.spyOn($ctrl, 'resetSubmission').mockImplementation(() => {});
      jest.spyOn($ctrl, 'initItemConfig').mockImplementation(() => {});
      jest.spyOn($ctrl, 'initCart').mockImplementation(() => {});
      $ctrl.$onInit();

      expect($ctrl.resetSubmission).toHaveBeenCalled();
      expect($ctrl.initItemConfig).toHaveBeenCalled();
      expect($ctrl.initCart).toHaveBeenCalled();
    });
  });

  describe('initItemConfig', () => {
    it('should initialize item config', () => {
      $ctrl.campaignCode = '1234';
      $ctrl.campaignPage = '135';
      $ctrl.amount = '75';
      $ctrl.day = '9';
      $ctrl.initItemConfig();

      expect($ctrl.itemConfig).toEqual({
        CAMPAIGN_CODE: '1234',
        'campaign-page': '135',
        AMOUNT: '75',
        RECURRING_DAY_OF_MONTH: '9',
      });

      expect($ctrl.defaultFrequency).toBeUndefined();
    });

    it('should initialize monthly gifts', () => {
      $ctrl.frequency = 'monthly';
      $ctrl.initItemConfig();

      expect($ctrl.defaultFrequency).toEqual('MON');
      expect($ctrl.itemConfig.frequency).toEqual('monthly');
    });

    it('should initialize quarterly gifts', () => {
      $ctrl.frequency = 'quarterly';
      $ctrl.initItemConfig();

      expect($ctrl.defaultFrequency).toEqual('QUARTERLY');
      expect($ctrl.itemConfig.frequency).toEqual('quarterly');
    });

    it('should initialize annual gifts', () => {
      $ctrl.frequency = 'annually';
      $ctrl.initItemConfig();

      expect($ctrl.defaultFrequency).toEqual('ANNUAL');
      expect($ctrl.itemConfig.frequency).toEqual('annually');
    });

    it('should validate campaignCode (too long)', () => {
      $ctrl.campaignCode = 'abcdefghijklmnopqrstuvwxyz0123456789';
      $ctrl.initItemConfig();
      expect($ctrl.itemConfig.CAMPAIGN_CODE).toEqual('');
    });

    it('should validate campaignCode (non alpha numeric)', () => {
      $ctrl.campaignCode = '😅😳';
      $ctrl.initItemConfig();
      expect($ctrl.itemConfig.CAMPAIGN_CODE).toEqual('');
    });

    it('should set PREMIUM_CODE and premiumSelected by default if there is a premiumCode', () => {
      $ctrl.premiumCode = '112233';
      $ctrl.initItemConfig();
      expect($ctrl.itemConfig.PREMIUM_CODE).toEqual('112233');
      expect($ctrl.premiumSelected).toEqual(true);
    });

    it('should not set premium-code if there is not one', () => {
      $ctrl.initItemConfig();
      expect($ctrl.itemConfig.PREMIUM_CODE).toEqual(undefined);
      expect($ctrl.premiumSelected).toEqual(undefined);
    });

    it('should persist premiumSelected as false', () => {
      $ctrl.premiumCode = '112233';
      $ctrl.itemConfig = {};
      $ctrl.itemConfig.PREMIUM_CODE = undefined;
      $ctrl.initItemConfig();
      expect($ctrl.itemConfig.PREMIUM_CODE).toEqual(undefined);
      expect($ctrl.premiumSelected).toEqual(false);
    });

    it('should persist premiumSelected as true', () => {
      $ctrl.premiumCode = '112233';
      $ctrl.itemConfig = {};
      $ctrl.itemConfig.PREMIUM_CODE = $ctrl.premiumCode;
      $ctrl.initItemConfig();
      expect($ctrl.itemConfig.PREMIUM_CODE).toEqual($ctrl.premiumCode);
      expect($ctrl.premiumSelected).toEqual(true);
    });
  });

  describe('initCart', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.cartService, 'get').mockReturnValue(
        Observable.of({
          items: [
            { code: '1234567', config: {}, price: '$1.02', amount: 1.02 },
          ],
        }),
      );
      $ctrl.donorDetails = { mailingAddress: {} };
    });

    it('should get cart data and find existing item in cart', () => {
      $ctrl.campaignPage = 'campaign1';
      $ctrl.code = '1234567';
      $ctrl.initCart();

      expect($ctrl.cartService.get).toHaveBeenCalled();
      expect($ctrl.isEdit).toEqual(true);
      expect($ctrl.item.code).toEqual('1234567');
      expect($ctrl.itemConfig['campaign-page']).toEqual('campaign1');
      expect($ctrl.loadingProductConfig).toEqual(false);
    });

    it('should get cart data and not enter edit mode when cart has no items', () => {
      $ctrl.cartService.get.mockReturnValue(Observable.of({}));
      $ctrl.initCart();

      expect($ctrl.cartService.get).toHaveBeenCalled();
      expect($ctrl.isEdit).toBeUndefined();
      expect($ctrl.item).toBeUndefined();
      expect($ctrl.loadingProductConfig).toEqual(false);
    });

    it('should handle error loading cart', () => {
      $ctrl.cartService.get.mockReturnValue(Observable.throw('some error'));
      $ctrl.initCart();

      expect($ctrl.cartService.get).toHaveBeenCalled();
      expect($ctrl.isEdit).toBeUndefined();
      expect($ctrl.item).toBeUndefined();
      expect($ctrl.loadingProductConfig).toEqual(false);
      expect($ctrl.errorLoadingProductConfig).toEqual(true);
      expect($ctrl.$log.error.logs[0]).toEqual([
        'Error loading cart data for branded checkout step 1',
        'some error',
      ]);
    });
  });

  describe('submit', () => {
    beforeEach(() => {
      // $onInit always initializes itemConfig before the submit button can be clicked
      $ctrl.itemConfig = {};
    });

    it('should reset and start submission', () => {
      jest.spyOn($ctrl, 'resetSubmission').mockImplementation(() => {});
      $ctrl.submit();

      expect($ctrl.resetSubmission).toHaveBeenCalled();
      expect($ctrl.submitted).toEqual(true);
    });

    it('should flag the premium minimum but still let the panels validate', () => {
      jest.spyOn($ctrl, 'premiumMinimumMet').mockReturnValue(false);
      $ctrl.submit();

      expect($ctrl.premiumMinimumError).toEqual(true);
      expect($ctrl.submitted).toEqual(true);
    });

    it('should clear a previous premium minimum error when it is resolved', () => {
      jest.spyOn($ctrl, 'premiumMinimumMet').mockReturnValue(true);
      $ctrl.premiumMinimumError = true;
      $ctrl.submit();

      expect($ctrl.premiumMinimumError).toEqual(false);
      expect($ctrl.submitted).toEqual(true);
    });

    it('should clear a previous validation error', () => {
      $ctrl.validationError = true;
      $ctrl.submit();

      expect($ctrl.validationError).toEqual(false);
    });
  });

  describe('premiumMinimumMet', () => {
    beforeEach(() => {
      $ctrl.premiumMinimum = 50;
      $ctrl.itemConfig = { AMOUNT: 25, PREMIUM_CODE: '112233' };
    });

    it('should not be met when the premium is selected and the gift is under the minimum', () => {
      expect($ctrl.premiumMinimumMet()).toEqual(false);
    });

    it('should be met when the gift equals the minimum', () => {
      $ctrl.itemConfig.AMOUNT = 50;

      expect($ctrl.premiumMinimumMet()).toEqual(true);
    });

    it('should be met when the gift is over the minimum', () => {
      $ctrl.itemConfig.AMOUNT = 75;

      expect($ctrl.premiumMinimumMet()).toEqual(true);
    });

    it('should be met when the premium was declined', () => {
      $ctrl.itemConfig.PREMIUM_CODE = undefined;

      expect($ctrl.premiumMinimumMet()).toEqual(true);
    });

    it('should be met when no minimum applies', () => {
      $ctrl.premiumMinimum = null;

      expect($ctrl.premiumMinimumMet()).toEqual(true);
    });

    it('should be met when the gift amount is not a number, leaving that error to the amount field', () => {
      $ctrl.itemConfig.AMOUNT = '';

      expect($ctrl.premiumMinimumMet()).toEqual(true);
    });

    it('should handle a string gift amount', () => {
      $ctrl.itemConfig.AMOUNT = '25';

      expect($ctrl.premiumMinimumMet()).toEqual(false);
    });
  });

  describe('activePremiumMinimum', () => {
    beforeEach(() => {
      $ctrl.premiumMinimum = 50;
      $ctrl.itemConfig = { PREMIUM_CODE: '112233' };
    });

    it('should return the minimum while the premium is selected', () => {
      expect($ctrl.activePremiumMinimum()).toEqual(50);
    });

    it('should return null once the premium is declined', () => {
      $ctrl.itemConfig.PREMIUM_CODE = undefined;

      expect($ctrl.activePremiumMinimum()).toBeNull();
    });

    it('should return null when no minimum is configured', () => {
      $ctrl.premiumMinimum = null;

      expect($ctrl.activePremiumMinimum()).toBeNull();
    });
  });

  describe('resetSubmission', () => {
    it('should set all submission values', () => {
      $ctrl.resetSubmission();

      expect($ctrl.submission).toEqual({
        giftConfig: {
          completed: false,
          error: false,
        },
        contactInfo: {
          completed: false,
          error: false,
        },
        payment: {
          completed: false,
          error: false,
        },
      });
    });
  });

  describe('onGiftConfigStateChange', () => {
    beforeEach(() => {
      jest
        .spyOn($ctrl, 'checkSuccessfulSubmission')
        .mockImplementation(() => {});
      $ctrl.resetSubmission();
    });

    it('should handle a successful submission', () => {
      $ctrl.onGiftConfigStateChange('submitted');

      expect($ctrl.submission.giftConfig).toEqual({
        completed: true,
        error: false,
      });

      expect($ctrl.isEdit).toEqual(true);
      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
    });

    it('should handle an error submitting', () => {
      $ctrl.onGiftConfigStateChange('errorSubmitting');

      expect($ctrl.submission.giftConfig).toEqual({
        completed: true,
        error: true,
      });

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
    });

    it('should handle an error adding duplicate items', () => {
      $ctrl.onGiftConfigStateChange('errorAlreadyInCart');

      expect($ctrl.submission.giftConfig).toEqual({
        completed: true,
        error: true,
      });

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
    });

    it('should handle an invalid gift form', () => {
      $ctrl.onGiftConfigStateChange('errorValidating');

      expect($ctrl.submission.giftConfig).toEqual({
        completed: true,
        error: true,
      });

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
    });
  });

  describe('onContactInfoSubmit', () => {
    beforeEach(() => {
      jest
        .spyOn($ctrl, 'checkSuccessfulSubmission')
        .mockImplementation(() => {});
      jest.spyOn($ctrl.brandedAnalyticsFactory, 'saveDonorDetails');
      $ctrl.resetSubmission();
      $ctrl.donorDetails = {
        'donor-type': 'Household',
      };
    });

    it('should handle a successful submission', () => {
      $ctrl.onContactInfoSubmit(true);

      expect($ctrl.submission.contactInfo).toEqual({
        completed: true,
        error: false,
      });

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
      expect(
        $ctrl.brandedAnalyticsFactory.saveDonorDetails,
      ).toHaveBeenCalledWith($ctrl.donorDetails);
    });

    it('should handle an error submitting', () => {
      $ctrl.onContactInfoSubmit(false);

      expect($ctrl.submission.contactInfo).toEqual({
        completed: true,
        error: true,
      });

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
      expect(
        $ctrl.brandedAnalyticsFactory.saveDonorDetails,
      ).not.toHaveBeenCalled();
    });
  });

  describe('onPaymentStateChange', () => {
    beforeEach(() => {
      jest
        .spyOn($ctrl, 'checkSuccessfulSubmission')
        .mockImplementation(() => {});
      $ctrl.resetSubmission();
    });

    it('should handle a successful submission', () => {
      $ctrl.onPaymentStateChange('submitted');

      expect($ctrl.submission.payment).toEqual({
        completed: true,
        error: false,
      });

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
    });

    it('should handle an error submitting', () => {
      $ctrl.onPaymentStateChange('errorSubmitting');

      expect($ctrl.submission.payment).toEqual({
        completed: true,
        error: true,
      });

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
      expect($ctrl.onPaymentFailed).toHaveBeenCalled();
    });

    it('should handle an unsubmitted error', () => {
      $ctrl.onPaymentStateChange('unsubmitted');

      expect($ctrl.submission.payment).toEqual({
        completed: true,
        error: true,
      });

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
      expect($ctrl.onPaymentFailed).toHaveBeenCalled();
    });
  });

  describe('onSelectPremiumOption', () => {
    beforeEach(() => {
      $ctrl.initItemConfig();
      $ctrl.premiumCode = '112233';
    });

    it('premium selected', () => {
      $ctrl.premiumSelected = true;

      $ctrl.onSelectPremiumOption();

      expect($ctrl.itemConfig.PREMIUM_CODE).toEqual($ctrl.premiumCode);
    });

    it('premium deselected', () => {
      $ctrl.premiumSelected = false;

      $ctrl.onSelectPremiumOption();

      expect($ctrl.itemConfig.PREMIUM_CODE).toEqual(undefined);
    });
  });

  describe('checkSuccessfulSubmission', () => {
    beforeEach(() => {
      $ctrl.resetSubmission();
      $ctrl.submitted = true;
    });

    it("should do nothing if all submissions aren't completed", () => {
      $ctrl.checkSuccessfulSubmission();

      expect($ctrl.next).not.toHaveBeenCalled();
      expect($ctrl.submitted).toEqual(true);
    });

    it("should do nothing if some submissions aren't completed", () => {
      $ctrl.submission.giftConfig.completed = true;
      $ctrl.submission.contactInfo.completed = true;
      $ctrl.checkSuccessfulSubmission();

      expect($ctrl.next).not.toHaveBeenCalled();
      expect($ctrl.submitted).toEqual(true);
    });

    it('should call next if submissions completed and no errors', () => {
      $ctrl.submission.giftConfig.completed = true;
      $ctrl.submission.contactInfo.completed = true;
      $ctrl.submission.payment.completed = true;
      $ctrl.checkSuccessfulSubmission();

      expect($ctrl.next).toHaveBeenCalled();
      expect($ctrl.submitted).toEqual(true);
      expect($ctrl.validationError).toBeFalsy();
    });

    it('should set submitted to false if submissions completed and errors', () => {
      $ctrl.submission.giftConfig.completed = true;
      $ctrl.submission.contactInfo.completed = true;
      $ctrl.submission.payment.completed = true;
      $ctrl.submission.giftConfig.error = true;
      $ctrl.checkSuccessfulSubmission();

      expect($ctrl.next).not.toHaveBeenCalled();
      expect($ctrl.submitted).toEqual(false);
      expect($ctrl.validationError).toEqual(true);
    });

    it('should not continue when the gift is under the premium minimum', () => {
      $ctrl.submission.giftConfig.completed = true;
      $ctrl.submission.contactInfo.completed = true;
      $ctrl.submission.payment.completed = true;
      $ctrl.premiumMinimumError = true;
      $ctrl.checkSuccessfulSubmission();

      expect($ctrl.next).not.toHaveBeenCalled();
      expect($ctrl.submitted).toEqual(false);
      expect($ctrl.validationError).toEqual(true);
    });

    it('should not submit the order when the gift is under the premium minimum', () => {
      jest.spyOn($ctrl, 'submitOrderInternal').mockImplementation(() => {});
      $ctrl.useV3 = true;
      $ctrl.submission.giftConfig.completed = true;
      $ctrl.submission.contactInfo.completed = true;
      $ctrl.submission.payment.completed = true;
      $ctrl.premiumMinimumError = true;
      $ctrl.checkSuccessfulSubmission();

      expect($ctrl.submitOrderInternal).not.toHaveBeenCalled();
      expect($ctrl.submitted).toEqual(false);
      expect($ctrl.validationError).toEqual(true);
    });
  });
});
