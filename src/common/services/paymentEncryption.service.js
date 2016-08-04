import angular from 'angular';
import _ from 'lodash';
import ccp from 'common/lib/ccp';
import { ccpKey } from 'common/app.constants';
import isEmpty from 'lodash/isEmpty';
import toString from 'lodash/toString';

let serviceName = 'paymentEncryptionService';

class PaymentEncryption {

  /*@ngInject*/
  constructor(){
    ccp.initialize(ccpKey);
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

      return ccp.validateCardNumber(cardNumber) === null;
    };
  }

  validateCardSecurityCode(){
    return (securityCode) => {
      securityCode = toString(securityCode);
      if(isEmpty(securityCode)) return true; // Let other validators handle empty condition

      return ccp.validateCardSecurityCode(securityCode) === null;
    };
  }

  validateNumbersOnly(){
    return (number) => {
      number = toString(number);
      if(isEmpty(number)) return true; // Let other validators handle empty condition

      return number.match(/^\d+$/) !== null;
    };
  }

  getCardType(cardNumber){
    return ccp.getCardType(cardNumber);
  }

  encrypt(number){
    return ccp.encrypt(number);
  }

}

export default angular
  .module(serviceName, [

  ])
  .service(serviceName, PaymentEncryption);
