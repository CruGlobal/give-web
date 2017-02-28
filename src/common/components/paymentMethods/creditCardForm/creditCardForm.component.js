import angular from 'angular';
import 'angular-messages';
import toString from 'lodash/toString';
import get from 'lodash/get';
import range from 'lodash/range';
import assign from 'lodash/assign';
import 'rxjs/add/operator/combineLatest';

import displayAddressComponent from 'common/components/display-address/display-address.component';
import addressForm from 'common/components/addressForm/addressForm.component';

import showErrors from 'common/filters/showErrors.filter';

import paymentValidationService from 'common/services/paymentHelpers/paymentValidation.service';
import ccpService from 'common/services/paymentHelpers/ccp.service';

import template from './creditCardForm.tpl';

let componentName = 'creditCardForm';

class CreditCardController {

  /* @ngInject */
  constructor($scope, $log, paymentValidationService, ccpService) {
    this.$scope = $scope;
    this.$log = $log;
    this.paymentValidationService = paymentValidationService;
    this.ccpService = ccpService;

    this.useMailingAddress = true;
    this.creditCardPayment = {
      address:{
        country: 'US'
      }
    };
  }

  $onInit(){
    this.loadCcp();
    this.initExistingPaymentMethod();
    this.waitForFormInitialization();
    this.initializeExpirationDateOptions();
  }

  $onChanges(changes) {
    if(get(changes, 'paymentFormState.currentValue') === 'submitted'){
      this.savePayment();
    }
  }

  initExistingPaymentMethod(){
    if(this.paymentMethod){
      this.creditCardPayment = {
        address: this.paymentMethod.address,
        cardNumberPlaceholder: this.paymentMethod['card-number'],
        cardholderName: this.paymentMethod['cardholder-name'],
        expiryMonth: this.paymentMethod['expiry-month'],
        expiryYear: parseInt(this.paymentMethod['expiry-year'])
      };
      this.useMailingAddress = false;
    } else {
      assign(this.creditCardPayment.address, this.mailingAddress);
    }
  }

  loadCcp(){
    this.ccpService.get()
      .subscribe((ccp) => {
        this.ccp = ccp;
      });
  }

  waitForFormInitialization() {
    let unregister = this.$scope.$watch('$ctrl.creditCardPaymentForm', () => {
      unregister();
      this.addCustomValidators();
    });
  }

  waitForSecurityCodeInitialization() {
    let unregister = this.$scope.$watch('$ctrl.creditCardPaymentForm.securityCode', () => {
      unregister();
      this.creditCardPaymentForm.securityCode.$parsers.push(this.paymentValidationService.stripNonDigits);
      this.creditCardPaymentForm.securityCode.$validators.minlength = number => toString(number).length >= 3;
      this.creditCardPaymentForm.securityCode.$validators.maxlength = number => toString(number).length <= 4;
      this.creditCardPaymentForm.securityCode.$validators.cardTypeLength = number => {
        try {
          const cardType = new (this.paymentValidationService.ccp.CardNumber)(this.creditCardPayment.cardNumber).getType();
          return cardType !== 'AMERICAN_EXPRESS' || toString(number).length === 4;
        } catch(e){
          return true;
        }
      };
      this.creditCardPaymentForm.cardNumber.$viewChangeListeners.push(() => {
        // Revalidate CVV when cardNumber changes
        this.creditCardPaymentForm.securityCode.$validate();
      });
    });
  }

  addCustomValidators() {
    this.creditCardPaymentForm.cardNumber.$parsers.push(this.paymentValidationService.stripNonDigits);
    this.creditCardPaymentForm.cardNumber.$validators.minlength = number => this.paymentMethod && !number || toString(number).length >= 13;
    this.creditCardPaymentForm.cardNumber.$validators.maxlength = number => toString(number).length <= 16;
    this.creditCardPaymentForm.cardNumber.$validators.cardNumber = number => this.paymentMethod && !number || this.paymentValidationService.validateCardNumber()(number);

    this.creditCardPaymentForm.expiryMonth.$validators.expired = expiryMonth => {
      let currentDate = new Date();
      let chosenYear = parseInt(this.creditCardPayment.expiryYear);
      let chosenMonth = parseInt(expiryMonth);
      return !this.creditCardPayment.expiryYear ||
        chosenYear > currentDate.getFullYear() ||
        chosenYear === currentDate.getFullYear() && chosenMonth >= currentDate.getMonth() + 1;
    };
    this.creditCardPaymentForm.expiryYear.$viewChangeListeners.push(() => {
      // Revalidate expiryMonth after expiryYear changes
      this.creditCardPaymentForm.expiryMonth.$validate();
    });

    if(!this.paymentMethod) {
      this.waitForSecurityCodeInitialization();
    }

  }

  initializeExpirationDateOptions(){
    let currentYear = (new Date()).getFullYear();
    this.expirationDateYears = range(currentYear, currentYear + 20);
  }

  savePayment(){
    this.creditCardPaymentForm.$setSubmitted();
    if(this.creditCardPaymentForm.$valid){
      let ccpCreditCardNumber = this.paymentMethod && !this.creditCardPayment.cardNumber ? this.paymentMethod['card-number'] : new (this.paymentValidationService.ccp.CardNumber)(this.creditCardPayment.cardNumber).encrypt();
      let ccpSecurityCode = this.paymentMethod ? null : new (this.paymentValidationService.ccp.CardSecurityCode)(this.creditCardPayment.securityCode).encrypt();
      this.onPaymentFormStateChange({
        $event: {
          state: 'loading',
          payload: {
            creditCard: {
              address: this.useMailingAddress ? undefined : this.creditCardPayment.address,
              'card-number': ccpCreditCardNumber,
              'cardholder-name': this.creditCardPayment.cardholderName,
              'expiry-month': this.creditCardPayment.expiryMonth,
              'expiry-year': this.creditCardPayment.expiryYear,
              ccv: ccpSecurityCode
            },
            paymentMethodNumber: this.creditCardPayment.cardNumber ? this.creditCardPayment.cardNumber.slice(-4) : false
          }
        }
      });
    }else{
      this.onPaymentFormStateChange({
        $event: {
          state: 'unsubmitted'
        }
      });
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    'ngMessages',
    displayAddressComponent.name,
    addressForm.name,
    showErrors.name,
    paymentValidationService.name,
    ccpService.name
  ])
  .component(componentName, {
    controller: CreditCardController,
    templateUrl: template.name,
    bindings: {
      paymentFormState: '<',
      paymentMethod: '<',
      disableCardNumber: '<',
      mailingAddress: '<',
      onPaymentFormStateChange: '&'
    }
  });
