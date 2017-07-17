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
      next: jasmine.createSpy('next')
    });
  }));

  describe('$onInit', () => {
    it('should load cart', () => {
      spyOn($ctrl, 'resetSubmission');
      spyOn($ctrl, 'initItemConfig');
      spyOn($ctrl, 'initSessionAndCart');
      $ctrl.$onInit();
      expect($ctrl.resetSubmission).toHaveBeenCalled();
      expect($ctrl.initItemConfig).toHaveBeenCalled();
      expect($ctrl.initSessionAndCart).toHaveBeenCalled();
    });
  });

  describe('initItemConfig', () => {
    it('should initialize item config', () => {
      $ctrl.campaignCode = '1234';
      $ctrl.amount = '75';
      $ctrl.day = '9';
      $ctrl.initItemConfig();
      expect($ctrl.itemConfig).toEqual({
        'campaign-code': '1234',
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

  describe('initSessionAndCart', () => {
    beforeEach(() => {
      spyOn($ctrl.sessionService, 'downgradeToGuest').and.returnValue(Observable.of(''));
      spyOn($ctrl.cartService, 'getTotalQuantity').and.returnValue(Observable.of(0));
      spyOn($ctrl.sessionService, 'signOut').and.returnValue(Observable.of(''));
      spyOn($ctrl.cartService, 'get').and.returnValue(Observable.of({ items: [ { code: '1234567' } ] }));
    });
    it('should downgrade session', () => {
      $ctrl.initSessionAndCart();
      expect($ctrl.sessionService.downgradeToGuest).toHaveBeenCalledWith(true);
      expect($ctrl.loadingSession).toEqual(false);
    });
    it('should continue if downgrade session fails', () => {
      $ctrl.sessionService.downgradeToGuest.and.returnValue(Observable.throw('some error'));
      $ctrl.initSessionAndCart();
      expect($ctrl.sessionService.downgradeToGuest).toHaveBeenCalledWith(true);
      expect($ctrl.loadingSession).toEqual(false);
    });
    it('should get cart quantity and sign out if there are no items in cart', () => {
      $ctrl.initSessionAndCart();
      expect($ctrl.cartService.getTotalQuantity).toHaveBeenCalled();
      expect($ctrl.sessionService.signOut).toHaveBeenCalled();
      expect($ctrl.loadingSession).toEqual(false);
    });
    it('should get cart quantity and not sign out if there are items in cart', () => {
      $ctrl.cartService.getTotalQuantity.and.returnValue(Observable.of(1));
      $ctrl.initSessionAndCart();
      expect($ctrl.cartService.getTotalQuantity).toHaveBeenCalled();
      expect($ctrl.sessionService.signOut).not.toHaveBeenCalled();
      expect($ctrl.loadingSession).toEqual(false);
    });
    it('should ignore session errors', () => {
      $ctrl.sessionService.signOut.and.returnValue(Observable.throw('some error'));
      $ctrl.initSessionAndCart();
      expect($ctrl.cartService.getTotalQuantity).toHaveBeenCalled();
      expect($ctrl.sessionService.signOut).toHaveBeenCalled();
      expect($ctrl.loadingSession).toEqual(false);
    });
    it('should get cart data and find existing item in cart', () => {
      $ctrl.code = '1234567';
      $ctrl.initSessionAndCart();
      expect($ctrl.cartService.get).toHaveBeenCalled();
      expect($ctrl.loadingSession).toEqual(false);
      expect($ctrl.isEdit).toEqual(true);
      expect($ctrl.item).toEqual({ code: '1234567' });
      expect($ctrl.loadingProductConfig).toEqual(false);
    });
    it('should get cart data and not enter edit mode when item isn\'t in cart', () => {
      $ctrl.code = '0000000';
      $ctrl.initSessionAndCart();
      expect($ctrl.cartService.get).toHaveBeenCalled();
      expect($ctrl.loadingSession).toEqual(false);
      expect($ctrl.isEdit).toBeUndefined();
      expect($ctrl.item).toBeUndefined();
      expect($ctrl.loadingProductConfig).toEqual(false);
    });
    it('should handle error loading cart', () => {
      $ctrl.cartService.get.and.returnValue(Observable.throw('some error'));
      $ctrl.initSessionAndCart();
      expect($ctrl.cartService.get).toHaveBeenCalled();
      expect($ctrl.loadingSession).toEqual(false);
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
    });
    it('should handle an unsubmitted error', () => {
      $ctrl.onPaymentStateChange('unsubmitted');
      expect($ctrl.submission.payment).toEqual({
        completed: true,
        error: true
      });
      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled();
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
