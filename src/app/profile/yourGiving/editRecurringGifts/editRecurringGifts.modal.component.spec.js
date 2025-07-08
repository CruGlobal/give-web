import angular from 'angular';
import 'angular-mocks';
import { advanceTo, clear } from 'jest-date-mock';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import RecurringGiftModel from 'common/models/recurringGift.model';

import module from './editRecurringGifts.modal.component';

describe('edit recurring gifts modal', () => {
  beforeEach(angular.mock.module(module.name));

  afterEach(clear);
  const self = {};

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(
      module.name,
      {},
      {
        close: jest.fn(),
        dismiss: jest.fn(),
      },
    );
  }));

  describe('$onInit', () => {
    it('should call loadData', () => {
      jest
        .spyOn(self.controller, 'loadPaymentMethods')
        .mockImplementation(() => {});
      jest
        .spyOn(self.controller, 'loadRecentRecipients')
        .mockImplementation(() => {});
      self.controller.$onInit();

      expect(self.controller.loadPaymentMethods).toHaveBeenCalled();
      expect(self.controller.loadRecentRecipients).toHaveBeenCalled();
    });
  });

  describe('loadPaymentMethods', () => {
    beforeEach(() => {
      advanceTo(new Date(2015, 0, 10));
    });

    it('should handle bank accounts', () => {
      const paymentMethods = [
        {
          self: {
            type: 'paymentinstruments.payment-instrument',
          },
          'account-type': 'Checking',
        },
      ];
      jest
        .spyOn(self.controller.profileService, 'getPaymentMethods')
        .mockReturnValue(Observable.of(paymentMethods));
      jest
        .spyOn(self.controller.commonService, 'getNextDrawDate')
        .mockReturnValue(Observable.of('2015-02-04'));
      jest.spyOn(self.controller, 'next').mockImplementation(() => {});
      self.controller.loadPaymentMethods();

      expect(self.controller.state).toEqual('loading');
      expect(
        self.controller.profileService.getPaymentMethods,
      ).toHaveBeenCalled();
      expect(self.controller.commonService.getNextDrawDate).toHaveBeenCalled();
      expect(self.controller.paymentMethods).toEqual(paymentMethods);
      expect(self.controller.nextDrawDate).toEqual('2015-02-04');
      expect(self.controller.hasPaymentMethods).toEqual(true);
      expect(self.controller.validPaymentMethods).toEqual(paymentMethods);
      expect(self.controller.hasValidPaymentMethods).toEqual(true);
      expect(self.controller.next).toHaveBeenCalled();
    });

    it('should handle active credit cards', () => {
      const paymentMethods = [
        {
          self: {
            type: 'paymentinstruments.payment-instrument',
          },
          'expiry-month': '01',
          'expiry-year': '2015',
        },
      ];
      jest
        .spyOn(self.controller.profileService, 'getPaymentMethods')
        .mockReturnValue(Observable.of(paymentMethods));
      jest
        .spyOn(self.controller.commonService, 'getNextDrawDate')
        .mockReturnValue(Observable.of('2015-02-04'));
      jest.spyOn(self.controller, 'next').mockImplementation(() => {});
      self.controller.loadPaymentMethods();

      expect(self.controller.state).toEqual('loading');
      expect(
        self.controller.profileService.getPaymentMethods,
      ).toHaveBeenCalled();
      expect(self.controller.commonService.getNextDrawDate).toHaveBeenCalled();
      expect(self.controller.paymentMethods).toEqual(paymentMethods);
      expect(self.controller.nextDrawDate).toEqual('2015-02-04');
      expect(self.controller.hasPaymentMethods).toEqual(true);
      expect(self.controller.validPaymentMethods).toEqual(paymentMethods);
      expect(self.controller.hasValidPaymentMethods).toEqual(true);
      expect(self.controller.next).toHaveBeenCalled();
    });

    it('should handle inactive credit cards', () => {
      const paymentMethods = [
        {
          self: {
            type: 'paymentinstruments.payment-instrument',
          },
          'expiry-month': '12',
          'expiry-year': '2014',
        },
      ];
      jest
        .spyOn(self.controller.profileService, 'getPaymentMethods')
        .mockReturnValue(Observable.of(paymentMethods));
      jest
        .spyOn(self.controller.commonService, 'getNextDrawDate')
        .mockReturnValue(Observable.of('2015-02-04'));
      jest.spyOn(self.controller, 'next').mockImplementation(() => {});
      self.controller.loadPaymentMethods();

      expect(self.controller.state).toEqual('loading');
      expect(
        self.controller.profileService.getPaymentMethods,
      ).toHaveBeenCalled();
      expect(self.controller.commonService.getNextDrawDate).toHaveBeenCalled();
      expect(self.controller.paymentMethods).toEqual(paymentMethods);
      expect(self.controller.nextDrawDate).toEqual('2015-02-04');
      expect(self.controller.hasPaymentMethods).toEqual(true);
      expect(self.controller.validPaymentMethods).toEqual([]);
      expect(self.controller.hasValidPaymentMethods).toEqual(false);
      expect(self.controller.next).toHaveBeenCalled();
    });

    it('should handle no payment methods', () => {
      const paymentMethods = [];
      jest
        .spyOn(self.controller.profileService, 'getPaymentMethods')
        .mockReturnValue(Observable.of(paymentMethods));
      jest
        .spyOn(self.controller.commonService, 'getNextDrawDate')
        .mockReturnValue(Observable.of('2015-02-04'));
      jest.spyOn(self.controller, 'next').mockImplementation(() => {});
      self.controller.loadPaymentMethods();

      expect(self.controller.state).toEqual('loading');
      expect(
        self.controller.profileService.getPaymentMethods,
      ).toHaveBeenCalled();
      expect(self.controller.commonService.getNextDrawDate).toHaveBeenCalled();
      expect(self.controller.paymentMethods).toEqual([]);
      expect(self.controller.nextDrawDate).toEqual('2015-02-04');
      expect(self.controller.hasPaymentMethods).toEqual(false);
      expect(self.controller.validPaymentMethods).toEqual([]);
      expect(self.controller.hasValidPaymentMethods).toEqual(false);
      expect(self.controller.next).toHaveBeenCalled();
    });

    it('should handle an error loading payment methods', () => {
      jest
        .spyOn(self.controller.profileService, 'getPaymentMethods')
        .mockReturnValue(Observable.throw('some payment method error'));
      jest
        .spyOn(self.controller.commonService, 'getNextDrawDate')
        .mockReturnValue(Observable.throw('next draw date error'));
      jest.spyOn(self.controller, 'next').mockImplementation(() => {});
      self.controller.loadPaymentMethods();

      expect(self.controller.state).toEqual('error');
      expect(
        self.controller.profileService.getPaymentMethods,
      ).toHaveBeenCalled();
      expect(self.controller.commonService.getNextDrawDate).toHaveBeenCalled();
      expect(self.controller.paymentMethods).toBeUndefined();
      expect(self.controller.hasPaymentMethods).toBeUndefined();
      expect(self.controller.hasValidPaymentMethods).toBeUndefined();
      expect(self.controller.next).not.toHaveBeenCalled();
      expect(self.controller.$log.error.logs[0]).toEqual([
        'Error loading payment methods',
        'some payment method error',
      ]);
    });
  });

  describe('loadRecentRecipients', () => {
    it('should load recent recipients', () => {
      jest
        .spyOn(self.controller.donationsService, 'getSuggestedRecipients')
        .mockReturnValue(
          Observable.of([{ 'designation-name': 'Staff Member' }]),
        );
      self.controller.loadRecentRecipients();

      expect(self.controller.recentRecipients).toEqual([
        new RecurringGiftModel({
          'designation-name': 'Staff Member',
        }).setDefaults(),
      ]);

      expect(self.controller.hasRecentRecipients).toEqual(true);
      expect(self.controller.loadingRecentRecipients).toEqual(false);
    });

    it('should handle an error loading recent recipients', () => {
      jest
        .spyOn(self.controller.donationsService, 'getSuggestedRecipients')
        .mockReturnValue(Observable.throw('some error'));
      self.controller.loadRecentRecipients();

      expect(self.controller.recentRecipients).toBeUndefined();
      expect(self.controller.$log.error.logs[0]).toEqual([
        'Error loading recent recipients',
        'some error',
      ]);
      expect(self.controller.loadingRecentRecipients).toEqual(false);
    });
  });

  describe('next', () => {
    beforeEach(() => {
      jest
        .spyOn(self.controller, 'scrollModalToTop')
        .mockImplementation(() => {});
    });

    it('should scroll to the top of the modal', () => {
      self.controller.next();

      expect(self.controller.scrollModalToTop).toHaveBeenCalled();
    });

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
      jest
        .spyOn(self.controller, 'loadPaymentMethods')
        .mockImplementation(() => {});
      self.controller.state = 'step0AddUpdatePaymentMethod';
      self.controller.next();

      expect(self.controller.loadPaymentMethods).toHaveBeenCalled();
    });

    it('should transition from step1EditRecurringGifts to step2AddRecentRecipients', () => {
      self.controller.state = 'step1EditRecurringGifts';
      const testGift = new RecurringGiftModel({});
      self.controller.hasRecentRecipients = true;
      self.controller.next(undefined, [testGift]);

      expect(self.controller.recurringGiftChanges).toEqual([]);
      expect(self.controller.hasRecurringGiftChanges).toEqual(false);
      expect(self.controller.state).toEqual('step2AddRecentRecipients');
    });

    it('should transition from step1EditRecurringGifts to step2AddRecentRecipients with modified gifts', () => {
      self.controller.state = 'step1EditRecurringGifts';
      const testGift = new RecurringGiftModel({}).setDefaults();
      self.controller.hasRecentRecipients = true;
      self.controller.next(undefined, [testGift]);

      expect(self.controller.recurringGifts).toEqual([testGift]);
      expect(self.controller.hasRecurringGiftChanges).toEqual(true);
      expect(self.controller.state).toEqual('step2AddRecentRecipients');
    });

    it('should transition from step1EditRecurringGifts to step4Confirm with modified gifts and no recent recipients', () => {
      self.controller.state = 'step1EditRecurringGifts';
      const testGift = new RecurringGiftModel({}).setDefaults();
      self.controller.hasRecentRecipients = false;
      self.controller.next(undefined, [testGift]);

      expect(self.controller.recurringGifts).toEqual([testGift]);
      expect(self.controller.hasRecurringGiftChanges).toEqual(true);
      expect(self.controller.state).toEqual('step4Confirm');
    });

    it('should transition from step1EditRecurringGifts to step2SearchRecipients without modified gifts and no recent recipients', () => {
      self.controller.state = 'step1EditRecurringGifts';
      self.controller.hasRecentRecipients = false;
      self.controller.next(undefined, []);

      expect(self.controller.state).toEqual('step2SearchRecipients');
    });

    it('should transition from step2AddRecentRecipients to step3ConfigureRecentRecipients', () => {
      self.controller.state = 'step2AddRecentRecipients';
      self.controller.next(undefined, undefined, ['first addition']);

      expect(self.controller.additions).toEqual(['first addition']);
      expect(self.controller.state).toEqual('step3ConfigureRecentRecipients');
    });

    it('should transition from step2AddRecentRecipients to step4Confirm', () => {
      self.controller.state = 'step2AddRecentRecipients';
      self.controller.hasRecurringGiftChanges = true;
      self.controller.next(undefined, undefined, []);

      expect(self.controller.additions).toEqual([]);
      expect(self.controller.state).toEqual('step4Confirm');
    });

    it('should transition from step2AddRecentRecipients to step2SearchRecipients', () => {
      self.controller.state = 'step2AddRecentRecipients';
      self.controller.hasRecurringGiftChanges = false;
      self.controller.next(undefined, undefined, []);

      expect(self.controller.additions).toEqual([]);
      expect(self.controller.state).toEqual('step2SearchRecipients');
    });

    it('should transition from step2SearchRecipients to step3ConfigureRecentRecipients', () => {
      self.controller.state = 'step2SearchRecipients';
      self.controller.recentRecipients = ['recent recipient'];
      self.controller.next(undefined, undefined, ['new gift']);

      expect(self.controller.additions).toEqual(['new gift']);
      expect(self.controller.recentRecipients).toEqual([
        'recent recipient',
        'new gift',
      ]);
      expect(self.controller.hasRecentRecipients).toEqual(true);
      expect(self.controller.state).toEqual('step3ConfigureRecentRecipients');
    });

    it('should transition from step2SearchRecipients to step4Confirm', () => {
      self.controller.state = 'step2SearchRecipients';
      self.controller.recentRecipients = [];
      self.controller.next(undefined, undefined, []);

      expect(self.controller.additions).toEqual([]);
      expect(self.controller.recentRecipients).toEqual([]);
      expect(self.controller.hasRecentRecipients).toEqual(false);
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
    beforeEach(() => {
      jest
        .spyOn(self.controller, 'scrollModalToTop')
        .mockImplementation(() => {});
    });

    it('should scroll to the top of the modal', () => {
      self.controller.previous();

      expect(self.controller.scrollModalToTop).toHaveBeenCalled();
    });

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

    it('should transition from step2SearchRecipients to step1EditRecurringGifts', () => {
      self.controller.state = 'step2SearchRecipients';
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
