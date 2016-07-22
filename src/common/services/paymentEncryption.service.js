import angular from 'angular';
import ccp from 'common/lib/ccp';
import { ccpKey } from 'common/app.constants';


let serviceName = 'paymentEncryptionService';

/*@ngInject*/
class PaymentEncryption {

  constructor(){
    this.ccp = ccp.initialize(ccpKey);
  }

  validateRoutingNumber(routingNumber){
    return false;
  }

  validateAccountNumber(accountNumber){
    return false;
  }

  validateCardNumber(cardnumber){
    return false;
  }

  validateCardSecurityCode(securityCode){
    return false;
  }

  getCardType(cardnumber){
    return '';
  }

  encrypt(number){
    return 0;
  }

}

export default angular
  .module(serviceName, [

  ])
  .service(serviceName, PaymentEncryption);
