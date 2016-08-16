import angular from 'angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';

import cortexApiService from '../cortexApi.service';
import hateoasHelperService from 'common/services/hateoasHelper.service';

let serviceName = 'orderService';

class Order{

  /*@ngInject*/
  constructor(cortexApiService, hateoasHelperService){
    this.cortexApiService = cortexApiService;
    this.hateoasHelperService = hateoasHelperService;
  }

  getPaymentForms(){
    if(this.paymentTypes){
      return Observable.of(this.paymentTypes);
    }else{
      return this.cortexApiService.get({
          path: ['carts', this.cortexApiService.scope, 'default'],
          zoom: {
            bankAccount: 'order:paymentmethodinfo:bankaccountform',
            creditCard: 'order:paymentmethodinfo:creditcardform'
          }
        })
        .do((data) => {
          this.paymentTypes = data;
        });
    }
  }

  addBankAccountPayment(paymentInfo){
    return this.getPaymentForms()
      .mergeMap((data) => {
        return this.cortexApiService.post({
            path: this.hateoasHelperService.getLink(data.bankAccount, 'createbankaccountfororderaction'),
            data: paymentInfo,
            followLocation: true
          });
      });
  }

  addCreditCardPayment(paymentInfo){
    return this.getPaymentForms()
      .mergeMap((data) => {
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.creditCard, 'createcreditcardfororderaction'),
          data: paymentInfo,
          followLocation: true
        });
      });
  }

  getCurrentPayment(){
    return this.cortexApiService.get({
        path: ['carts', this.cortexApiService.scope, 'default'],
        zoom: {
          paymentmethod: 'order:paymentmethodinfo:paymentmethod'
        }
      })
      .map((data) => {
        return data.paymentmethod;
      });
  }

}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    hateoasHelperService.name
  ])
  .service(serviceName, Order);
