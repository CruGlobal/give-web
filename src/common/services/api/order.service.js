import angular from 'angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import toString from 'lodash/toString';

import cortexApiService from '../cortexApi.service';
import hateoasHelperService from 'common/services/hateoasHelper.service';

let serviceName = 'orderService';

class Order{

  /*@ngInject*/
  constructor(cortexApiService, hateoasHelperService, $window){
    this.cortexApiService = cortexApiService;
    this.hateoasHelperService = hateoasHelperService;
    this.sessionStorage = $window.sessionStorage;
  }

  getPaymentMethodForms(){
    if(this.paymentMethodForms){
      return Observable.of(this.paymentMethodForms);
    }else{
      return this.cortexApiService.get({
          path: ['carts', this.cortexApiService.scope, 'default'],
          zoom: {
            bankAccount: 'order:paymentmethodinfo:bankaccountform',
            creditCard: 'order:paymentmethodinfo:creditcardform'
          }
        })
        .do((data) => {
          this.paymentMethodForms = data;
        });
    }
  }

  addBankAccountPayment(paymentInfo){
    return this.getPaymentMethodForms()
      .mergeMap((data) => {
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.bankAccount, 'createbankaccountfororderaction'),
          data: paymentInfo,
          followLocation: true
        });
      });
  }

  addCreditCardPayment(paymentInfo){
    return this.getPaymentMethodForms()
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

  getPurchaseForms(){
    if(this.purchaseForms){
      return Observable.of(this.purchaseForms);
    }else{
      return this.cortexApiService.get({
          path: ['carts', this.cortexApiService.scope, 'default'],
          zoom: {
            purchaseform: 'order:purchaseform',
            enhancedpurchaseform: 'order:enhancedpurchaseform'
          }
        })
        .do((data) => {
          this.purchaseForms = data;
        });
    }
  }

  submit(){
    return this.getPurchaseForms()
      .mergeMap((data) => {
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.purchaseform, 'submitorderaction')
        });
      });
  }

  submitWithCcv(ccv){
    return this.getPurchaseForms()
      .mergeMap((data) => {
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.enhancedpurchaseform, 'createenhancedpurchaseaction'),
          data: {"security-code": ccv}
        });
      });
  }

  storeCardSecurityCode(encryptedCcv){
    if(toString(encryptedCcv).length > 50){
      this.sessionStorage.setItem('ccv', encryptedCcv);
    }else{
      throw new Error('The CCV should be encrypted and the provided CCV looks like it is too short to be encrypted correctly');
    }
  }

  retrieveCardSecurityCode(){
    return this.sessionStorage.getItem('ccv');
  }

  clearCardSecurityCode(){
    return this.sessionStorage.removeItem('ccv');
  }

}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    hateoasHelperService.name
  ])
  .service(serviceName, Order);
