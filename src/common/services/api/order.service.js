import angular from 'angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';

import apiService from '../api.service';
import hateoasHelperService from 'common/services/hateoasHelper.service';

let serviceName = 'orderService';

class Order{

  /*@ngInject*/
  constructor(apiService, hateoasHelperService){
    this.apiService = apiService;
    this.hateoasHelperService = hateoasHelperService;
  }

  getCurrentPayments(){
    if(this.paymentTypes){
      return Observable.of(this.paymentTypes);
    }else{
      return this.apiService.get({
          path: ['carts', this.apiService.scope, 'default'],
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
    return this.getCurrentPayments()
      .mergeMap((data) => {
        return this.apiService.post({
            path: this.hateoasHelperService.getLink(data.bankAccount, 'createbankaccountfororderaction'),
            data: paymentInfo,
            followLocation: true
          });
      });
  }

  addCreditCardPayment(){

  }

}

export default angular
  .module(serviceName, [
    apiService.name,
    hateoasHelperService.name
  ])
  .service(serviceName, Order);
