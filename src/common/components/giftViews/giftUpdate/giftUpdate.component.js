import angular from 'angular';
import moment from 'moment';

import {startMonth, startDate, quarterlyMonths, possibleTransactionDays} from 'common/services/giftHelpers/giftDates.service';

import template from './giftUpdate.tpl';

let componentName = 'giftUpdate';

class GiftUpdateController {

  /* @ngInject */
  constructor() {
    this.startDate = startDate;
    this.quarterlyMonths = quarterlyMonths;
    this.possibleTransactionDays = possibleTransactionDays;
    this.possibleMonths = moment.months();
  }

  $onInit(){

  }

  // These getterSetters are being used with ng-model-options to read from original value and write to the updated- prefixed values

  amountModel(value){
    if(value){
      this.gift['updated-amount'] = value !== this.gift['amount'] ? value : '';
    }else{
      return this.gift['updated-amount'] || this.gift['amount'];
    }
  }

  paymentModel(value){
    if(value){
      this.gift['updated-payment-method-id'] = value !== this.gift['payment-method-id'] ? value : '';
    }else{
      return this.gift['updated-payment-method-id'] || this.gift['payment-method-id'];
    }
  }

  frequencyModel(value) {
    if (value) {
      this.gift['updated-rate']['recurrence']['interval'] = value !== this.gift['rate']['recurrence']['interval'] ? value : '';
      if(value === 'Monthly' || this.gift['updated-rate']['recurrence']['interval'] === '' && this.gift['updated-recurring-day-of-month'] === ''){
        this.clearStartDate(); // Don't need to update start date if gift if Monthly or if frequency and transaction day are unchanged
      }else{
        this.initStartMonth();
      }
    } else {
      return this.gift['updated-rate']['recurrence']['interval'] || this.gift['rate']['recurrence']['interval'];
    }
  }

  transactionDayModel(value){
    if(value){
      this.gift['updated-recurring-day-of-month'] = value !== this.gift['recurring-day-of-month'] ? value : '';
      if(this.gift['updated-rate']['recurrence']['interval'] === 'Monthly' || this.gift['updated-rate']['recurrence']['interval'] === '' && (this.gift['rate']['recurrence']['interval'] === 'Monthly' || this.gift['updated-recurring-day-of-month'] === '')){
        this.clearStartDate(); // Don't need to update start date if gift is Monthly, if gift was Monthly and the frequency is unchanged, or if the frequency is unchanged and the transaction day is unchanged
      }else{
        this.initStartMonth();
      }
    }else{
      return this.gift['updated-recurring-day-of-month'] || this.gift['recurring-day-of-month'];
    }
  }

  startMonthModel(value){
    if(value){
      let updatedStartDate = moment(startMonth(this.transactionDayModel(), value, this.nextDrawDate));
      if(updatedStartDate.isSame(this.gift['next-draw-date']['display-value'], 'month')){
        this.clearStartDate();
      }else {
        this.gift['updated-start-month'] = updatedStartDate.format('MM');
        this.gift['updated-start-year'] = updatedStartDate.format('YYYY');
      }
    }else{
      let startDate;
      if(this.gift['updated-start-year'] && this.gift['updated-start-month']){
        startDate = moment({ year: this.gift['updated-start-year'], month: parseInt(this.gift['updated-start-month']) - 1, day: this.transactionDayModel() });
      }else{
        startDate = moment(this.gift['next-draw-date']['display-value']);
      }
      return startDate.format('M');
    }
  }

  initStartMonth(){
    this.startMonthModel(this.startDate(this.transactionDayModel(), this.nextDrawDate).format('MM'));
  }

  clearStartDate(){
    this.gift['updated-start-month'] = '';
    this.gift['updated-start-year'] = '';
  }
}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: GiftUpdateController,
    templateUrl: template.name,
    bindings: {
      gift: '=',
      paymentMethods: '<',
      nextDrawDate: '<'
    }
  });
