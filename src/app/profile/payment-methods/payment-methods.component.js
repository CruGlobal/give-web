import angular from 'angular';
import template from './payment-methods.tpl';
import paymentMethod from './payment-method/payment-method.component';
import modalTemplate from './payment-method/forms/add-payment-method/modal.tpl';
import modalController from './payment-method/forms/add-payment-method/modal';
import SessionModalWindowTemplate from 'common/services/session/sessionModalWindow.tpl';

class PaymentMethodsController {

  /* @ngInject */
  constructor($uibModal) {
    this.$uibModal = $uibModal;
    this.paymentMethod = 'bankAccount';
    this.paymentMethods = JSON.parse('[{"self":{"type":"cru.creditcards.named-credit-card","uri":"/paymentmethods/crugive/giydcobvha=","href":"https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydcobvha="},"links":[{"rel":"list","type":"elasticpath.collections.links","uri":"/paymentmethods/crugive","href":"https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive"},{"rel":"creditcard","type":"cru.creditcards.named-credit-card","uri":"/creditcards/paymentmethods/crugive/giydcobvha=","href":"https://cortex-gateway-stage.cru.org/cortex/creditcards/paymentmethods/crugive/giydcobvha="}],"card-number":"1111","card-type":"Visa","cardholder-name":"Test Card","expiry-month":"11","expiry-year":"2019","$$hashKey":"object:25"},{"self":{"type":"elasticpath.bankaccounts.bank-account","uri":"/paymentmethods/crugive/giydcmzyge=","href":"https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydcmzyge="},"links":[{"rel":"list","type":"elasticpath.collections.links","uri":"/paymentmethods/crugive","href":"https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive"},{"rel":"bankaccount","type":"elasticpath.bankaccounts.bank-account","uri":"/bankaccounts/paymentmethods/crugive/giydcmzyge=","href":"https://cortex-gateway-stage.cru.org/cortex/bankaccounts/paymentmethods/crugive/giydcmzyge="}],"account-type":"Checking","bank-name":"Wells Fargo","display-account-number":"9191","encrypted-account-number":"0001AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG//4Bc22fr/WvoFWUj5s07DDnjgdz2ft2l2Q/bmWUhGnQjvIV3SQyqWUpjZ8h3CRJylJC6DKbwpvfADsz52evqFRxeon0c/T0JD/KVSdASg3bGLZ3RL4KOmlL3aO9oyg+hfjPB/fTkXArJP+KSxYidNsu0tBmZoOrKJqRDU0xjf4qSzZSWiSi35Raif8X1rOvgTPXYEC4dv8d/vTIzZtxTgBd7BQx","routing-number":"121042882","$$hashKey":"object:26"}]');
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
