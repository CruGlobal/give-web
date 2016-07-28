import angular from 'angular';
import _ from 'lodash';
import ccp from 'common/lib/ccp';
import { ccpKey } from 'common/app.constants';
import isEmpty from 'lodash/isEmpty';

let serviceName = 'paymentEncryptionService';

class PaymentEncryption {

  /*@ngInject*/
  constructor(){
    ccp.initialize(ccpKey);
  }

  validateRoutingNumber(){
    return (routingNumber) => {
      if(isEmpty(routingNumber.toString())) return true; // Let other validators handle empty condition

      routingNumber = this.stripNonNumbers(routingNumber);
      if (routingNumber.length !== 9) {
        return false;
      }
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
      if(isEmpty(cardNumber.toString())) return true; // Let other validators handle empty condition

      return ccp.validateCardNumber(cardNumber) === null;
    };
  }

  validateCardSecurityCode(){
    return (securityCode) => {
      if(isEmpty(securityCode.toString())) return true; // Let other validators handle empty condition

      return ccp.validateCardSecurityCode(securityCode) === null;
    };
  }

  getCardType(cardNumber){
    return ccp.getCardType(cardNumber);
  }

  encrypt(number){
    return ccp.encrypt(number);
  }

  stripNonNumbers(number){
    if(number === undefined || number === null){
      number  = '';
    }
    number = number.toString();
    return number.replace(/\D/g, '');
  }

}

export default angular
  .module(serviceName, [

  ])
  .service(serviceName, PaymentEncryption);
