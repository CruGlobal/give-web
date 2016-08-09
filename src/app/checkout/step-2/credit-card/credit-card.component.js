import angular from 'angular';
import validation from 'common/directives/validation.directive';
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
    validation.name,
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
