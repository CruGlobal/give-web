import angular from 'angular';

import template from './editPaymentMethod.modal.tpl';

import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';

import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component.js';

import bankAccountForm from '../bankAccountForm/bankAccountForm.component';
import creditCardForm from '../creditCardForm/creditCardForm.component';

let componentName = 'editPaymentMethodModal';

class editPaymentMethodModalController{

  /* @ngInject */
  constructor(){

  }

  getAccountNumber(){
    return this.resolve.paymentType == 'creditCard'
      ? this.resolve.model['card-number']
      : this.resolve.model['display-account-number'];
  }

  getNickname(){
    return this.resolve.paymentType == 'creditCard'
      ? this.resolve.model['card-type']
      : this.resolve.model['bank-name'] + ' Account';
  }

  getIcon(){
    return this.resolve.paymentType == 'creditCard'
      ? this.resolve.model['card-type'].replace(' ','-').toLowerCase()
      : 'bank';
  }

  updatePaymentMethod(){}
}

export default angular
  .module(componentName, [
    template.name,
    loadingOverlay.name,
    paymentMethodDisplay.name,
    creditCardForm.name,
    bankAccountForm.name
  ])
  .component(componentName, {
    controller: editPaymentMethodModalController,
    templateUrl: template.name,
    bindings: {
      resolve: '<',
      dismiss: '&'
    }
  });
