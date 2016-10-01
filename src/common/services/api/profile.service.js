import angular from 'angular';
import omit from 'lodash/omit';
import map from 'lodash/map';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/map';
import sortPaymentMethods from 'common/services/paymentHelpers/paymentMethodSort';

import cortexApiService from '../cortexApi.service';
import hateoasHelperService from 'common/services/hateoasHelper.service';

import formatAddressForCortex from '../addressHelpers/formatAddressForCortex';
import formatAddressForTemplate from '../addressHelpers/formatAddressForTemplate';

let serviceName = 'profileService';

class Profile{

  /*@ngInject*/
  constructor($log, cortexApiService, hateoasHelperService){
    this.$log = $log;
    this.cortexApiService = cortexApiService;
    this.hateoasHelperService = hateoasHelperService;
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
          paymentMethods: 'selfservicepaymentmethods:element[]'
        }
      })
      .pluck('paymentMethods')
      .map((paymentMethods) => {
        paymentMethods = map(paymentMethods, (paymentMethod) => {
          if(paymentMethod.address){
            paymentMethod.address = formatAddressForTemplate(paymentMethod.address);
          }
          return paymentMethod;
        });
        return sortPaymentMethods(paymentMethods);
      });
  }


  getPaymentMethodForms(){
    if(this.paymentMethodForms){
      return Observable.of(this.paymentMethodForms);
    }else{
      return this.cortexApiService.get({
          path: ['profiles', this.cortexApiService.scope, 'default'],
          zoom: {
            bankAccount: 'selfservicepaymentmethods:createbankaccountform',
            creditCard: 'selfservicepaymentmethods:createcreditcardform'
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
          path: this.hateoasHelperService.getLink(data.bankAccount, 'createbankaccountaction'),
          data: paymentInfo,
          followLocation: true
        });
      });
  }

  addCreditCardPayment(paymentInfo){
    paymentInfo = omit(paymentInfo, 'ccv');
    if(paymentInfo.address) {
      paymentInfo.address = formatAddressForCortex(paymentInfo.address);
    }
    return this.getPaymentMethodForms()
      .mergeMap((data) => {
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.creditCard, 'createcreditcardaction'),
          data: paymentInfo,
          followLocation: true
        });
      });
  }

  addPaymentMethod(paymentInfo){
    if(paymentInfo.bankAccount){
      return this.addBankAccountPayment(paymentInfo.bankAccount);
    }else if(paymentInfo.creditCard){
      return this.addCreditCardPayment(paymentInfo.creditCard);
    }else{
      return Observable.throw('Error adding payment method. The data passed to profileService.addPaymentMethod did not contain bankAccount or creditCard data');
    }
  }

  getPurchase(uri){
    return this.cortexApiService.get({
      path: uri,
      zoom: {
        donorDetails: 'donordetails',
        paymentMeans: 'paymentmeans:element',
        lineItems: 'lineitems:element[],lineitems:element:code,lineitems:element:rate',
        rateTotals: 'ratetotals:element[]'
      }
    })
      .map((data) => {
        data.donorDetails.mailingAddress = formatAddressForTemplate(data.donorDetails['mailing-address']);
        delete data.donorDetails['mailing-address'];
        if(data.paymentMeans.self.type === 'elasticpath.purchases.purchase.paymentmeans'){ //only credit card type has billing address
          data.paymentMeans.address = formatAddressForTemplate(data.paymentMeans['billing-address'].address);
          delete data.paymentMeans['billing-address'];
        }
        return data;
      });
  }

}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    hateoasHelperService.name
  ])
  .service(serviceName, Profile);
