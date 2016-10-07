import angular from 'angular';
import template from './bank-account.tpl';
import displayAddressComponent from 'common/components/display-address/display-address.component';
import editPaymentMethodModal from 'common/components/paymentMethods/editPaymentMethod/editPaymentMethod.modal.component';
import deletePaymentMethodModal from 'common/components/paymentMethods/deletePaymentMethod/deletePaymentMethod.modal.component.js';
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl';
import recurringGiftsComponent from '../recurring-gifts/recurring-gifts.component';


class BankAccountController{

  /* @ngInject */
  constructor(envService, $uibModal){
    this.isCollapsed = true;
    this.$uibModal = $uibModal;
    this.imgDomain = envService.read('imgDomain');
    this.submissionError = {error: ''};
  }

  getExpiration(){
    return `${this.model['expiry-month']}/${this.model['expiry-year']}`;
  }

  editPaymentMethod() {
    this.editPaymentMethodModal = this.$uibModal.open({
      component: 'editPaymentMethodModal',
      windowTemplateUrl: giveModalWindowTemplate.name,
      size: 'lg',
      resolve: {
        model: () => this.model,
        paymentType: () => 'bankAccount',
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
  }

  $onDestroy(){
    this.deletePaymentMethodModal ? this.deletePaymentMethodModal.dismiss() : false;
    this.editPaymentMethodModal ? this.editPaymentMethodModal.dismiss() : false;
  }

}

let componentName = 'bankAccount';

export default angular
  .module(componentName, [
    template.name,
    displayAddressComponent.name,
    editPaymentMethodModal.name,
    deletePaymentMethodModal.name,
    recurringGiftsComponent.name
  ])
  .component(componentName, {
    controller: BankAccountController,
    templateUrl: template.name,
    bindings: {
      model: '<',
      paymentMethodsList: '<'
    }
  });
