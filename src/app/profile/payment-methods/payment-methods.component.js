import angular from 'angular';
import template from './payment-methods.tpl';
import paymentMethod from './payment-method/payment-method.component';
import modalTemplate from './payment-method/forms/add-payment-method/modal.tpl';
import modalController from './payment-method/forms/add-payment-method/modal';
import SessionModalWindowTemplate from 'common/services/session/sessionModalWindow.tpl';

class PaymentMethodsController{

  /* @ngInject */
  constructor($uibModal){
    this.$uibModal = $uibModal;
    this.paymentMethod = 'bankAccount';
    this.paymentMethods = [
      {
        address: {
          locality: 'Orlando FL',
          postal_code: '12043',
          street_address: '123 Test street drive'
        },
        card_number: '4444444444442222',
        cardholder_name: 'Denys Fedotov',
        description: 'My debit card',
        expiry_month: '07',
        expiry_year: '2019'
      },
      {
        address: {
          locality: 'Orlando FL',
          postal_code: '84043',
          street_address: '123 test street'
        },
        card_number: '5555444444443333',
        cardholder_name: 'Denys Fedotov',
        description: 'My credit card',
        expiry_month: '07',
        expiry_year: '2019'
      },
      {
        address: {
          locality: 'Orlando FL',
          postal_code: '84043',
          street_address: '123 test street'
        },
        card_number: '5555444444444354',
        cardholder_name: 'Denys Fedotov',
        description: 'My bank account',
        expiry_month: '07',
        expiry_year: '2099'
      }
    ];
  }

  addPaymentMethod(){
    this.$uibModal.open({
      templateUrl: modalTemplate.name,
      windowClass: 'account-management',
      controller: modalController.name,
      controllerAs: '$ctrl',
      windowTemplateUrl: SessionModalWindowTemplate.name
    });
  }
}

let componentName = 'paymentMethods';

export default angular
  .module(componentName, [
    template.name,
    paymentMethod.name,
    modalTemplate.name,
    modalController.name,
    SessionModalWindowTemplate.name
  ])
  .component(componentName, {
    controller: PaymentMethodsController,
    templateUrl: template.name
  });
