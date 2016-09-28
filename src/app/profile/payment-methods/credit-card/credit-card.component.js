import angular from 'angular';
import template from './credit-card.tpl';
import displayAddressComponent from 'common/components/display-address/display-address.component';
import recurringGiftsComponent from '../recurring-gifts/recurring-gifts.component';
import recurringGiftsData from '../recurring-gifts-data.js';
import formatAddressForTemplate from 'common/services/addressHelpers/formatAddressForTemplate';
import editPaymentMethodModal from 'common/components/paymentMethods/editPaymentMethod/editPaymentMethod.modal.component';
import editPaymentMethod from 'common/components/paymentMethods/editPaymentMethod/editPaymentMethod.component';

class CreditCardController{

  /* @ngInject */
  constructor(envService,$uibModal){
    this.isCollapsed = true;
    this.$uibModal = $uibModal;
    this.imgDomain = envService.read('imgDomain');
  }

  $onInit(){
    let address = this.model.creditcard.address;
    this.formattedAddress = address ? formatAddressForTemplate(address) : false;
    this.gifts = recurringGiftsData.donations; // dummy data. in the future an api call will be performed here
  }

  getExpiration(){
    return `${this.model['expiry-month']}/${this.model['expiry-year']}`;
  }

  getImage(){
    return this.model['card-type'].replace(' ','-').toLowerCase();
  }

  editPaymentMethod() {
    this.editPaymentMethodModal = this.$uibModal.open({
      component: 'editPaymentMethodModal',
      size: 'large new-payment-method-modal',
      backdrop: 'static', // Disables closing on click
      resolve: {
        model: () => this.model,
        paymentType: () => 'creditCard',
        onSubmit: () => this.onSubmit,
        submissionError: () => {error: ''}
      }
    });
  }

  onSubmit(e) {
    if(e.data) {
      this.orderService.addPaymentMethod(e.data)
        .subscribe(
          () => {
            console.log('success');
          },
          (error) => {
            this.$log.error('Error adding payment method', error);
            this.submissionError.error = error.data;
          });
    }
  }

}

let componentName = 'creditCard';

export default angular
  .module(componentName, [
    template.name,
    displayAddressComponent.name,
    recurringGiftsComponent.name,
    editPaymentMethodModal.name,
    editPaymentMethod.name
  ])
  .component(componentName, {
    controller: CreditCardController,
    templateUrl: template.name,
    bindings: {
      model: '<'
    }
  });
