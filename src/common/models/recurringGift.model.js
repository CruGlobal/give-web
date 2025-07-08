import angular from 'angular';
import moment from 'moment';
import find from 'lodash/find';
import defaults from 'lodash/defaults';

import {
  startMonth,
  startDate,
} from 'common/services/giftHelpers/giftDates.service';

export default class RecurringGiftModel {
  /* @ngInject */
  constructor(gift, parentDonation) {
    this.gift = gift;
    this.parentDonation = parentDonation;

    this.initializeEmptyFields();
  }

  initializeEmptyFields() {
    defaults(this.gift, {
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

    if (!this.parentDonation) {
      this.parentDonation = {
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
      };
    }
  }

  get nextDrawDate() {
    return this.constructor.nextDrawDate;
  }

  static get nextDrawDate() {
    return this.constructor._nextDrawDate;
  }

  static set nextDrawDate(nextDrawDate) {
    this.constructor._nextDrawDate = nextDrawDate;
  }

  get paymentMethods() {
    return this.constructor.paymentMethods;
  }

  static get paymentMethods() {
    return this.constructor._paymentMethods;
  }

  static set paymentMethods(paymentMethods) {
    this.constructor._paymentMethods = paymentMethods;
  }

  get designationName() {
    return this.gift['designation-name'];
  }

  set designationName(value) {
    this.gift['designation-name'] = value;
  }

  get designationNumber() {
    return (
      this.gift['updated-designation-number'] || this.gift['designation-number']
    );
  }

  set designationNumber(value) {
    this.gift['updated-designation-number'] =
      value !== this.gift['designation-number'] ? value : '';
  }

  get amount() {
    return this.gift['updated-amount'] === undefined
      ? ''
      : this.gift['updated-amount'] || this.gift.amount;
  }

  set amount(value) {
    this.gift['updated-amount'] = value !== this.gift.amount ? value : '';
  }

  get paymentMethodId() {
    let paymentMethodId =
      this.gift['updated-payment-instrument-id'] ||
      this.gift['payment-instrument-id'];
    if (!paymentMethodId) {
      paymentMethodId = this.gift['updated-payment-instrument-id'] =
        this.paymentMethods &&
        this.paymentMethods[0] &&
        this.paymentMethods[0].self.uri.split('/').pop();
    }
    return paymentMethodId;
  }

  set paymentMethodId(value) {
    this.gift['updated-payment-instrument-id'] =
      value !== this.gift['payment-instrument-id'] ? value : '';
    delete this._paymentMethod;
  }

  get paymentMethod() {
    this._paymentMethod =
      this._paymentMethod ||
      find(this.paymentMethods, (paymentMethod) => {
        return this.paymentMethodId === paymentMethod.self.uri.split('/').pop();
      });
    return this._paymentMethod;
  }

  set donationLineStatus(value) {
    this.gift['updated-donation-line-status'] =
      value !== this.gift['donation-line-status'] ? value : '';
  }

  get donationLineStatus() {
    return (
      this.gift['updated-donation-line-status'] ||
      this.gift['donation-line-status']
    );
  }

  get frequency() {
    return (
      this.gift['updated-rate'].recurrence.interval ||
      this.parentDonation.rate.recurrence.interval
    );
  }

  set frequency(value) {
    this.gift['updated-rate'].recurrence.interval =
      value !== this.parentDonation.rate.recurrence.interval ? value : '';
    if (
      value === 'Monthly' ||
      (this.gift['updated-rate'].recurrence.interval === '' &&
        this.gift['updated-recurring-day-of-month'] === '')
    ) {
      /* eslint-disable-line no-mixed-operators */ this.clearStartDate(); // Don't need to update start date if gift if Monthly or if frequency and transaction day are unchanged
    } else {
      this.initStartMonth();
    }
  }

  get transactionDay() {
    return (
      this.gift['updated-recurring-day-of-month'] ||
      this.parentDonation['recurring-day-of-month']
    );
  }

  set transactionDay(value) {
    this.gift['updated-recurring-day-of-month'] =
      value !== this.parentDonation['recurring-day-of-month'] ? value : '';
    if (
      this.frequency === 'Monthly' ||
      (this.gift['updated-rate'].recurrence.interval === '' &&
        this.gift['updated-recurring-day-of-month'] === '')
    ) {
      /* eslint-disable-line no-mixed-operators */ this.clearStartDate(); // Don't need to update start date if gift is Monthly or if the frequency is unchanged and the transaction day is unchanged
    } else {
      this.initStartMonth();
    }
  }

  get startMonth() {
    return this.nextGiftDate.format('M');
  }

  set startMonth(value) {
    const updatedStartDate = moment(
      startMonth(
        this.transactionDay,
        value,
        this.nextDrawDate,
        0,
        this.parentDonation['start-date']['display-value'],
      ),
    );
    if (
      updatedStartDate.isSame(
        this.parentDonation['next-draw-date']['display-value'],
        'month',
      ) ||
      (this.gift['updated-rate'].recurrence.interval === '' &&
        this.gift['updated-recurring-day-of-month'] === '' &&
        moment(this.parentDonation['next-draw-date']['display-value']).format(
          'M',
        ) === updatedStartDate.format('M'))
    ) {
      /* eslint-disable-line no-mixed-operators */ this.clearStartDate(); // Don't need to update start date if draw date year and month are still correct, or if frequency, transaction day, and start month are unchanged
    } else {
      this.gift['updated-start-month'] = updatedStartDate.format('MM');
      this.gift['updated-start-year'] = updatedStartDate.format('YYYY');
    }
  }

  get nextGiftDate() {
    let giftDate;
    if (this.gift['updated-start-year'] && this.gift['updated-start-month']) {
      giftDate = moment({
        year: this.gift['updated-start-year'],
        month: parseInt(this.gift['updated-start-month']) - 1,
        day: this.transactionDay,
      });
    } else if (this.gift['updated-recurring-day-of-month'] !== '') {
      // We have to take transactionDay into account here when it is modified for monthly gifts since they don't set the updated-start-month/year fields
      giftDate = startDate(
        this.transactionDay,
        this.nextDrawDate,
        0,
        this.parentDonation['start-date']['display-value'],
      );
    } else {
      giftDate =
        this.parentDonation['next-draw-date'] &&
        moment(this.parentDonation['next-draw-date']['display-value']);
    }
    return giftDate;
  }

  initStartMonth() {
    this.startMonth = startDate(
      this.transactionDay,
      this.nextDrawDate,
      0,
      this.parentDonation['start-date']['display-value'],
    ).format('MM');
  }

  clearStartDate() {
    this.gift['updated-start-month'] = '';
    this.gift['updated-start-year'] = '';
  }

  hasChanges() {
    return (
      this.gift['updated-amount'] !== '' ||
      this.gift['updated-payment-instrument-id'] !== '' ||
      this.gift['updated-rate'].recurrence.interval !== '' ||
      this.gift['updated-recurring-day-of-month'] !== '' ||
      this.gift['updated-start-month'] !== '' ||
      this.gift['updated-start-year'] !== '' ||
      this.gift['updated-donation-line-status'] !== '' ||
      this.gift['updated-designation-number'] !== ''
    );
  }

  get toObject() {
    if (this.gift['updated-start-month'] === '') {
      return this.gift;
    }

    // When the start month changes the server needs the recurring day of month even if it didn't change
    return {
      ...this.gift,
      'updated-recurring-day-of-month':
        this.gift['updated-recurring-day-of-month'] ||
        this.parentDonation['recurring-day-of-month'],
    };
  }

  clone() {
    return angular.copy(this, Object.create(this));
  }

  setDefaults() {
    this.gift['updated-designation-number'] = this.gift['designation-number'];
    this.gift['updated-amount'] = 50;
    this.gift['updated-rate'].recurrence.interval = 'Monthly';
    this.gift['updated-recurring-day-of-month'] = startDate(
      null,
      this.nextDrawDate,
    ).format('DD');
    return this;
  }

  setDefaultsSingleGift() {
    this.gift['updated-designation-number'] = this.gift['designation-number'];
    return this;
  }
}
