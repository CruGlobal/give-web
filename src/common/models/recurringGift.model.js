import moment from 'moment';
import find from 'lodash/find';

import {startMonth, startDate} from 'common/services/giftHelpers/giftDates.service';

export default class RecurringGiftModel {

  constructor(gift, parentDonation, nextDrawDate, paymentMethods) {
    this.gift = gift;
    this.parentDonation = parentDonation;
    this.nextDrawDate = nextDrawDate;
    this.paymentMethods = paymentMethods;
  }

  get designationName() {
    return this.gift['designation-name'];
  }

  get designationNumber() {
    return this.gift['designation-number'];
  }

  get amount(){
    return this.gift['updated-amount'] || this.gift['amount'];
  }

  set amount(value){
    this.gift['updated-amount'] = value !== this.gift['amount'] ? value : '';
  }

  get paymentMethodId(){
    return this.gift['updated-payment-method-id'] || this.gift['payment-method-id'];
  }

  set paymentMethodId(value){
    this.gift['updated-payment-method-id'] = value !== this.gift['payment-method-id'] ? value : '';
    delete this._paymentMethod;
  }

  get paymentMethod(){
    return this._paymentMethod = this._paymentMethod || find( this.paymentMethods, ( paymentMethod ) => {
      return this.paymentMethodId === paymentMethod.self.uri.split( '/' ).pop();
    } );
  }

  set donationLineStatus(value){
    this.gift['updated-donation-line-status'] = value !== this.gift['donation-line-status'] ? value : '';
  }

  get donationLineStatus(){
    return this.gift['updated-donation-line-status'] || this.gift['donation-line-status'];
  }

  get frequency() {
    return this.gift['updated-rate']['recurrence']['interval'] || this.parentDonation['rate']['recurrence']['interval'];
  }

  set frequency(value) {
    this.gift['updated-rate']['recurrence']['interval'] = value !== this.parentDonation['rate']['recurrence']['interval'] ? value : '';
    if(value === 'Monthly' || this.gift['updated-rate']['recurrence']['interval'] === '' && this.gift['updated-recurring-day-of-month'] === ''){
      this.clearStartDate(); // Don't need to update start date if gift if Monthly or if frequency and transaction day are unchanged
    }else{
      this.initStartMonth();
    }
  }

  get transactionDay(){
    return this.gift['updated-recurring-day-of-month'] || this.parentDonation['recurring-day-of-month'];
  }

  set transactionDay(value){
    this.gift['updated-recurring-day-of-month'] = value !== this.parentDonation['recurring-day-of-month'] ? value : '';
    if(this.frequency === 'Monthly' || this.gift['updated-rate']['recurrence']['interval'] === '' && this.gift['updated-recurring-day-of-month'] === ''){
      this.clearStartDate(); // Don't need to update start date if gift is Monthly or if the frequency is unchanged and the transaction day is unchanged
    }else{
      this.initStartMonth();
    }
  }

  get startMonth(){
    return this.nextGiftDate.format('M');
  }

  set startMonth(value){
    let updatedStartDate = moment(startMonth(this.transactionDay, value, this.nextDrawDate));
    if(updatedStartDate.isSame(this.parentDonation['next-draw-date']['display-value'], 'month') || this.gift['updated-rate']['recurrence']['interval'] === '' && this.gift['updated-recurring-day-of-month'] === '' && moment(this.parentDonation['next-draw-date']['display-value']).format('M') === updatedStartDate.format('M')){
      this.clearStartDate(); // Don't need to update start date if draw date year and month are still correct, or if frequency, transaction day, and start month are unchanged
    }else {
      this.gift['updated-start-month'] = updatedStartDate.format('MM');
      this.gift['updated-start-year'] = updatedStartDate.format('YYYY');
    }
  }

  get nextGiftDate() {
    let giftDate;
    if(this.gift['updated-start-year'] && this.gift['updated-start-month']){
      giftDate = moment({ year: this.gift['updated-start-year'], month: parseInt(this.gift['updated-start-month']) - 1, day: this.transactionDay });
    }else if(this.gift['updated-recurring-day-of-month'] !== ''){
      // We have to take transactionDay into account here when it is modified for monthly gifts since they don't set the updated-start-month/year fields
      giftDate = startDate(this.transactionDay, this.nextDrawDate);
    }else{
      giftDate = moment(this.parentDonation['next-draw-date']['display-value']);
    }
    return giftDate;
  }

  initStartMonth(){
    this.startMonth = startDate(this.transactionDay, this.nextDrawDate).format('MM');
  }

  clearStartDate(){
    this.gift['updated-start-month'] = '';
    this.gift['updated-start-year'] = '';
  }

  hasChanges(){
    return this.gift['updated-amount'] !== '' ||
      this.gift['updated-payment-method-id'] !== '' ||
      this.gift['updated-rate']['recurrence']['interval'] !== '' ||
      this.gift['updated-recurring-day-of-month'] !== '' ||
      this.gift['updated-start-month'] !== '' ||
      this.gift['updated-start-year'] !== '' ||
      this.gift['updated-donation-line-status'] !== '';
  }

  get toObject(){
    return this.gift;
  }
}
