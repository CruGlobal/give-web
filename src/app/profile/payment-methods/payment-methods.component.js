import angular from 'angular';
import template from './payment-methods.tpl';
import creditCardComponent from './credit-card/credit-card.component';
import bankAccountComponent from './bank-account/bank-account.component';
import recurringGiftsComponent from './recurring-gifts/recurring-gifts.component';
import modalTemplate from './forms/add-payment-method/modal.tpl';
import modalController from './forms/add-payment-method/modal';
import SessionModalWindowTemplate from 'common/services/session/sessionModalWindow.tpl';
import paymentMethodsData from './payment-methods-data.js';

class PaymentMethodsController {

  /* @ngInject */
  constructor($uibModal) {
    this.$uibModal = $uibModal;
    this.paymentMethod = 'bankAccount';
    this.paymentMethods = paymentMethodsData; //dummy data
  }

  addPaymentMethod() {
    this.$uibModal.open({
      templateUrl: modalTemplate.name,
      windowClass: 'account-management',
      controller: modalController.name,
      controllerAs: '$ctrl',
      windowTemplateUrl: SessionModalWindowTemplate.name
    });
  }

  isCard(paymentMethod) {
    return paymentMethod['card-number'] ? true : false;
  }
}

let componentName = 'paymentMethods';

export default angular
  .module(componentName, [
    template.name,
    creditCardComponent.name,
    bankAccountComponent.name,
    recurringGiftsComponent.name,
    modalTemplate.name,
    modalController.name,
    SessionModalWindowTemplate.name
  ])
  .component(componentName, {
    controller: PaymentMethodsController,
    templateUrl: template.name
  });
