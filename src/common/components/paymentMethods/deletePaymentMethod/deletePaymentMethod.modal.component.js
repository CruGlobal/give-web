import angular from 'angular';

import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component.js';
import profileService from 'common/services/api/profile.service.js';
import addNewPaymentMethod from 'common/components/paymentMethods/addNewPaymentMethod/addNewPaymentMethod.component';

import template from './deletePaymentMethod.modal.tpl';
import remove from 'lodash/remove';
import find from 'lodash/find';

let componentName = 'deletePaymentMethodModal';

class deletePaymentMethodModalController {

  /* @ngInject */
  constructor(profileService, $log) {
    this.profileService = profileService;
    this.$log = $log;
    this.loading = false;
    this.confirmText = '';
    this.form = {};
    this.submitted = false;
    this.submissionError = {
      error: ''
    };
  }

  $onInit() {
    console.log(this.resolve);
    this.setView();
    this.getPaymentMethods();
  }

  changeView(goBack){
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
  }

  setView(){
    this.paymentMethod = this.resolve.paymentMethod;
    this.recurringGifts = this.paymentMethod.recurringgifts.donations;
    this.view = this.recurringGifts.length ? 'manageDonations' : 'confirm';
  }

  getPaymentMethodName(newPaymentMethod){
    let paymentMethod = newPaymentMethod ? find(this.paymentMethods,(item)=>{
      return item.self.uri == this.form.newPaymentMethod;
    }) : this.paymentMethod;
    return paymentMethod['bank-name'] || paymentMethod['card-type'];
  }

  getPaymentMethodLastFourDigits(newPaymentMethod){
    let paymentMethod = newPaymentMethod ? find(this.paymentMethods,(item)=>{
      return item.self.uri == this.form.newPaymentMethod;
    }) : this.paymentMethod;
    return paymentMethod['display-account-number'] || paymentMethod['card-number'];
  }

  getPaymentMethodOptionLabel(paymentMethod){
    return (paymentMethod['bank-name'] || paymentMethod['card-type']) + ' endign in ****' + (paymentMethod['display-account-number'] || paymentMethod['card-number']);
  }

  getIcon(){
    return this.paymentMethod['card-number'] ? 'cc-'+this.paymentMethod['card-type'].toLowerCase() : 'bank';
  }

  getRecurrence(gift){
    var date = new Date(gift['next-draw-date']['display-value']),
        month = date.getMonth()*1,
        monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        text='';


    switch(gift.rate.recurrence.interval){
      case 'Quaterly':
        var months = [];

        for(let i=0;i<4;i++){
          months.push(month);
          month+=3;
          month = month > 11 ? month - 12 : month;
        }
        months.sort((a,b) => {
          return a-b;
        });
        text = `On the ${gift['recurring-day-of-month']}th day of each ${monthNames[months[0]]}, ${monthNames[months[1]]}, ${monthNames[months[2]]} and ${monthNames[months[3]]}`;
      break;
      case 'Monthly':
        text = `On the ${gift['recurring-day-of-month']}th day of each month`;
      break;
      case 'Annually':
        text = `On ${monthNames[month]} ${gift['recurring-day-of-month']}th of each year`;
      break;
    }

    return text;
  }

  getPaymentMethods(){
    if(this.resolve.paymentMethodsList){
      remove(this.resolve.paymentMethodsList,(item) => {
        return item.self.uri == this.paymentMethod.self.uri;
      });
      this.deleteOption = this.resolve.paymentMethodsList.length ? 1 : 2;
      this.form.newPaymentMethod = this.resolve.paymentMethodsList[0].self.uri; // set first element as selected by default
    }
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
          this.form.newPaymentMethod = data;
          this.deleteOption = '1';
          this.changeView();
        },
        (error) => {
          this.submissionError.error = error.data;
          this.$log.error(error.data,error)
        });
    } else if(!success) {
      this.loading = false;
    }
  }

  deletePaymentMethod(){
    console.log(this.resolve);
    this.loading = true;
    this.profileService.deletePaymentMethod(this.resolve.paymentMethod.self.uri)
      .subscribe(() => {
        this.loading = false;
        // this.pay
        this.close();
      });
  }
}

export default angular
  .module(componentName, [
    template.name,
    loadingOverlay.name,
    addNewPaymentMethod.name
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
