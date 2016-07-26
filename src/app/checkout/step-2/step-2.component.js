import angular from 'angular';
import paymentEncryptionService from 'common/services/paymentEncryption.service';
import orderService from 'common/services/api/order.service';

import bankAccount from './bank-account/bank-account.component';
import creditCard from './credit-card/credit-card.component';

import template from './step-2.tpl';

let componentName = 'checkoutStep2';

class Step2Controller{

  /* @ngInject */
  constructor(paymentEncryptionService, orderService, apiService, hateoasHelperService, $log){
    this.paymentEncryption = paymentEncryptionService;
    this.orderService = orderService;
    this.apiService = apiService;
    this.hateoasHelperService = hateoasHelperService;
    this.$log = $log;

    this.paymentType = 'bankAccount';

    this.savePayment();
  }

  savePayment(){
    this.orderService.addBankAccountPayment({
        'account-type': 'checking',
        'bank-name': 'some bank',
        'display-account-number': 'xxxxxx-1234',
        'encrypted-account-number': '123456789012',
        'routing-number': 123456789
      })
      .subscribe((data) => {
        this.$log.info('added bank account', data);
      });
  }
}

export default angular
  .module(componentName, [
    template.name,
    bankAccount.name,
    creditCard.name,
    paymentEncryptionService.name,
    orderService.name
  ])
  .component(componentName, {
    controller: Step2Controller,
    templateUrl: template.name
  });
