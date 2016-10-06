import angular from 'angular';
import template from './credit-card.tpl';
import displayAddressComponent from 'common/components/display-address/display-address.component';
import recurringGiftsComponent from '../recurring-gifts/recurring-gifts.component';
import formatAddressForTemplate from 'common/services/addressHelpers/formatAddressForTemplate';
import editPaymentMethodModal from 'common/components/paymentMethods/editPaymentMethod/editPaymentMethod.modal.component';
import deletePaymentMethodModal from 'common/components/paymentMethods/deletePaymentMethod/deletePaymentMethod.modal.component.js';
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl';

class CreditCardController{

  /* @ngInject */
  constructor(envService,$uibModal){
    this.isCollapsed = true;
    this.$uibModal = $uibModal;
    this.imgDomain = envService.read('imgDomain');
    this.submissionError = {error: ''};
  }

  $onInit(){
    let address = this.model.creditcard ? this.model.creditcard.address : false;
    this.formattedAddress = address ? formatAddressForTemplate(address) : false;
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
      windowTemplateUrl: giveModalWindowTemplate.name,
      size: 'lg',
      resolve: {
        model: this.model,
        paymentType: 'creditCard',
        onSubmit: () => this.onSubmit,
        submissionError: this.submissionError
      }
    });
  }

  deletePaymentMethod(){
    this.deletePaymentMethodModal = this.$uibModal.open({
      component: 'deletePaymentMethodModal',
      backdrop: 'static',
      windowTemplateUrl: giveModalWindowTemplate.name,
      resolve: {
        paymentMethod: this.model,
        paymentMethodsList: this.paymentMethodsList
      }
    });
  }

  $onDestroy(){
    this.deletePaymentMethodModal ? this.deletePaymentMethodModal.dismiss() : false;
    this.editPaymentMethodModal ? this.editPaymentMethodModal.dismiss() : false;
  }

}

let componentName = 'creditCard';

export default angular
  .module(componentName, [
    template.name,
    displayAddressComponent.name,
    recurringGiftsComponent.name,
    editPaymentMethodModal.name,
    deletePaymentMethodModal.name,
    giveModalWindowTemplate.name
  ])
  .component(componentName, {
    controller: CreditCardController,
    templateUrl: template.name,
    bindings: {
      model: '<',
      paymentMethodsList: '<'
    }
  });
