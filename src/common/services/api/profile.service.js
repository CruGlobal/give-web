import angular from 'angular';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/map';
import sortPaymentMethods from 'common/services/paymentHelpers/paymentMethodSort';

import cortexApiService from '../cortexApi.service';

let serviceName = 'profileService';

class Profile{

  /*@ngInject*/
  constructor(cortexApiService){
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
          paymentMethods: 'paymentmethods:element[]'
        }
      })
      .pluck('paymentMethods')
      .map((paymentMethods) => {
        return sortPaymentMethods(paymentMethods);
      });
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name
  ])
  .service(serviceName, Profile);
