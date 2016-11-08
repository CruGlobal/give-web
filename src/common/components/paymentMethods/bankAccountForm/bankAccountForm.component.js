import angular from 'angular';
import 'angular-environment';
import 'angular-messages';
import toString from 'lodash/toString';

import showErrors from 'common/filters/showErrors.filter';

import paymentValidationService from 'common/services/paymentHelpers/paymentValidation.service';
import ccpService from 'common/services/paymentHelpers/ccp.service';

import template from './bankAccountForm.tpl';

let componentName = 'bankAccountForm';

class BankAccountController{

  /* @ngInject */
  constructor($scope, $log, envService, paymentValidationService, ccpService){
    this.$scope = $scope;
    this.$log = $log;
    this.paymentValidationService = paymentValidationService;
    this.ccpService = ccpService;

    this.imgDomain = envService.read('imgDomain');
    this.bankPayment = {
      accountType: 'Checking'
    };

  }

  $onInit(){
    this.loadCcp();
    this.initExistingPaymentMethod();
    this.waitForFormInitialization();
  }

  $onChanges(changes){
    if(changes.submitted && changes.submitted.currentValue === true){
      this.savePayment();
    }
  }

  initExistingPaymentMethod(){
    if(this.paymentMethod){
      this.bankPayment = {
        accountType: this.paymentMethod['account-type'],
        bankName: this.paymentMethod['bank-name'],
        accountNumberPlaceholder: this.paymentMethod['display-account-number'],
        routingNumber: this.paymentMethod['routing-number']
      };
    }
  }

  loadCcp(){
    this.ccpService.get()
      .subscribe((ccp) => {
        this.ccp = ccp;
      });
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
    this.bankPaymentForm.accountNumber.$validators.minlength = number => this.paymentMethod && !number || toString(number).length >= 2;
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
      let ccpAccountNumber = this.paymentMethod && !this.bankPayment.accountNumber ? '' : new (this.ccp.BankAccountNumber)(this.bankPayment.accountNumber).encrypt();
      this.onSubmit({
        success: true,
        data: {
          bankAccount: {
            'account-type': this.bankPayment.accountType,
            'bank-name': this.bankPayment.bankName,
            'encrypted-account-number': ccpAccountNumber,
            'routing-number': this.bankPayment.routingNumber
          },
          paymentMethodNumber: this.bankPayment.accountNumber ? this.bankPayment.accountNumber.slice(-4) : false
        }
      });
    }else{
      this.onSubmit({success: false});
    }
  }

}

export default angular
  .module(componentName, [
    template.name,
    'environment',
    'ngMessages',
    showErrors.name,
    paymentValidationService.name,
    ccpService.name
  ])
  .component(componentName, {
    controller: BankAccountController,
    templateUrl: template.name,
    bindings: {
      submitted: '<',
      paymentMethod: '<',
      onSubmit: '&'
    }
  });
