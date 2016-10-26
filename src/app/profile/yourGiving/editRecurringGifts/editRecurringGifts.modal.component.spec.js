import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import RecurringGiftModel from 'common/models/recurringGift.model';

import module from './editRecurringGifts.modal.component';

describe('edit recurring gifts modal', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(module.name, {}, {
      close: jasmine.createSpy('close'),
      dismiss: jasmine.createSpy('dismiss')
    });
  }));

  describe('$onInit', () => {
    it('should call loadData', () => {
      spyOn(self.controller, 'loadPaymentMethods');
      spyOn(self.controller, 'loadRecentRecipients');
      self.controller.$onInit();
      expect(self.controller.loadPaymentMethods).toHaveBeenCalled();
      expect(self.controller.loadRecentRecipients).toHaveBeenCalled();
    });
  });

  describe('loadData', () => {
    it('should call loadData', () => {
      spyOn(self.controller, 'loadData');
      self.controller.$onInit();
      expect(self.controller.loadData).toHaveBeenCalled();
    });
  });

  describe('loadPaymentMethods', () => {
    beforeEach(() => {
      jasmine.clock().mockDate(new Date(2015, 0, 10));
    });
    it('should handle bank accounts', () => {
      let paymentMethods = [{
        self: {
          type: 'elasticpath.bankaccounts.bank-account'
        }
      }];
      spyOn(self.controller.profileService, 'getPaymentMethods').and.returnValue(Observable.of(paymentMethods));
      spyOn(self.controller.commonService, 'getNextDrawDate').and.returnValue(Observable.of('2015-02-04'));
      spyOn(self.controller, 'next');
      self.controller.loadPaymentMethods();
      expect(self.controller.state).toEqual('loading');
      expect(self.controller.profileService.getPaymentMethods).toHaveBeenCalled();
      expect(self.controller.commonService.getNextDrawDate).toHaveBeenCalled();
      expect(self.controller.paymentMethods).toEqual(paymentMethods);
      expect(self.controller.nextDrawDate).toEqual('2015-02-04');
      expect(self.controller.hasPaymentMethods).toEqual(true);
      expect(self.controller.validPaymentMethods).toEqual(paymentMethods);
      expect(self.controller.hasValidPaymentMethods).toEqual(true);
      expect(self.controller.next).toHaveBeenCalled();
    });
    it('should handle active credit cards', () => {
      let paymentMethods = [{
        self: {
          type: 'cru.creditcards.named-credit-card'
        },
        'expiry-month': '01',
        'expiry-year': '2015'
      }];
      spyOn(self.controller.profileService, 'getPaymentMethods').and.returnValue(Observable.of(paymentMethods));
      spyOn(self.controller.commonService, 'getNextDrawDate').and.returnValue(Observable.of('2015-02-04'));
      spyOn(self.controller, 'next');
      self.controller.loadPaymentMethods();
      expect(self.controller.state).toEqual('loading');
      expect(self.controller.profileService.getPaymentMethods).toHaveBeenCalled();
      expect(self.controller.commonService.getNextDrawDate).toHaveBeenCalled();
      expect(self.controller.paymentMethods).toEqual(paymentMethods);
      expect(self.controller.nextDrawDate).toEqual('2015-02-04');
      expect(self.controller.hasPaymentMethods).toEqual(true);
      expect(self.controller.validPaymentMethods).toEqual(paymentMethods);
      expect(self.controller.hasValidPaymentMethods).toEqual(true);
      expect(self.controller.next).toHaveBeenCalled();
    });
    it('should handle inactive credit cards', () => {
      let paymentMethods = [{
        self: {
          type: 'cru.creditcards.named-credit-card'
        },
        'expiry-month': '12',
        'expiry-year': '2014'
      }];
      spyOn(self.controller.profileService, 'getPaymentMethods').and.returnValue(Observable.of(paymentMethods));
      spyOn(self.controller.commonService, 'getNextDrawDate').and.returnValue(Observable.of('2015-02-04'));
      spyOn(self.controller, 'next');
      self.controller.loadPaymentMethods();
      expect(self.controller.state).toEqual('loading');
      expect(self.controller.profileService.getPaymentMethods).toHaveBeenCalled();
      expect(self.controller.commonService.getNextDrawDate).toHaveBeenCalled();
      expect(self.controller.paymentMethods).toEqual(paymentMethods);
      expect(self.controller.nextDrawDate).toEqual('2015-02-04');
      expect(self.controller.hasPaymentMethods).toEqual(true);
      expect(self.controller.validPaymentMethods).toEqual([]);
      expect(self.controller.hasValidPaymentMethods).toEqual(false);
      expect(self.controller.next).toHaveBeenCalled();
    });
    it('should handle no payment methods', () => {
      let paymentMethods = [];
      spyOn(self.controller.profileService, 'getPaymentMethods').and.returnValue(Observable.of(paymentMethods));
      spyOn(self.controller.commonService, 'getNextDrawDate').and.returnValue(Observable.of('2015-02-04'));
      spyOn(self.controller, 'next');
      self.controller.loadPaymentMethods();
      expect(self.controller.state).toEqual('loading');
      expect(self.controller.profileService.getPaymentMethods).toHaveBeenCalled();
      expect(self.controller.commonService.getNextDrawDate).toHaveBeenCalled();
      expect(self.controller.paymentMethods).toEqual([]);
      expect(self.controller.nextDrawDate).toEqual('2015-02-04');
      expect(self.controller.hasPaymentMethods).toEqual(false);
      expect(self.controller.validPaymentMethods).toEqual([]);
      expect(self.controller.hasValidPaymentMethods).toEqual(false);
      expect(self.controller.next).toHaveBeenCalled();
    });
    it('should handle an error loading payment methods', () => {
      spyOn(self.controller.profileService, 'getPaymentMethods').and.returnValue(Observable.throw('some payment method error'));
      spyOn(self.controller.commonService, 'getNextDrawDate').and.returnValue(Observable.throw('next draw date error'));
      spyOn(self.controller, 'next');
      self.controller.loadPaymentMethods();
      expect(self.controller.state).toEqual('error');
      expect(self.controller.profileService.getPaymentMethods).toHaveBeenCalled();
      expect(self.controller.commonService.getNextDrawDate).toHaveBeenCalled();
      expect(self.controller.paymentMethods).toBeUndefined();
      expect(self.controller.hasPaymentMethods).toBeUndefined();
      expect(self.controller.hasValidPaymentMethods).toBeUndefined();
      expect(self.controller.next).not.toHaveBeenCalled();
      expect(self.controller.$log.error.logs[0]).toEqual(['Error loading payment methods', 'some payment method error']);
    });
  });

  describe('loadRecentRecipients', () => {
    it('should load recent recipients after paymentMethods are loaded', () => {
      self.controller.recentRecipientsObservable = Observable.of([ { 'designation-name': 'Staff Member' } ]);
      self.controller.paymentMethodsObservable = Observable.of({
        paymentMethods: [ { self: { uri: '/selfservicepaymentmethods/crugive/giydgnrxgm=' } } ],
        nextDrawDate: '2015-03-25'
      });
      self.controller.loadRecentRecipients();
      expect(self.controller.recentRecipients).toEqual([ (new RecurringGiftModel(
        { 'designation-name': 'Staff Member' },
        null,
        '2015-03-25',
        [ { self: { uri: '/selfservicepaymentmethods/crugive/giydgnrxgm=' } } ]
      )).setDefaults() ] );
      expect(self.controller.hasRecentRecipients).toEqual(true);
    });
    it('should handle an error loading recent recipients', () => {
      self.controller.recentRecipientsObservable = Observable.throw('some error');
      self.controller.paymentMethodsObservable = Observable.of({});
      self.controller.loadRecentRecipients();
      expect(self.controller.recentRecipients).toBeUndefined();
      expect(self.controller.$log.error.logs[0]).toEqual( [ 'Error loading recent recipients', 'some error' ] );
    });
  });

  describe('next', () => {
    it('should transition from loading to step1EditRecurringGifts', () => {
      self.controller.state = 'loading';
      self.controller.hasValidPaymentMethods = true;
      self.controller.next();
      expect(self.controller.state).toEqual('step1EditRecurringGifts');
    });

    it('should transition from loading to step0PaymentMethodList', () => {
      self.controller.state = 'loading';
      self.controller.paymentMethods = [1];
      self.controller.next();
      expect(self.controller.state).toEqual('step0PaymentMethodList');
    });

    it('should transition from loading to step0AddUpdatePaymentMethod', () => {
      self.controller.state = 'loading';
      self.controller.next();
      expect(self.controller.state).toEqual('step0AddUpdatePaymentMethod');
    });

    it('should transition from error to step0AddUpdatePaymentMethod', () => {
      self.controller.state = 'error';
      self.controller.next();
      expect(self.controller.state).toEqual('step0AddUpdatePaymentMethod');
    });

    it('should transition from step0PaymentMethodList to step0AddUpdatePaymentMethod', () => {
      self.controller.state = 'step0PaymentMethodList';
      self.controller.next('payment method');
      expect(self.controller.paymentMethod).toEqual('payment method');
      expect(self.controller.state).toEqual('step0AddUpdatePaymentMethod');
    });

    it('should transition from step0AddUpdatePaymentMethod to step1EditRecurringGifts by reloading the payment methods', () => {
      spyOn(self.controller, 'loadData');
      self.controller.state = 'step0AddUpdatePaymentMethod';
      self.controller.next();
      expect(self.controller.loadData).toHaveBeenCalled();
    });

    it('should transition from step1EditRecurringGifts to step2AddRecentRecipients', () => {
      self.controller.state = 'step1EditRecurringGifts';
      self.controller.hasRecentRecipients = true;
      self.controller.next(undefined, 'modified gifts');
      expect(self.controller.recurringGifts).toEqual('modified gifts');
      expect(self.controller.state).toEqual('step2AddRecentRecipients');
    });

    it('should transition from step1EditRecurringGifts to step4Confirm', () => {
      self.controller.state = 'step1EditRecurringGifts';
      self.controller.hasRecentRecipients = false;
      self.controller.next();
      expect(self.controller.state).toEqual('step4Confirm');
    });

    it('should transition from step2AddRecentRecipients to step3ConfigureRecentRecipients', () => {
      self.controller.state = 'step2AddRecentRecipients';
      self.controller.next(undefined, undefined, ['first addition']);
      expect(self.controller.additions).toEqual(['first addition']);
      expect(self.controller.state).toEqual('step3ConfigureRecentRecipients');
    });

    it('should transition from step2AddRecentRecipients to step4Confirm', () => {
      self.controller.state = 'step2AddRecentRecipients';
      self.controller.next(undefined, undefined, []);
      expect(self.controller.additions).toEqual([]);
      expect(self.controller.state).toEqual('step4Confirm');
    });

    it('should transition from step3ConfigureRecentRecipients to step4Confirm', () => {
      self.controller.state = 'step3ConfigureRecentRecipients';
      self.controller.next(undefined, undefined, ['configured addition']);
      expect(self.controller.additions).toEqual(['configured addition']);
      expect(self.controller.state).toEqual('step4Confirm');
    });

    it('should transition from step4Confirm and close the modal', () => {
      self.controller.state = 'step4Confirm';
      self.controller.next();
      expect(self.controller.close).toHaveBeenCalled();
    });
  });

  describe('previous', () => {
    it('should transition from step4Confirm to step3ConfigureRecentRecipients', () => {
      self.controller.state = 'step4Confirm';
      self.controller.additions = ['some additions'];
      self.controller.previous();
      expect(self.controller.state).toEqual('step3ConfigureRecentRecipients');
    });
    it('should transition from step4Confirm to step1EditRecurringGifts', () => {
      self.controller.state = 'step4Confirm';
      self.controller.additions = [];
      self.controller.previous();
      expect(self.controller.state).toEqual('step1EditRecurringGifts');
    });
    it('should transition from step3ConfigureRecentRecipients to step2AddRecentRecipients', () => {
      self.controller.state = 'step3ConfigureRecentRecipients';
      self.controller.previous();
      expect(self.controller.state).toEqual('step2AddRecentRecipients');
    });
    it('should transition from step2AddRecentRecipients to step1EditRecurringGifts', () => {
      self.controller.state = 'step2AddRecentRecipients';
      self.controller.previous();
      expect(self.controller.state).toEqual('step1EditRecurringGifts');
    });
    it('should transition from step0AddUpdatePaymentMethod to step0PaymentMethodList', () => {
      self.controller.state = 'step0AddUpdatePaymentMethod';
      self.controller.previous();
      expect(self.controller.state).toEqual('step0PaymentMethodList');
    });
  });
});
