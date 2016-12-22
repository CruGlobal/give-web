import angular from 'angular';
import 'rxjs/add/operator/finally';

import forEach from 'lodash/forEach';
import remove from 'lodash/remove';
import reject from 'lodash/reject';
import concat from 'lodash/concat';

import profileService from 'common/services/api/profile.service.js';
import donationsService from 'common/services/api/donations.service.js';
import paymentMethodForm from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.component';
import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';
import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftSummaryView from 'common/components/giftViews/giftSummaryView/giftSummaryView.component';

import formatAddressForTemplate from 'common/services/addressHelpers/formatAddressForTemplate';
import {scrollModalToTop} from 'common/services/modalState.service';

import template from './deletePaymentMethod.modal.tpl';

let componentName = 'deletePaymentMethodModal';

class deletePaymentMethodModalController {

  /* @ngInject */
  constructor(profileService, donationsService, $log) {
    this.profileService = profileService;
    this.donationsService = donationsService;
    this.$log = $log;

    this.loading = false;
    this.view = '';
    this.filteredPaymentMethods = [];
    this.confirmText = '';
    this.submitted = false;
    this.deleteOption = 0;
    this.submissionError = {
      error: ''
    };
    this.scrollModalToTop = scrollModalToTop;
  }

  $onInit() {
    this.setView();
    this.getPaymentMethods();
  }

  setView(){
    this.hasRecurringGifts = this.resolve.paymentMethod.recurringGifts.length !== 0;
    this.view = this.hasRecurringGifts ? 'manageDonations' : 'confirm';
  }

  getPaymentMethods(){
    if(this.resolve.paymentMethodsList && this.hasRecurringGifts){
      // filtered payment methods for the drop down. List excludes payment method that is being deleted
      this.filteredPaymentMethods = reject(this.resolve.paymentMethodsList, item => {
        return item.self.uri === this.resolve.paymentMethod.self.uri;
      });
      this.deleteOption = this.filteredPaymentMethods.length ? '1' : '2';
      this.selectedPaymentMethod = this.filteredPaymentMethods.length ? this.filteredPaymentMethods[0] : false; // set first element as selected by default
    }
  }

  changeView(goBack){
    this.submissionError.error = '';
    if(goBack) {
      this.setView();
      return;
    }
    switch(this.deleteOption) {
      case '1': //move to an existing paymentMethod
        this.view = 'confirm';
        this.confirmText = 'withTransfer';
        break;
      case '2': //move to a new paymentMethod
        this.view = 'addPaymentMethod';
        break;
      case '3': //confirm to delete
        this.view = 'confirm';
        this.confirmText = 'withOutTransfer';
        break;
    }
    this.scrollModalToTop();
  }

  getPaymentMethodOptionLabel(paymentMethod){
    return (paymentMethod['bank-name'] || paymentMethod['card-type']) + ' ending in ****' + (paymentMethod['display-account-number'] || paymentMethod['card-number']);
  }

  getNewPaymentMethodId(){
    let id = this.selectedPaymentMethod.self.uri.split('/');
    return id.pop();
  }

  moveDonationsToNewPaymentMethod(){
    forEach(this.resolve.paymentMethod.recurringGifts, gift => {
      gift.paymentMethodId = this.getNewPaymentMethodId();
    });
    this.updateRecurringGifts(this.resolve.paymentMethod.recurringGifts);
  }

  stopRecurringGifts(){
    forEach(this.resolve.paymentMethod.recurringGifts, gift => {
      gift.donationLineStatus = 'Cancelled';
    });
    this.updateRecurringGifts(this.resolve.paymentMethod.recurringGifts);
  }

  updateRecurringGifts(recurringGifts){
    this.donationsService.updateRecurringGifts(recurringGifts)
      .subscribe(() => {
        this.deletePaymentMethod();
      }, error => {
        this.loading = false;
        this.submissionError.error = error && error.data;
        this.$log.error('Error updating recurring gifts before deleting old payment method', error);
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
          this.submissionError.loading = false;
        })
        .subscribe(data => {
            data.address = data.address && formatAddressForTemplate(data.address);
            data.recurringGifts = [];
            this.selectedPaymentMethod = data;
            this.filteredPaymentMethods.push(this.selectedPaymentMethod);
            this.resolve.paymentMethodsList.push(this.selectedPaymentMethod);
            this.deleteOption = '1';
            this.changeView();
          },
          error => {
            this.submissionError.error = error && error.data;
            this.$log.error('Error saving new payment method in delete payment method modal', error);
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
        this.deleteOption !== '3' && this.hasRecurringGifts && this.moveDonationsLocally();
        this.removePaymentMethodFromList();
        this.close();
      },(error) => {
        this.loading = false;
        this.submissionError.error = error && error.data;
        this.$log.error('Error deleting payment method', error);
        this.setView();
      });
  }

  moveDonationsLocally(){
    this.selectedPaymentMethod.recurringGifts = concat(this.selectedPaymentMethod.recurringGifts, this.resolve.paymentMethod.recurringGifts);
  }

  removePaymentMethodFromList() {
    remove(this.resolve.paymentMethodsList, gift => {
      return gift.self.uri == this.resolve.paymentMethod.self.uri;
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
    paymentMethodDisplay.name,
    giftListItem.name,
    giftSummaryView.name,
    profileService.name,
    donationsService.name
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
