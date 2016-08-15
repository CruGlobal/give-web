import angular from 'angular';
import 'angular-messages';
import toString from 'lodash/toString';
import showErrors from 'common/filters/showErrors.filter';
import paymentValidationService from 'common/services/paymentValidation.service';
import orderService from 'common/services/api/order.service';

import template from './bank-account.tpl';

let componentName = 'checkoutBankAccount';

class BankAccountController{

  /* @ngInject */
  constructor($scope, $log, paymentValidationService, orderService){
    this.$scope = $scope;
    this.$log = $log;
    this.paymentValidationService = paymentValidationService;
    this.orderService = orderService;

    this.bankPayment = {
      accountType: null //TODO: should this be selected by default?
    };

    this.waitForFormInitialization();
  }

  $onChanges(changes){
    if(changes.submitted.currentValue === true){
      this.savePayment();
    }
  }

  waitForFormInitialization(){
    let unregister = this.$scope.$watch('$ctrl.bankPaymentForm', () => {
      unregister();
      this.addCustomValidators();
    });
  }

  addCustomValidators(){
    this.bankPaymentForm.routingNumber.$parsers.push(this.paymentValidationService.stripNonDigits);
    this.bankPaymentForm.routingNumber.$validators.length = number => toString(number).length === 9;
    this.bankPaymentForm.routingNumber.$validators.routingNumber = this.paymentValidationService.validateRoutingNumber();

    this.bankPaymentForm.accountNumber.$parsers.push(this.paymentValidationService.stripNonDigits);
    this.bankPaymentForm.accountNumber.$validators.minlength = number => toString(number).length >= 2;
    this.bankPaymentForm.accountNumber.$validators.maxlength = number => toString(number).length <= 17;
    this.bankPaymentForm.accountNumber.$viewChangeListeners.push(() => {
      // Revalidate verifyAccountNumber after accountNumber changes
      this.bankPaymentForm.verifyAccountNumber.$validate();
    });

    this.bankPaymentForm.verifyAccountNumber.$parsers.push(this.paymentValidationService.stripNonDigits);
    this.bankPaymentForm.verifyAccountNumber.$validators.verifyAccountNumber = (verifyAccountNumber) => {
      return this.bankPayment.accountNumber === verifyAccountNumber;
    };

  }

  savePayment(){
    this.bankPaymentForm.$setSubmitted();
    if(this.bankPaymentForm.$valid){
      let ccpAccountNumber = new (this.paymentValidationService.ccp.BankAccountNumber)(this.bankPayment.accountNumber);
      this.orderService.addBankAccountPayment({
          'account-type': this.bankPayment.accountType,
          'bank-name': this.bankPayment.bankName,
          'display-account-number': ccpAccountNumber.mask(),
          'encrypted-account-number': ccpAccountNumber.encrypt(),
          'routing-number': this.bankPayment.routingNumber
        })
        .subscribe((data) => {
            this.$log.info('added bank account', data);
            this.onSave({success: true});
          },
          (error) => {
            this.$log.error('Error saving bank payment info', error);
            this.onSave({success: false});
          });
    }else{
      this.onSave({success: false});
    }
  }

}

export default angular
  .module(componentName, [
    template.name,
    'ngMessages',
    showErrors.name,
    paymentValidationService.name,
    orderService.name
  ])
  .component(componentName, {
    controller: BankAccountController,
    templateUrl: template.name,
    bindings: {
      submitted: '<',
      onSave: '&'
    }
  });
