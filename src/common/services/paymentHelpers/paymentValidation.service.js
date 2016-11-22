import angular from 'angular';
import flow from 'lodash/fp/flow';
import zip from 'lodash/fp/zip';
import map from 'lodash/fp/map';
import sum from 'lodash/fp/sum';
import appConfig from 'common/app.config';
import toString from 'lodash/toString';
import capitalize from 'lodash/capitalize';

import ccpService from './ccp.service';

let serviceName = 'paymentValidationService';

class PaymentValidation {

  /*@ngInject*/
  constructor(ccpService){
    this.ccpService = ccpService;

    this.loadCcp();
  }

  loadCcp(){
    this.ccpService.get()
      .subscribe((ccp) => {
        this.ccp = ccp;
      });
  }

  validateRoutingNumber(){
    return (routingNumber) => {
      routingNumber = toString(routingNumber);
      let digits = routingNumber.split('');
      if(digits[0] > 3) return false; // Added to match EP validation https://github.com/CruGlobal/give-ep-extensions/blob/develop/cortex/resources/bank-account-resource/src/main/java/com/elasticpath/extensions/rest/resource/bankaccounts/validator/BankAccountValidator.java#L57
      let multipliers = [3, 7, 1, 3, 7, 1, 3, 7, 1];

      let checksum = flow([
        zip,
        map((array) => {
          return array[0] * array[1];
        }),
        sum
      ])(digits, multipliers);
      return checksum !== 0 && checksum % 10 === 0;
    };
  }

  validateCardNumber(){
    return (cardNumber) => {
      cardNumber = toString(cardNumber);
      return this.ccp && (new this.ccp.CardNumber(cardNumber)).validate() === null;
    };
  }

  getCardNumberErrorMessage(cardNumber) {
    cardNumber = this.stripNonDigits(toString(cardNumber));
    return capitalize((new this.ccp.CardNumber(cardNumber)).validate());
  }

  validateCardSecurityCode(){
    return (securityCode) => {
      securityCode = toString(securityCode);
      return (new this.ccp.CardSecurityCode(securityCode)).validate() === null;
    };
  }

  stripNonDigits(number){
    return number.replace(/\D/g, '');
  }

}

export default angular
  .module(serviceName, [
    appConfig.name,
    ccpService.name
  ])
  .service(serviceName, PaymentValidation);
