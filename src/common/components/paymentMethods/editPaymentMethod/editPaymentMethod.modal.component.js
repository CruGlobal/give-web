import angular from 'angular';

import template from './editPaymentMethod.modal.tpl';

import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';

import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component.js';

let componentName = 'editPaymentMethodModal';

class editPaymentMethodModalController{

  /* @ngInject */
  constructor(){

  }

  getAccountNumber(){
    return this.resolve.paymentType == 'creditCard'
      ? this.resolve.model['card-number']
      : this.model['display-account-number']
  }

  getNickname(){
    return this.resolve.paymentType == 'creditCard'
      ? this.resolve.model['card-type']
      : this.model['bank-name'] + ' Account';
  }

  getIcon(){
    return this.resolve.paymentType == 'creditCard'
      ? this.resolve.model['card-type'].replace(' ','-').toLowerCase()
      : 'bank';
  }

  onSubmit(success, data){
    if(data) {
      this.resolve.onSubmit({success: success, data: data});
      this.submitted = false;
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    loadingOverlay.name,
    paymentMethodDisplay.name
  ])
  .component(componentName, {
    controller: editPaymentMethodModalController,
    templateUrl: template.name,
    bindings: {
      resolve: '<',
      dismiss: '&'
    }
  });
