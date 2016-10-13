import angular from 'angular';
import template from './payment-method.tpl';
import displayAddressComponent from 'common/components/display-address/display-address.component';
import recurringGiftsComponent from '../recurring-gifts/recurring-gifts.component';
import paymentMethodFormModal from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.modal.component';
import deletePaymentMethodModal from 'common/components/paymentMethods/deletePaymentMethod/deletePaymentMethod.modal.component.js';
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl';

class PaymentMethodController{

  /* @ngInject */
  constructor(envService,$uibModal){
    this.isCollapsed = true;
    this.$uibModal = $uibModal;
    this.imgDomain = envService.read('imgDomain');
    this.submissionError = {error: ''};
  }

  getExpiration(){
    return `${this.model['expiry-month']}/${this.model['expiry-year']}`;
  }

  isCard(){
    return this.model['card-number'] ? true : false;
  }

  editPaymentMethod() {
    this.editPaymentMethodModal = this.$uibModal.open({
      component: 'paymentMethodFormModal',
      windowTemplateUrl: giveModalWindowTemplate.name,
      resolve: {
        paymentMethod: () => this.model,
        mailingAddress: () => {}, // TODO: load this from donor details
        onSubmit: () => this.onSubmit,
        submissionError: () => this.submissionError
      }
    });
  }

  deletePaymentMethod(){
    this.deletePaymentMethodModal = this.$uibModal.open({
      component: 'deletePaymentMethodModal',
      backdrop: 'static',
      windowTemplateUrl: giveModalWindowTemplate.name,
      resolve: {
        paymentMethod: () => this.model,
        paymentMethodsList: () => this.paymentMethodsList
      }
    });
    this.deletePaymentMethodModal.result.then(() => {
      this.onDelete();
    });
  }

  $onDestroy(){
    if(this.deletePaymentMethodModal) {
      this.deletePaymentMethodModal.dismiss();
    }
    if(this.editPaymentMethodModal){
      this.editPaymentMethodModal.dismiss();
    }
  }

}

let componentName = 'paymentMethod';

export default angular
  .module(componentName, [
    template.name,
    displayAddressComponent.name,
    recurringGiftsComponent.name,
    paymentMethodFormModal.name,
    deletePaymentMethodModal.name,
    giveModalWindowTemplate.name
  ])
  .component(componentName, {
    controller: PaymentMethodController,
    templateUrl: template.name,
    bindings: {
      model: '<',
      paymentMethodsList: '<',
      onDelete: '&'
    }
  });
