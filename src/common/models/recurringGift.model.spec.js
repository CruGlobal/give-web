import moment from 'moment';
import { advanceTo, clear } from 'jest-date-mock';

import RecurringGiftModel from './recurringGift.model';

describe('recurringGift model', () => {
  let giftModel;

  beforeEach(() => {
    giftModel = new RecurringGiftModel(
      {
        amount: 25,
        'designation-name': 'David and Margo Neibling (0105987)',
        'designation-number': '0105987',
        'donation-line-row-id': '1-GVVEB6',
        'donation-line-status': 'Standard',
        'payment-instrument-id':
          'g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
        'updated-amount': '',
        'updated-donation-line-status': '',
        'updated-payment-instrument-id': '',
        'updated-rate': { recurrence: { interval: '' } },
        'updated-recurring-day-of-month': '',
        'updated-start-month': '',
        'updated-start-year': '',
        'updated-designation-number': '',
      },
      {
        'donation-row-id': '1-K0LPOL',
        'donation-status': 'Active',
        'effective-status': 'Active',
        rate: { recurrence: { interval: 'Monthly' } },
        'recurring-day-of-month': '15',
        'next-draw-date': { 'display-value': '2015-05-06', value: 1430895600 },
        'start-date': { 'display-value': '2015-04-06', value: 1428303600 },
      },
    );
    RecurringGiftModel.nextDrawDate = '2015-05-20';
    RecurringGiftModel.paymentMethods = [
      {
        self: {
          uri: '/selfservicepaymentinstruments/crugive/g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
        },
        'account-type': 'Savings',
      },
    ];
    advanceTo(moment('2015-05-07').toDate());
  });

  afterEach(clear);

  describe('constructor', () => {
    beforeEach(() => {
      jest
        .spyOn(RecurringGiftModel.prototype, 'initializeEmptyFields')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      RecurringGiftModel.prototype.initializeEmptyFields.mockRestore();
    });

    it('should call initializeEmptyFields', () => {
      new RecurringGiftModel({});

      expect(
        RecurringGiftModel.prototype.initializeEmptyFields,
      ).toHaveBeenCalled();
    });
  });

  describe('initializeEmptyFields', () => {
    it('should default nested fields if they are undefined', () => {
      const gift = new RecurringGiftModel({});

      expect(gift.gift).toEqual({
        'updated-amount': '',
        'updated-payment-instrument-id': '',
        'updated-rate': {
          recurrence: {
            interval: '',
          },
        },
        'updated-recurring-day-of-month': '',
        'updated-start-month': '',
        'updated-start-year': '',
        'updated-donation-line-status': '',
        'updated-designation-number': '',
      });

      expect(gift.parentDonation).toEqual({
        rate: {
          recurrence: {
            interval: '',
          },
        },
        'next-draw-date': {
          'display-value': '',
        },
        'start-date': {
          'display-value': '',
        },
      });
    });
  });

  describe('designationName getter', () => {
    it('should return the name', () => {
      expect(giftModel.designationName).toEqual(
        'David and Margo Neibling (0105987)',
      );
    });
  });

  describe('designationName setter', () => {
    it('should set the name', () => {
      giftModel.designationName = 'Lex Luthor';

      expect(giftModel.gift['designation-name']).toEqual('Lex Luthor');
    });
  });

  describe('designationNumber getter', () => {
    it("should return designation-number if it hasn't been updated", () => {
      expect(giftModel.designationNumber).toEqual('0105987');
    });

    it('should return updated-designation-number if it has been updated', () => {
      giftModel.gift['updated-designation-number'] = '0123456';

      expect(giftModel.designationNumber).toEqual('0123456');
    });
  });

  describe('designationNumber setter', () => {
    it('should update designation number', () => {
      giftModel.designationNumber = '0987654';

      expect(giftModel.gift['designation-number']).toEqual('0105987');
      expect(giftModel.gift['updated-designation-number']).toEqual('0987654');
    });

    it('should clear updated amount if it is the same as the original', () => {
      giftModel.designationNumber = '0105987';

      expect(giftModel.gift['designation-number']).toEqual('0105987');
      expect(giftModel.gift['updated-designation-number']).toEqual('');
    });
  });

  describe('amount getter', () => {
    it("should load amount if it hasn't been updated", () => {
      expect(giftModel.amount).toEqual(25);
    });

    it('should load amount if it has been updated', () => {
      giftModel.gift['updated-amount'] = 50;

      expect(giftModel.amount).toEqual(50);
    });

    it('should load an empty string if updated amount is undefined (ng-model was invalid and set it to undefined)', () => {
      giftModel.gift['updated-amount'] = undefined;

      expect(giftModel.amount).toEqual('');
    });
  });

  describe('amount setter', () => {
    it('should update amount', () => {
      giftModel.amount = 75;

      expect(giftModel.gift['amount']).toEqual(25);
      expect(giftModel.gift['updated-amount']).toEqual(75);
    });

    it('should clear updated amount if it is the same as the original', () => {
      giftModel.amount = 25;

      expect(giftModel.gift['amount']).toEqual(25);
      expect(giftModel.gift['updated-amount']).toEqual('');
    });
  });

  describe('paymentMethodId getter', () => {
    it("should load payment id if it hasn't been updated", () => {
      expect(giftModel.paymentMethodId).toEqual(
        'g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
      );
    });

    it('should load payment id if it has been updated', () => {
      giftModel.gift['updated-payment-instrument-id'] = 'new id';

      expect(giftModel.paymentMethodId).toEqual('new id');
    });

    it('should load the first payment method id and set it as updated if one is not set on the gift', () => {
      giftModel.gift['payment-instrument-id'] = '';

      expect(giftModel.paymentMethodId).toEqual(
        'g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
      );
      expect(giftModel.gift['updated-payment-instrument-id']).toEqual(
        'g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
      );
    });
  });

  describe('paymentMethodId setter', () => {
    it('should update payment id', () => {
      giftModel._paymentMethod = 'some payment method object';
      giftModel.paymentMethodId = 'new id';

      expect(giftModel.gift['payment-instrument-id']).toEqual(
        'g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
      );
      expect(giftModel.gift['updated-payment-instrument-id']).toEqual('new id');
      expect(giftModel._paymentMethod).toBeUndefined(); // Check that it clears old payment method object
    });

    it('should clear updated payment id if it is the same as the original', () => {
      giftModel._paymentMethod = 'some payment method object';
      giftModel.paymentMethodId =
        'g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=';

      expect(giftModel.gift['payment-instrument-id']).toEqual(
        'g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
      );
      expect(giftModel.gift['updated-payment-instrument-id']).toEqual('');
      expect(giftModel._paymentMethod).toBeUndefined(); // Check that it clears old payment method object
    });
  });

  describe('paymentMethod getter', () => {
    it('should load payment method object if it is cached', () => {
      giftModel._paymentMethod = 'some payment method object';

      expect(giftModel.paymentMethod).toEqual('some payment method object');
    });

    it("should lookup payment method object if it hasn't yet", () => {
      const paymentMethod = {
        self: {
          uri: '/selfservicepaymentinstruments/crugive/g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
        },
        'account-type': 'Savings',
      };

      expect(giftModel.paymentMethod).toEqual(paymentMethod);
      expect(giftModel._paymentMethod).toEqual(paymentMethod); // Expect it to be cached
    });
  });

  describe('donationLineStatus setter', () => {
    it('should update donation-line-status', () => {
      giftModel.donationLineStatus = 'Cancelled';

      expect(giftModel.gift['donation-line-status']).toEqual('Standard');
      expect(giftModel.gift['updated-donation-line-status']).toEqual(
        'Cancelled',
      );
    });

    it('should clear updated donation-line-status if it is the same as the original', () => {
      giftModel.gift['updated-donation-line-status'] = 'Cancelled';
      giftModel.donationLineStatus = 'Standard';

      expect(giftModel.gift['donation-line-status']).toEqual('Standard');
      expect(giftModel.gift['updated-donation-line-status']).toEqual('');
    });
  });

  describe('donationLineStatus getter', () => {
    it("should return 'updated-donation-line-status' if set", () => {
      giftModel.gift['updated-donation-line-status'] = 'Cancelled';

      expect(giftModel.donationLineStatus).toEqual('Cancelled');
    });

    it("should return 'donation-line-status'", () => {
      expect(giftModel.donationLineStatus).toEqual('Standard');
    });
  });

  describe('frequency getter', () => {
    it("should load frequency if it hasn't been updated", () => {
      expect(giftModel.frequency).toEqual('Monthly');
    });

    it('should load frequency if it has been updated', () => {
      giftModel.gift['updated-rate']['recurrence']['interval'] = 'Quarterly';

      expect(giftModel.frequency).toEqual('Quarterly');
    });
  });

  describe('frequency setter', () => {
    beforeEach(() => {
      jest.spyOn(giftModel, 'initStartMonth').mockImplementation(() => {});
      jest.spyOn(giftModel, 'clearStartDate').mockImplementation(() => {});
    });

    it('should update frequency', () => {
      giftModel.frequency = 'Quarterly';

      expect(giftModel.gift['updated-rate']['recurrence']['interval']).toEqual(
        'Quarterly',
      );
    });

    it('should clear updated frequency if it is the same as the original', () => {
      giftModel.frequency = 'Monthly';

      expect(giftModel.gift['updated-rate']['recurrence']['interval']).toEqual(
        '',
      );
    });

    it('should init start date when updated to a non monthly value', () => {
      giftModel.frequency = 'Quarterly';

      expect(giftModel.initStartMonth).toHaveBeenCalledTimes(1);
      giftModel.frequency = 'Annually';

      expect(giftModel.initStartMonth).toHaveBeenCalledTimes(2);
      expect(giftModel.clearStartDate).not.toHaveBeenCalled();
    });

    it('should clear start date when changed to Monthly', () => {
      giftModel.frequency = 'Monthly';

      expect(giftModel.clearStartDate).toHaveBeenCalled();
      expect(giftModel.initStartMonth).not.toHaveBeenCalled();
    });

    it('should clear start date when changed back to the original value and transaction day is unchanged', () => {
      giftModel.parentDonation['rate']['recurrence']['interval'] = 'Quarterly';
      giftModel.gift['updated-recurring-day-of-month'] = '';
      giftModel.frequency = 'Quarterly';

      expect(giftModel.clearStartDate).toHaveBeenCalled();
      expect(giftModel.initStartMonth).not.toHaveBeenCalled();
    });

    it('should init start date when changed back to the original value and but transaction day is changed', () => {
      giftModel.parentDonation['rate']['recurrence']['interval'] = 'Quarterly';
      giftModel.gift['updated-recurring-day-of-month'] = '10';
      giftModel.frequency = 'Quarterly';

      expect(giftModel.clearStartDate).not.toHaveBeenCalled();
      expect(giftModel.initStartMonth).toHaveBeenCalled();
    });
  });

  describe('transactionDay getter', () => {
    it("should load transaction day if it hasn't been updated", () => {
      expect(giftModel.transactionDay).toEqual('15');
    });

    it('should load transaction day if it has been updated', () => {
      giftModel.gift['updated-recurring-day-of-month'] = '11';

      expect(giftModel.transactionDay).toEqual('11');
    });
  });

  describe('transactionDay setter', () => {
    beforeEach(() => {
      jest.spyOn(giftModel, 'initStartMonth').mockImplementation(() => {});
      jest.spyOn(giftModel, 'clearStartDate').mockImplementation(() => {});
    });

    it('should update transaction day', () => {
      giftModel.transactionDay = '11';

      expect(giftModel.gift['updated-recurring-day-of-month']).toEqual('11');
    });

    it('should clear updated transaction day if it is the same as the original', () => {
      giftModel.transactionDay = '15';

      expect(giftModel.gift['updated-recurring-day-of-month']).toEqual('');
    });

    it('should clear start date when frequency is Monthly', () => {
      giftModel.gift['updated-rate']['recurrence']['interval'] = 'Monthly';
      giftModel.transactionDay = '15';

      expect(giftModel.clearStartDate).toHaveBeenCalled();
      expect(giftModel.initStartMonth).not.toHaveBeenCalled();
    });

    it('should clear start date when frequency was Monthly and the frequency is unchanged', () => {
      giftModel.parentDonation['rate']['recurrence']['interval'] = 'Monthly';
      giftModel.gift['updated-rate']['recurrence']['interval'] = '';
      giftModel.transactionDay = '15';

      expect(giftModel.clearStartDate).toHaveBeenCalled();
      expect(giftModel.initStartMonth).not.toHaveBeenCalled();
    });

    it('should clear start date when the frequency is unchanged and transaction day is unchanged', () => {
      giftModel.parentDonation['rate']['recurrence']['interval'] = 'Quarterly';
      giftModel.gift['updated-rate']['recurrence']['interval'] = '';
      giftModel.transactionDay = '15';

      expect(giftModel.clearStartDate).toHaveBeenCalled();
      expect(giftModel.initStartMonth).not.toHaveBeenCalled();
    });

    it('should init start date when updated and frequency has changed', () => {
      giftModel.gift['updated-rate']['recurrence']['interval'] = 'Quarterly';
      giftModel.transactionDay = '15';

      expect(giftModel.initStartMonth).toHaveBeenCalled();
      expect(giftModel.clearStartDate).not.toHaveBeenCalled();
    });

    it('should init start date when transaction day is changed', () => {
      giftModel.parentDonation['rate']['recurrence']['interval'] = 'Quarterly';
      giftModel.gift['updated-rate']['recurrence']['interval'] = '';
      giftModel.transactionDay = 11;

      expect(giftModel.clearStartDate).not.toHaveBeenCalled();
      expect(giftModel.initStartMonth).toHaveBeenCalled();
    });
  });

  describe('startMonth getter', () => {
    it("should load start month if it hasn't been updated", () => {
      expect(giftModel.startMonth).toEqual('5');
    });

    it('should load start month if it has been updated', () => {
      giftModel.gift['updated-start-month'] = '06';
      giftModel.gift['updated-start-year'] = '2015';

      expect(giftModel.startMonth).toEqual('6');
    });
  });

  describe('startMonth setter', () => {
    beforeEach(() => {
      jest.spyOn(giftModel, 'initStartMonth').mockImplementation(() => {});
      jest.spyOn(giftModel, 'clearStartDate').mockImplementation(() => {});
    });

    it('should update start month', () => {
      giftModel.startMonth = '10';

      expect(giftModel.gift['updated-start-month']).toEqual('10');
      expect(giftModel.gift['updated-start-year']).toEqual('2015');
    });

    it('should update start month to the next year', () => {
      giftModel.startMonth = '4';

      expect(giftModel.gift['updated-start-month']).toEqual('04');
      expect(giftModel.gift['updated-start-year']).toEqual('2016');
    });

    it('should update start month to the next year if it is the same as the original but frequency has changed', () => {
      giftModel.frequency = 'Quarterly';
      giftModel.startMonth = '5';

      expect(giftModel.gift['updated-start-month']).toEqual('05');
      expect(giftModel.gift['updated-start-year']).toEqual('2016');
    });

    it('should update start month to the next year if it is the same as the original but transaction day has changed', () => {
      giftModel.transactionDay = '11';
      giftModel.startMonth = '5';

      expect(giftModel.gift['updated-start-month']).toEqual('05');
      expect(giftModel.gift['updated-start-year']).toEqual('2016');
    });

    it('should clear updated start month if it is the same as the original and transaction day and frequency have not changed', () => {
      giftModel.startMonth = '5';

      expect(giftModel.gift['updated-start-month']).toEqual('');
      expect(giftModel.gift['updated-start-year']).toEqual('');
    });
  });

  describe('nextGiftDate', () => {
    it('should compute the next gift date from the updated start month, year, and transaction day', () => {
      giftModel.gift['updated-start-month'] = '07';
      giftModel.gift['updated-start-year'] = '2014 ';

      expect(giftModel.nextGiftDate.toString()).toEqual(
        moment('2014-07-15').toString(),
      );
    });

    it('should compute the next gift date from the transaction day and next draw date when start month is unchanged and transaction day is changed', () => {
      giftModel.transactionDay = '18';

      expect(giftModel.nextGiftDate.toString()).toEqual(
        moment('2015-06-18').toString(),
      );
    });

    it('should return the old draw date when start month and transaction day are unchanged', () => {
      expect(giftModel.nextGiftDate.toString()).toEqual(
        moment('2015-05-06').toString(),
      );
    });

    it("should handle the case when the parent donation doesn't have a next draw date", () => {
      delete giftModel.parentDonation['next-draw-date'];

      expect(giftModel.nextGiftDate).toBeUndefined();
    });
  });

  describe('initStartMonth', () => {
    it('should use transaction day and nextDrawDate to default updated start month and year', () => {
      giftModel.gift['updated-recurring-day-of-month'] = '20';
      giftModel.initStartMonth();

      expect(giftModel.startMonth).toEqual('5');

      giftModel.gift['updated-recurring-day-of-month'] = '19';
      giftModel.initStartMonth();

      expect(giftModel.startMonth).toEqual('6');
    });
  });

  describe('clearStartDate', () => {
    it('should clear updated start month and year', () => {
      giftModel.gift['updated-start-month'] = '05';
      giftModel.gift['updated-start-year'] = '2015';
      giftModel.clearStartDate();

      expect(giftModel.gift['updated-start-month']).toEqual('');
      expect(giftModel.gift['updated-start-year']).toEqual('');
    });
  });

  describe('hasChanges', () => {
    it('should return false if no changes have been made', () => {
      expect(giftModel.hasChanges()).toEqual(false);
    });

    it('should return true if amount has been updated', () => {
      giftModel.amount = 50;

      expect(giftModel.hasChanges()).toEqual(true);
    });

    it('should return true if payment id has been updated', () => {
      giftModel.paymentMethodId = 'some new id';

      expect(giftModel.hasChanges()).toEqual(true);
    });

    it('should return true if frequency has been updated', () => {
      giftModel.frequency = 'Quarterly';

      expect(giftModel.hasChanges()).toEqual(true);
    });

    it('should return true if transaction day has been updated', () => {
      giftModel.transactionDay = '16';

      expect(giftModel.hasChanges()).toEqual(true);
    });

    it('should return true if start month has been updated', () => {
      giftModel.gift['updated-start-month'] = '12';

      expect(giftModel.hasChanges()).toEqual(true);
    });

    it('should return true if start year has been updated', () => {
      giftModel.gift['updated-start-year'] = '2016';

      expect(giftModel.hasChanges()).toEqual(true);
    });

    it('should return true if donation status has been updated', () => {
      giftModel.gift['updated-donation-line-status'] = 'Cancelled';

      expect(giftModel.hasChanges()).toEqual(true);
    });

    it('should return true if designation number has been updated', () => {
      giftModel.gift['updated-designation-number'] = '1234567';

      expect(giftModel.hasChanges()).toEqual(true);
    });
  });

  describe('toObject getter', () => {
    it('should return the object to send to the api', () => {
      expect(giftModel.toObject).toEqual(giftModel.gift);
    });

    it('should include the recurring day of month when the month changes', () => {
      giftModel.startMonth = '6';
      expect(giftModel.toObject).toEqual({
        ...giftModel.gift,
        'updated-recurring-day-of-month': '15',
        'updated-start-month': '06',
        'updated-start-year': '2015',
      });
    });

    it('should not override the modified recurring day of month when the month changes', () => {
      giftModel.transactionDay = '20';
      giftModel.startMonth = '6';
      expect(giftModel.toObject).toEqual({
        ...giftModel.gift,
        'updated-recurring-day-of-month': '20',
        'updated-start-month': '06',
        'updated-start-year': '2015',
      });
    });
  });

  describe('clone', () => {
    it('creates a copy of the gift', () => {
      giftModel.amount = 500;
      const clone = giftModel.clone();

      expect(clone instanceof RecurringGiftModel).toEqual(true);
      expect(clone).toEqual(giftModel);
      clone.donationLineStatus = 'Cancelled';

      expect(clone.amount).toEqual(giftModel.amount);
      expect(clone.donationLineStatus).not.toEqual(
        giftModel.donationLineStatus,
      );
    });
  });

  describe('setDefaults', () => {
    it('should set default values for a new gift', () => {
      expect(giftModel.setDefaults().toObject).toEqual(
        expect.objectContaining({
          'updated-designation-number': giftModel.gift['designation-number'],
          'updated-rate': {
            recurrence: {
              interval: 'Monthly',
            },
          },
        }),
      );
    });
  });

  describe('setDefaultsSingleGift', () => {
    it('should set default values for a new single gift', () => {
      expect(giftModel.setDefaultsSingleGift().toObject).toEqual(
        expect.objectContaining({
          'updated-designation-number': giftModel.gift['designation-number'],
        }),
      );
    });
  });
});
