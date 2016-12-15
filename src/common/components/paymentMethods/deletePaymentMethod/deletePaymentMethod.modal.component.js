import angular from 'angular';
import moment from 'moment';

import profileService from 'common/services/api/profile.service.js';
import paymentMethodForm from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.component';
import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';
import {quarterlyMonths} from 'common/services/giftHelpers/giftDates.service';

import template from './deletePaymentMethod.modal.tpl';
import remove from 'lodash/remove';
import find from 'lodash/find';
import forEach from 'lodash/forEach';

import formatAddressForTemplate from 'common/services/addressHelpers/formatAddressForTemplate';
import {scrollModalToTop} from 'common/services/modalState.service';

let componentName = 'deletePaymentMethodModal';

class deletePaymentMethodModalController {

  /* @ngInject */
  constructor(profileService, $log) {
    this.profileService = profileService;
    this.$log = $log;
    this.quarterlyMonths = quarterlyMonths;

    this.loading = false;
    this.view = '';
    this.filteredPaymentMethods = [];
    this.confirmText = '';
    this.submitted = false;
    this.deleteOption = 0;
    this.submissionError = {
      error: ''
    };
    this.monthNames = moment.months();
    this.scrollModalToTop = scrollModalToTop;
  }

  $onInit() {
    this.setView();
    this.getPaymentMethods();
  }

  changeView(goBack){
    this.submissionError.error = '';
    if(goBack) {
      this.setView();
      return;
    }
    switch(this.deleteOption) {
      case '1'://move to an existing paymentMethod
        this.view = 'confirm';
        this.confirmText = 'withTransfer';
      break;
      case '2'://move to a new paymentMethod
        this.view = 'addPaymentMethod';
      break;
      case '3'://confirm to delete
        this.view = 'confirm';
        this.confirmText = 'withOutTransfer';
      break;
    }
    this.scrollModalToTop();
  }

  setView(){
    this.hasRecurrinGifts = this.resolve.paymentMethod._recurringgifts[0].donations.length != 0;
    this.view = this.hasRecurrinGifts ? 'manageDonations' : 'confirm';
  }

  getPaymentMethodName(newPaymentMethod){
    let paymentMethod = newPaymentMethod ? find(this.filteredPaymentMethods,(item)=>{
      return item.self.uri == this.selectedPaymentMethod;
    }) : this.resolve.paymentMethod;
    return paymentMethod['card-type'] || paymentMethod['bank-name'];
  }

  getPaymentMethodLastFourDigits(newPaymentMethod){
    let paymentMethod = newPaymentMethod ? find(this.filteredPaymentMethods,(item)=>{
      return item.self.uri == this.selectedPaymentMethod;
    }) : this.resolve.paymentMethod;
    return paymentMethod['display-account-number'] || paymentMethod['card-number'];
  }

  getPaymentMethodOptionLabel(paymentMethod){
    return (paymentMethod['bank-name'] || paymentMethod['card-type']) + ' ending in ****' + (paymentMethod['display-account-number'] || paymentMethod['card-number']);
  }

  getRecurrenceDate(gift){
    return new Date(gift['next-draw-date']['display-value']);
  }

  buildGifts(recurringGifts){
    var gifts = [];
    forEach(recurringGifts,(gift) => {
      var rate = gift.rate,
          day = gift['recurring-day-of-month'],
          nextDrawDate = gift['next-draw-date'];
      forEach(gift['donation-lines'], (donationLine) => {
        donationLine['rate'] = rate;
        donationLine['next-draw-date'] = nextDrawDate;
        donationLine['recurring-day-of-month'] = day;
        gifts = gifts.concat(donationLine);
      });
    });
    return gifts;
  }

  getPaymentMethods(){
    if(this.resolve.paymentMethodsList && this.hasRecurrinGifts){
      // filtered payment methods for the drop down. List excludes payment method that is being deleted
      this.filteredPaymentMethods = this.resolve.paymentMethodsList.slice();
      remove(this.filteredPaymentMethods,(item) => {
        return item.self.uri == this.resolve.paymentMethod.self.uri;
      });
      this.deleteOption = this.filteredPaymentMethods.length ? '1' : '2';
      this.selectedPaymentMethod = this.filteredPaymentMethods.length ? this.filteredPaymentMethods[0].self.uri : false; // set first element as selected by default
    }
  }
  moveDonations(){
    let isExistingPaymentMethod;
    isExistingPaymentMethod = this.resolve.paymentMethodsList.length > this.filteredPaymentMethods.length;
    //move donations from old to new PM
    let selectedPaymentMethod = find(this.filteredPaymentMethods, (item) => {
      return this.selectedPaymentMethod == item.self.uri;
    });

    // add recurring gifts to an existing payment method
    if(isExistingPaymentMethod){
      forEach(this.resolve.paymentMethodsList, (item) => {
        if(item.self.uri == selectedPaymentMethod.self.uri) {
          item._recurringgifts = this.resolve.paymentMethod._recurringgifts;
        }
      });
    } else {
      //add newly created payment method to a list
      selectedPaymentMethod._recurringgifts = this.resolve.paymentMethod._recurringgifts;
      this.resolve.paymentMethodsList.push(selectedPaymentMethod);
    }

    //remove deleted payment method from the list
    this.removePaymentMethodFromList();

  }

  removePaymentMethodFromList() {
    remove(this.resolve.paymentMethodsList, (item) => {
      return item.self.uri == this.resolve.paymentMethod.self.uri;
    });
  }

  getNewPaymentMethodId(){
    let id = this.selectedPaymentMethod.split('/');
    return id.pop();
  }

  moveDonationsToNewPaymentMethod(){
    forEach(this.resolve.paymentMethod._recurringgifts[0].donations, (donation) => {
      forEach(donation['donation-lines'], (item) => {
        item['updated-payment-method-id'] = this.getNewPaymentMethodId();
      });
    });
    this.updateRecurringGifts(this.resolve.paymentMethod._recurringgifts[0]);
  }

  stopRecurringGifts(){
    forEach(this.resolve.paymentMethod._recurringgifts[0].donations, (donation) => {
      forEach(donation['donation-lines'],(item) => {
        item['updated-donation-line-status'] = 'Cancelled';
      });
    });
    this.updateRecurringGifts(this.resolve.paymentMethod._recurringgifts[0]);
  }

  updateRecurringGifts(recurringGifts){
    this.profileService.updateRecurringGifts(recurringGifts)
      .subscribe(() => {
        this.deletePaymentMethod();
      },(error) => {
        this.loading = false;
        this.submissionError.error = error.data;
        this.$log.error(error.data,error);
      });
  }

  savePaymentMethod(success, data){
    if(data) {
      this.submissionError.error = '';
      this.loading = true;
      this.profileService.addPaymentMethod(data)
        .finally(() => {
          this.submitted = false;
          this.loading = false;
        })
        .subscribe((data) => {
          data.address = formatAddressForTemplate(data.address);
          this.filteredPaymentMethods.push(data);
          data._recurringgifts = {};
          this.filteredPaymentMethods.push(data);
          this.selectedPaymentMethod = data.self.uri;
          this.deleteOption = '1';
          this.changeView();
        },
        (error) => {
          this.submissionError.error = error.data;
          this.$log.error(error.data,error);
        });
    } else if(!success) {
      this.submissionError.loading = false;
      this.loading = false;
    }
  }

  deletePaymentMethod(){
    this.profileService.deletePaymentMethod(this.resolve.paymentMethod.self.uri)
      .subscribe(() => {
        this.loading = false;
        this.deleteOption == '3' || !this.hasRecurrinGifts ? this.removePaymentMethodFromList() : this.moveDonations();
        this.close();
      },(error) => {
        this.loading = false;
        this.submissionError.error = error.data;
        this.$log.error(error.data,error);
        this.setView();
      });
  }

  onSubmit(){
    this.loading = true;
    switch(this.deleteOption) {
      case '1':
        this.moveDonationsToNewPaymentMethod();
      return;
      case '3':
        this.stopRecurringGifts();
      return;
      default:
        this.deletePaymentMethod();
      return;
    }
  }

}

export default angular
  .module(componentName, [
    template.name,
    paymentMethodForm.name,
    profileService.name,
    paymentMethodDisplay.name
  ])
  .component(componentName, {
    controller: deletePaymentMethodModalController,
    templateUrl: template.name,
    bindings: {
      resolve: '<',
      dismiss: '&',
      close: '&'
    }
  });
