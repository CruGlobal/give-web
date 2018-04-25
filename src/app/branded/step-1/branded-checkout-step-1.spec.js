import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './branded-checkout-step-1.component';

describe('branded checkout step 1', () => {
  beforeEach(angular.mock.module(module.name));
  let $ctrl;

  beforeEach(inject($componentController => {
    $ctrl = $componentController(module.name, null, {
      next: jasmine.createSpy('next'),
      onPaymentFailed: jasmine.createSpy('onPaymentFailed')
    });
  }));

  describe('$onInit', () => {
    it('should load cart', () => {
      spyOn($ctrl, 'resetSubmission');
      spyOn($ctrl, 'initItemConfig');
      spyOn($ctrl, 'initCart');
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
        'campaign-code': '1234',
        'campaign-page': '135',
        amount: '75',
        'recurring-day-of-month': '9'
      });
      expect($ctrl.defaultFrequency).toBeUndefined();
    });
    it('should initialize monthly gifts', () => {
      $ctrl.frequency = 'monthly';
      $ctrl.initItemConfig();
      expect($ctrl.defaultFrequency).toEqual('MON');
    });
    it('should initialize quarterly gifts', () => {
      $ctrl.frequency = 'quarterly';
      $ctrl.initItemConfig();
      expect($ctrl.defaultFrequency).toEqual('QUARTERLY');
    });
    it('should initialize annual gifts', () => {
      $ctrl.frequency = 'annually';
      $ctrl.initItemConfig();
      expect($ctrl.defaultFrequency).toEqual('ANNUAL');
    });
  });

  describe('initCart', () => {
    beforeEach(() => {
      spyOn($ctrl.cartService, 'get').and.returnValue(Observable.of({ items: [ { code: '1234567', config: {} } ] }));
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
      $ctrl.cartService.get.and.returnValue(Observable.of({ }));
      $ctrl.initCart();
      expect($ctrl.cartService.get).toHaveBeenCalled();
      expect($ctrl.isEdit).toBeUndefined();
      expect($ctrl.item).toBeUndefined();
      expect($ctrl.loadingProductConfig).toEqual(false);
    });
    it('should handle error loading cart', () => {
      $ctrl.cartService.get.and.returnValue(Observable.throw('some error'));
      $ctrl.initCart();
      expect($ctrl.cartService.get).toHaveBeenCalled();
      expect($ctrl.isEdit).toBeUndefined();
      expect($ctrl.item).toBeUndefined();
      expect($ctrl.loadingProductConfig).toEqual(false);
      expect($ctrl.errorLoadingProductConfig).toEqual(true);
      expect($ctrl.$log.error.logs[0]).toEqual( ['Error loading cart data for branded checkout step 1', 'some error'] );
    });
  });

  describe('submit', () => {
    it('should reset and start submission', () => {
      spyOn($ctrl, 'resetSubmission');
      $ctrl.submit();
      expect($ctrl.resetSubmission).toHaveBeenCalled();
      expect($ctrl.submitted).toEqual(true);
    });
  });

  describe('resetSubmission', () => {
    it('should set all submission values', () => {
      $ctrl.resetSubmission();
      expect($ctrl.submission).toEqual({
        giftConfig: {
          completed: false,
          error: false
        },
        contactInfo: {
          completed: false,
          error: false
        },
        payment: {
          completed: false,
          error: false
        }
      });
    });
  });

  describe('onGiftConfigStateChange', () => {
    beforeEach(() => {
      spyOn($ctrl, 'checkSuccessfulSubmission');
      $ctrl.resetSubmission();
    });
    it('should handle a successful submission', () => {
      $ctrl.onGiftConfigStateChange('submitted');
      expect($ctrl.submission.giftConfig).toEqual({
        completed: true,
        error: false
      });
      expect($ctrl.isEdit).toEqual(true);
      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
    });
    it('should handle an error submitting', () => {
      $ctrl.onGiftConfigStateChange('errorSubmitting');
      expect($ctrl.submission.giftConfig).toEqual({
        completed: true,
        error: true
      });
      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
    });
    it('should handle an error adding duplicate items', () => {
      $ctrl.onGiftConfigStateChange('errorAlreadyInCart');
      expect($ctrl.submission.giftConfig).toEqual({
        completed: true,
        error: true
      });
      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
    });
  });

  describe('onContactInfoSubmit', () => {
    beforeEach(() => {
      spyOn($ctrl, 'checkSuccessfulSubmission');
      $ctrl.resetSubmission();
    });
    it('should handle a successful submission', () => {
      $ctrl.onContactInfoSubmit(true);
      expect($ctrl.submission.contactInfo).toEqual({
        completed: true,
        error: false
      });
      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
    });
    it('should handle an error submitting', () => {
      $ctrl.onContactInfoSubmit(false);
      expect($ctrl.submission.contactInfo).toEqual({
        completed: true,
        error: true
      });
      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
    });
  });

  describe('onPaymentStateChange', () => {
    beforeEach(() => {
      spyOn($ctrl, 'checkSuccessfulSubmission');
      $ctrl.resetSubmission();
    });
    it('should handle a successful submission', () => {
      $ctrl.onPaymentStateChange('submitted');
      expect($ctrl.submission.payment).toEqual({
        completed: true,
        error: false
      });
      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
    });
    it('should handle an error submitting', () => {
      $ctrl.onPaymentStateChange('errorSubmitting');
      expect($ctrl.submission.payment).toEqual({
        completed: true,
        error: true
      });
      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
      expect($ctrl.onPaymentFailed).toHaveBeenCalled();
    });
    it('should handle an unsubmitted error', () => {
      $ctrl.onPaymentStateChange('unsubmitted');
      expect($ctrl.submission.payment).toEqual({
        completed: true,
        error: true
      });
      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
      expect($ctrl.onPaymentFailed).toHaveBeenCalled();
    });
  });

  describe('checkSuccessfulSubmission', () => {
    beforeEach(() => {
      $ctrl.resetSubmission();
      $ctrl.submitted = true;
    });
    it('should do nothing if all submissions aren\'t completed', () => {
      $ctrl.checkSuccessfulSubmission();
      expect($ctrl.next).not.toHaveBeenCalled();
      expect($ctrl.submitted).toEqual(true);
    });
    it('should do nothing if some submissions aren\'t completed', () => {
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
    });
    it('should set submitted to false if submissions completed and errors', () => {
      $ctrl.submission.giftConfig.completed = true;
      $ctrl.submission.contactInfo.completed = true;
      $ctrl.submission.payment.completed = true;
      $ctrl.submission.giftConfig.error = true;
      $ctrl.checkSuccessfulSubmission();
      expect($ctrl.next).not.toHaveBeenCalled();
      expect($ctrl.submitted).toEqual(false);
    });
  });
});
