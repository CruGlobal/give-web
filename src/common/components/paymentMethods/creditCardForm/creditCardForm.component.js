import angular from 'angular';
import 'angular-messages';
import get from 'lodash/get';
import range from 'lodash/range';
import assign from 'lodash/assign';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/combineLatest';

import displayAddressComponent from 'common/components/display-address/display-address.component';
import addressForm from 'common/components/addressForm/addressForm.component';

import showErrors from 'common/filters/showErrors.filter';
import {scrollModalToTop} from 'common/services/modalState.service';

import cruPayments from 'cru-payments/dist/cru-payments';
import tsys from 'common/services/api/tsys.service';

import template from './creditCardForm.tpl';

let componentName = 'creditCardForm';

class CreditCardController {

  /* @ngInject */
  constructor($scope, $log, envService, tsysService) {
    this.$scope = $scope;
    this.$log = $log;
    this.envService = envService;
    this.tsysService = tsysService;

    this.useMailingAddress = true;
    this.creditCardPayment = {
      address:{
        country: 'US'
      }
    };

    this.cardInfo = cruPayments.creditCard.card.info;
  }

  $onInit(){
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
        cardNumberPlaceholder: this.paymentMethod['last-four-digits'],
        cardholderName: this.paymentMethod['cardholder-name'],
        expiryMonth: this.paymentMethod['expiry-month'],
        expiryYear: parseInt(this.paymentMethod['expiry-year'])
      };
      this.useMailingAddress = false;
    } else {
      assign(this.creditCardPayment.address, this.mailingAddress);
    }
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
      this.creditCardPaymentForm.securityCode.$validators.minLength = cruPayments.creditCard.cvv.validate.minLength;
      this.creditCardPaymentForm.securityCode.$validators.maxLength = cruPayments.creditCard.cvv.validate.maxLength;
      this.creditCardPaymentForm.securityCode.$validators.cardTypeLength = number => cruPayments.creditCard.cvv.validate.cardTypeLength(number, cruPayments.creditCard.card.info.type(this.creditCardPayment.cardNumber));
      this.creditCardPaymentForm.cardNumber.$viewChangeListeners.push(() => {
        // Revalidate CVV when cardNumber changes
        this.creditCardPaymentForm.securityCode.$validate();
      });
    });
  }

  addCustomValidators() {
    const editAllowEmpty = (validator) => {
      return number => this.paymentMethod && !number || validator(number);
    };
    this.creditCardPaymentForm.cardNumber.$validators.minLength = editAllowEmpty(cruPayments.creditCard.card.validate.minLength);
    this.creditCardPaymentForm.cardNumber.$validators.maxLength = editAllowEmpty(cruPayments.creditCard.card.validate.maxLength);
    this.creditCardPaymentForm.cardNumber.$validators.knownType = editAllowEmpty(cruPayments.creditCard.card.validate.knownType);
    this.creditCardPaymentForm.cardNumber.$validators.typeLength = editAllowEmpty(cruPayments.creditCard.card.validate.typeLength);
    this.creditCardPaymentForm.cardNumber.$validators.checksum = editAllowEmpty(cruPayments.creditCard.card.validate.checksum);

    this.creditCardPaymentForm.expiryMonth.$validators.expired = expiryMonth => {
      // Valid if a year has not been chosen or date is valid
      return !this.creditCardPayment.expiryYear || cruPayments.creditCard.expiryDate.validate.month(expiryMonth, this.creditCardPayment.expiryYear);
    };

    this.creditCardPaymentForm.expiryYear.$validators.expired = cruPayments.creditCard.expiryDate.validate.year;
    this.creditCardPaymentForm.expiryYear.$viewChangeListeners.push(() => {
      this.creditCardPaymentForm.expiryMonth.$validate(); // Revalidate expiryMonth after expiryYear changes
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
      this.onPaymentFormStateChange({
        $event: {
          state: 'encrypting'
        }
      });
      const tokenObservable =  this.paymentMethod && !this.creditCardPayment.cardNumber ?
        Observable.of({ tsepToken: this.paymentMethod['last-four-digits'], maskedCardNumber: this.paymentMethod['last-four-digits'] }) : // Send masked card number when card number is not updated
        this.tsysService.getManifest()
          .mergeMap(data => {
            cruPayments.creditCard.init(this.envService.get(), data.deviceId, data.manifest);
            return cruPayments.creditCard.encrypt(this.creditCardPayment.cardNumber, this.creditCardPayment.securityCode, this.creditCardPayment.expiryMonth, this.creditCardPayment.expiryYear);
          });
      tokenObservable.subscribe(tokenObj => {
        this.onPaymentFormStateChange({
          $event: {
            state: 'loading',
            payload: {
              creditCard: {
                address: this.useMailingAddress ? undefined : this.creditCardPayment.address,
                'card-number': tokenObj.tsepToken,
                'card-type': this.cardInfo.type(this.creditCardPayment.cardNumber) || this.paymentMethod && this.paymentMethod['card-type'],
                'cardholder-name': this.creditCardPayment.cardholderName,
                'expiry-month': this.creditCardPayment.expiryMonth,
                'expiry-year': this.creditCardPayment.expiryYear,
                'last-four-digits': tokenObj.maskedCardNumber,
                transactionId: tokenObj.transactionID,
                cvv: tokenObj.cvv2
              }
            }
          }
        });
      }, error => {
        this.$log.error('Error tokenizing credit card', error);
        this.onPaymentFormStateChange({
          $event: {
            state: 'error',
            error: error
          }
        });
        scrollModalToTop();
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
    tsys.name
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
