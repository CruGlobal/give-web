import angular from 'angular';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/map';
import map from 'lodash/map';
import sortPaymentMethods from 'common/services/paymentHelpers/paymentMethodSort';

import cortexApiService from '../cortexApi.service';

let serviceName = 'profileService';

class Profile{

  /*@ngInject*/
  constructor($log, cortexApiService){
    this.$log = $log;
    this.cortexApiService = cortexApiService;
  }

  getEmail(){
    return this.cortexApiService.get({
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          email: 'emails:element'
        }
      })
      .pluck('email')
      .pluck('email');
  }

  getPaymentMethods(){
    return this.cortexApiService.get({
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          paymentMethods: 'paymentmethods:element[],paymentmethods:element:bankaccount,paymentmethods:element:creditcard'
        }
      })
      .pluck('paymentMethods')
      .map((paymentMethods) => {
        paymentMethods = map(paymentMethods, (paymentMethod) => {
          if(paymentMethod.self.type === 'elasticpath.bankaccounts.bank-account'){
            return paymentMethod.bankaccount;
          }else if(paymentMethod.self.type === 'cru.creditcards.named-credit-card'){
            return paymentMethod.creditcard;
          }else{
            this.$log.error('Unable to recognize the type of this payment method', paymentMethod.self && paymentMethod.self.type);
            return paymentMethod;
          }
        });
        return sortPaymentMethods(paymentMethods);
      });
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name
  ])
  .service(serviceName, Profile);
