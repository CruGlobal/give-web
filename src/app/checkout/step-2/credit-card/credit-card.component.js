import angular from 'angular';
import 'angular-messages';
import showErrors from 'common/filters/showErrors.filter';
import paymentValidationService from 'common/services/paymentValidation.service';
import orderService from 'common/services/api/order.service';

import template from './credit-card.tpl';

let componentName = 'checkoutCreditCard';

class CreditCardController {

  /* @ngInject */
  constructor($scope, $log, paymentValidationService, orderService) {
    this.$scope = $scope;
    this.$log = $log;
    this.paymentValidationService = paymentValidationService;
    this.orderService = orderService;

    this.creditCardPayment = {};

    this.waitForFormInitialization();
  }

  $onChanges(changes) {
    if (changes.submitted.currentValue === true) {
      this.savePayment();
    }
  }

  waitForFormInitialization() {
    let unregister = this.$scope.$watch('$ctrl.creditCardPaymentForm', () => {
      unregister();
      this.addCustomValidators();
    });
  }

  addCustomValidators() {
    this.creditCardPaymentForm.cardNumber.$parsers.push(this.paymentValidationService.stripNonDigits);
    //this.creditCardPaymentForm.cardNumber.$validators.cardType = null; TODO: implement this
    this.creditCardPaymentForm.cardNumber.$validators.cardNumber = this.paymentValidationService.validateCardNumber();

    this.creditCardPaymentForm.expiryMonth.$parsers.push(this.paymentValidationService.stripNonDigits);

    this.creditCardPaymentForm.expiryYear.$parsers.push(this.paymentValidationService.stripNonDigits);

    this.creditCardPaymentForm.securityCode.$parsers.push(this.paymentValidationService.stripNonDigits);

  }

  savePayment(){
    this.creditCardPaymentForm.$setSubmitted();
    if(this.creditCardPaymentForm.$valid){
      let ccpCreditCardNumber = new (this.paymentValidationService.ccp.CardNumber)(this.creditCardPayment.cardNumber);
      let ccpSecurityCode = new (this.paymentValidationService.ccp.CardSecurityCode)(this.creditCardPayment.securityCode);
      this.orderService.addCreditCardPayment({
          'card-number': ccpCreditCardNumber.encrypt(),
          'card-type': ccpCreditCardNumber.getType(),//TODO: do we need to save this?
          'cardholder-name': this.creditCardPayment.cardholderName,
          'expiry-month': this.creditCardPayment.expiryMonth,
          'expiry-year': this.creditCardPayment.expiryYear
        })
        .subscribe((data) => {
            this.$log.info('added credit card', data);
            ccpSecurityCode.encrypt(); //TODO: save this in session storage and submit it on confirmation of order
            this.onSave({success: true});
          },
          (error) => {
            this.$log.error('Error saving credit card info', error);
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
    controller: CreditCardController,
    templateUrl: template.name,
    bindings: {
      submitted: '<',
      onSave: '&'
    }
  });
