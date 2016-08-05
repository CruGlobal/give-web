import angular from 'angular';
import _ from 'lodash';
import ccp from 'common/lib/ccp';
import { ccpKey } from 'common/app.constants';
import isEmpty from 'lodash/isEmpty';
import toString from 'lodash/toString';

let serviceName = 'paymentValidationService';

class PaymentValidation {

  /*@ngInject*/
  constructor(){
    ccp.initialize(ccpKey);
    this.ccp = ccp;
  }

  validateRoutingNumber(){
    return (routingNumber) => {
      routingNumber = toString(routingNumber);
      if(isEmpty(routingNumber)) return true; // Let other validators handle empty condition
      if(routingNumber.length !== 9) return true; // Let other validators handle incorrect length condition

      let digits = routingNumber.split('');
      let multipliers = [3, 7, 1, 3, 7, 1, 3, 7, 1];

      let sum = _(_.zip(digits, multipliers))
        .map((array) => {
          return array[0] * array[1];
        })
        .sum();
      return sum % 10 === 0;
    };
  }

  validateCardNumber(){
    return (cardNumber) => {
      cardNumber = toString(cardNumber);
      if(isEmpty(cardNumber)) return true; // Let other validators handle empty condition

      return (new this.ccp.CardNumber(cardNumber)).validate() === null;
    };
  }

  validateCardSecurityCode(){
    return (securityCode) => {
      securityCode = toString(securityCode);
      if(isEmpty(securityCode)) return true; // Let other validators handle empty condition

      return (new this.ccp.CardSecurityCode(securityCode)).validate() === null;
    };
  }

  stripNonDigits(number){
    return number.replace(/\D/g, '');
  }

}

export default angular
  .module(serviceName, [

  ])
  .service(serviceName, PaymentValidation);
