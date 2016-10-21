import angular from 'angular';
import moment from 'moment';
import 'angular-mocks';

import module from './giftUpdate.component';

describe('giftUpdate', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(module.name, {}, {
      gift: {
        rate: {
          recurrence: {
            interval: ''
          }
        },
        'updated-rate': {
          recurrence: {
            interval: ''
          }
        },
        'next-draw-date': {
          'display-value': ''
        }
      }
    });
  }));

  describe('$onInit', () => {
    it('should have already defined possibleMonths', () => {
      expect(self.controller.possibleMonths.length).toEqual(12);
    });
  });

  describe('amountModel', () => {
    beforeEach(() => {
      self.controller.gift['amount'] = 50;
    });

    it('should load amount if it hasn\'t been updated', () => {
      expect(self.controller.amountModel()).toEqual(50);
    });
    it('should load amount if it has been updated', () => {
      self.controller.gift['updated-amount'] = 25;
      expect(self.controller.amountModel()).toEqual(25);
    });
    it('should update amount', () => {
      self.controller.amountModel(75);
      expect(self.controller.gift['amount']).toEqual(50);
      expect(self.controller.gift['updated-amount']).toEqual(75);
    });
    it('should clear updated amount if it is the same as the original', () => {
      self.controller.amountModel(50);
      expect(self.controller.gift['amount']).toEqual(50);
      expect(self.controller.gift['updated-amount']).toEqual('');
    });
  });

  describe('paymentModel', () => {
    beforeEach(() => {
      self.controller.gift['payment-method-id'] = 'original id';
    });

    it('should load payment id if it hasn\'t been updated', () => {
      expect(self.controller.paymentModel()).toEqual('original id');
    });
    it('should load payment id if it has been updated', () => {
      self.controller.gift['updated-payment-method-id'] = 'new id';
      expect(self.controller.paymentModel()).toEqual('new id');
    });
    it('should update payment id', () => {
      self.controller.paymentModel('new id');
      expect(self.controller.gift['payment-method-id']).toEqual('original id');
      expect(self.controller.gift['updated-payment-method-id']).toEqual('new id');
    });
    it('should clear updated payment id if it is the same as the original', () => {
      self.controller.paymentModel('original id');
      expect(self.controller.gift['payment-method-id']).toEqual('original id');
      expect(self.controller.gift['updated-payment-method-id']).toEqual('');
    });
  });

  describe('frequencyModel', () => {
    beforeEach(() => {
      self.controller.gift['rate']['recurrence']['interval'] = 'Monthly';
      spyOn(self.controller, 'initStartMonth');
      spyOn(self.controller, 'clearStartDate');
    });

    it('should load frequency if it hasn\'t been updated', () => {
      expect(self.controller.frequencyModel()).toEqual('Monthly');
    });
    it('should load frequency if it has been updated', () => {
      self.controller.gift['updated-rate']['recurrence']['interval'] = 'Quarterly';
      expect(self.controller.frequencyModel()).toEqual('Quarterly');
    });
    it('should update frequency', () => {
      self.controller.frequencyModel('Quarterly');
      expect(self.controller.gift['rate']['recurrence']['interval']).toEqual('Monthly');
      expect(self.controller.gift['updated-rate']['recurrence']['interval']).toEqual('Quarterly');
    });
    it('should clear updated frequency if it is the same as the original', () => {
      self.controller.frequencyModel('Monthly');
      expect(self.controller.gift['rate']['recurrence']['interval']).toEqual('Monthly');
      expect(self.controller.gift['updated-rate']['recurrence']['interval']).toEqual('');
    });
    it('should init start date when updated to a non monthly value', () => {
      self.controller.frequencyModel('Quarterly');
      expect(self.controller.initStartMonth).toHaveBeenCalledTimes(1);
      self.controller.frequencyModel('Annually');
      expect(self.controller.initStartMonth).toHaveBeenCalledTimes(2);
      expect(self.controller.clearStartDate).not.toHaveBeenCalled();
    });
    it('should clear start date when changed to Monthly', () => {
      self.controller.frequencyModel('Monthly');
      expect(self.controller.clearStartDate).toHaveBeenCalled();
      expect(self.controller.initStartMonth).not.toHaveBeenCalled();
    });
    it('should clear start date when changed back to the original value and transaction day is unchanged', () => {
      self.controller.gift['rate']['recurrence']['interval'] = 'Quarterly';
      self.controller.gift['updated-recurring-day-of-month'] = '';
      self.controller.frequencyModel('Quarterly');
      expect(self.controller.clearStartDate).toHaveBeenCalled();
      expect(self.controller.initStartMonth).not.toHaveBeenCalled();
    });
    it('should init start date when changed back to the original value and but transaction day is changed', () => {
      self.controller.gift['rate']['recurrence']['interval'] = 'Quarterly';
      self.controller.gift['updated-recurring-day-of-month'] = '10';
      self.controller.frequencyModel('Quarterly');
      expect(self.controller.clearStartDate).not.toHaveBeenCalled();
      expect(self.controller.initStartMonth).toHaveBeenCalled();
    });
  });

  describe('transactionDayModel', () => {
    beforeEach(() => {
      self.controller.gift['recurring-day-of-month'] = '10';
      spyOn(self.controller, 'initStartMonth');
      spyOn(self.controller, 'clearStartDate');
    });

    it('should load transaction day if it hasn\'t been updated', () => {
      expect(self.controller.transactionDayModel()).toEqual('10');
    });
    it('should load transaction day if it has been updated', () => {
      self.controller.gift['updated-recurring-day-of-month'] = '11';
      expect(self.controller.transactionDayModel()).toEqual('11');
    });
    it('should update transaction day', () => {
      self.controller.transactionDayModel('11');
      expect(self.controller.gift['recurring-day-of-month']).toEqual('10');
      expect(self.controller.gift['updated-recurring-day-of-month']).toEqual('11');
    });
    it('should clear updated transaction day if it is the same as the original', () => {
      self.controller.transactionDayModel('10');
      expect(self.controller.gift['recurring-day-of-month']).toEqual('10');
      expect(self.controller.gift['updated-recurring-day-of-month']).toEqual('');
    });
    it('should clear start date when frequency is Monthly', () => {
      self.controller.gift['updated-rate']['recurrence']['interval'] = 'Monthly';
      self.controller.transactionDayModel('11');
      expect(self.controller.clearStartDate).toHaveBeenCalled();
      expect(self.controller.initStartMonth).not.toHaveBeenCalled();
    });
    it('should clear start date when frequency was Monthly and the frequency is unchanged', () => {
      self.controller.gift['rate']['recurrence']['interval'] = 'Monthly';
      self.controller.gift['updated-rate']['recurrence']['interval'] = '';
      self.controller.transactionDayModel('11');
      expect(self.controller.clearStartDate).toHaveBeenCalled();
      expect(self.controller.initStartMonth).not.toHaveBeenCalled();
    });
    it('should clear start date when the frequency is unchanged and transaction day is unchanged', () => {
      self.controller.gift['rate']['recurrence']['interval'] = 'Quarterly';
      self.controller.gift['updated-rate']['recurrence']['interval'] = '';
      self.controller.gift['updated-recurring-day-of-month'] = '';
      self.controller.transactionDayModel('10');
      expect(self.controller.clearStartDate).toHaveBeenCalled();
      expect(self.controller.initStartMonth).not.toHaveBeenCalled();
    });
    it('should init start date when updated to a non monthly value', () => {
      self.controller.transactionDayModel('Quarterly');
      expect(self.controller.initStartMonth).toHaveBeenCalledTimes(1);
      self.controller.transactionDayModel('Annually');
      expect(self.controller.initStartMonth).toHaveBeenCalledTimes(2);
      expect(self.controller.clearStartDate).not.toHaveBeenCalled();
    });
    it('should init start date when transaction day is changed', () => {
      self.controller.gift['rate']['recurrence']['interval'] = 'Quarterly';
      self.controller.gift['updated-recurring-day-of-month'] = '11';
      self.controller.frequencyModel('Quarterly');
      expect(self.controller.clearStartDate).not.toHaveBeenCalled();
      expect(self.controller.initStartMonth).toHaveBeenCalled();
    });
  });

  describe('startMonthModel', () => {
    beforeEach(() => {
      self.controller.nextDrawDate = '2015-05-20';
      self.controller.gift['next-draw-date']['display-value'] = '2015-05-06';
      self.controller.gift['updated-start-month'] = '';
      self.controller.gift['updated-start-year'] = '';
      self.controller.gift['updated-recurring-day-of-month'] = '10';
      spyOn(self.controller, 'initStartMonth');
      spyOn(self.controller, 'clearStartDate');
    });

    it('should load start month if it hasn\'t been updated', () => {
      expect(self.controller.startMonthModel()).toEqual('5');
    });
    it('should load start month if it has been updated', () => {
      self.controller.gift['updated-start-month'] = '06';
      self.controller.gift['updated-start-year'] = '2015';
      expect(self.controller.startMonthModel()).toEqual('6');
    });
    it('should update start month', () => {
      self.controller.startMonthModel('10');
      expect(self.controller.gift['updated-start-month']).toEqual('10');
      expect(self.controller.gift['updated-start-year']).toEqual('2015');
    });
    it('should update start month to the next year', () => {
      self.controller.startMonthModel('5');
      expect(self.controller.gift['updated-start-month']).toEqual('05');
      expect(self.controller.gift['updated-start-year']).toEqual('2016'); // nextDrawDate is after transaction day so this jumps to the next year // TODO: do we need to ignore nextDrawDate if transaction day is unchanged?
    });
    it('should clear updated start month if it is the same as the original', () => {
      self.controller.nextDrawDate = '2015-05-08';
      self.controller.startMonthModel('5');
      expect(self.controller.gift['next-draw-date']['display-value']).toEqual('2015-05-06');
      expect(self.controller.gift['updated-start-month']).toEqual('');
      expect(self.controller.gift['updated-start-year']).toEqual('');
    });
  });

  describe('initStartMonth', () => {
    it('should use transaction day and nextDrawDate to default updated start month and year', () => {
      spyOn(self.controller.giftDatesService, 'startDate').and.returnValue(moment('2015-07-05'));
      spyOn(self.controller, 'startMonthModel');
      self.controller.gift['updated-recurring-day-of-month'] = '05';
      self.controller.nextDrawDate = '2015-07-03';
      self.controller.initStartMonth();
      expect(self.controller.giftDatesService.startDate).toHaveBeenCalledWith('05', '2015-07-03');
      expect(self.controller.startMonthModel).toHaveBeenCalledWith('07');
    });
  });

  describe('clearStartDate', () => {
    it('should clear updated start month and year', () => {
      self.controller.gift['updated-start-month'] = '05';
      self.controller.gift['updated-start-year'] = '2015';
      self.controller.clearStartDate();
      expect(self.controller.gift['updated-start-month']).toEqual('');
      expect(self.controller.gift['updated-start-year']).toEqual('');
    });
  });
});
