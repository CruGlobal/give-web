import angular from 'angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import toString from 'lodash/toString';
import map from 'lodash/map';
import omit from 'lodash/omit';
import sortPaymentMethods from 'common/services/paymentHelpers/paymentMethodSort';

import cortexApiService from '../cortexApi.service';
import hateoasHelperService from 'common/services/hateoasHelper.service';

import formatAddressForCortex from '../addressHelpers/formatAddressForCortex';
import formatAddressForTemplate from '../addressHelpers/formatAddressForTemplate';

export const existingPaymentMethodFlag = 'existing_payment_method';

let serviceName = 'orderService';

class Order{

  /*@ngInject*/
  constructor(cortexApiService, hateoasHelperService, $window, $log){
    this.cortexApiService = cortexApiService;
    this.hateoasHelperService = hateoasHelperService;
    this.sessionStorage = $window.sessionStorage;
    this.$log = $log;
  }

  getDonorDetails(){
    return this.cortexApiService.get({
        path: ['carts', this.cortexApiService.scope, 'default'],
        zoom: {
          donorDetails: 'order:donordetails',
          email: 'order:emailinfo:email'
        }
      })
      .map((data) => {
        let donorDetails = data.donorDetails;
        donorDetails.mailingAddress = formatAddressForTemplate(donorDetails['mailing-address']);
        delete donorDetails['mailing-address'];

        // Default country to US
        if(!donorDetails.mailingAddress.country){
          donorDetails.mailingAddress.country = 'US';
        }

        donorDetails.email = data.email && data.email.email;
        return donorDetails;
      });
  }

  updateDonorDetails(details){
    details = angular.copy(details);
    details['mailing-address'] = formatAddressForCortex(details.mailingAddress);
    delete details.mailingAddress;

    return this.cortexApiService.put({
      path: details.self.uri,
      data: details
    });
  }

  addEmail(email){
    return this.cortexApiService.post({
      path: ['emails', this.cortexApiService.scope],
      data: {email: email}
    });
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
    paymentInfo = omit(paymentInfo, 'ccv');
    return this.getPaymentMethodForms()
      .mergeMap((data) => {
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.creditCard, 'createcreditcardfororderaction'),
          data: paymentInfo,
          followLocation: true
        });
      });
  }

  addPaymentMethod(paymentInfo){
    if(paymentInfo.bankAccount){
      return this.addBankAccountPayment(paymentInfo.bankAccount);
    }else if(paymentInfo.creditCard){
      return this.addCreditCardPayment(paymentInfo.creditCard)
        .combineLatest(this.addBillingAddress(paymentInfo.billingAddress))
        .do(() => {
          this.storeCardSecurityCode(paymentInfo.creditCard.ccv);
        });
    }else{
      return Observable.throw('Error adding payment method. The data passed to orderService.addPaymentMethod did not contain bankAccount or creditCard data');
    }
  }

  getExistingPaymentMethods(){
    return this.cortexApiService.get({
        path: ['carts', this.cortexApiService.scope, 'default'],
        zoom: {
          choices: 'order:paymentmethodinfo:selector:choice[],order:paymentmethodinfo:selector:choice:description',
          chosen: 'order:paymentmethodinfo:selector:chosen,order:paymentmethodinfo:selector:chosen:description'
        }
      })
      .map((selector) => {
        let paymentMethods = selector.choices || [];
        if(selector.chosen) {
          selector.chosen.description.chosen = true;
          paymentMethods.unshift(selector.chosen);
        }
        return map(paymentMethods, (paymentMethod) => {
          paymentMethod.description.selectAction = paymentMethod.self.uri;
          return paymentMethod.description;
        });
      })
      .map((paymentMethods) => {
        return sortPaymentMethods(paymentMethods);
      });
  }

  selectPaymentMethod(uri){
    return this.cortexApiService.post({
      path: uri,
      data: {}
    });
  }

  addBillingAddress(billingAddress){
    billingAddress.address = formatAddressForCortex(billingAddress.address);
    return this.cortexApiService.post({
      path: ['addresses', this.cortexApiService.scope],
      data: billingAddress
    });
  }

  getBillingAddress(){
    return this.cortexApiService.get({
        path: ['carts', this.cortexApiService.scope, 'default'],
        zoom: {
          billingAddress: 'order:billingaddressinfo:billingaddress'
        }
      })
      .map((data) => {
        data.billingAddress.address = formatAddressForTemplate(data.billingAddress.address);
        return data.billingAddress;
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

  getPurchaseForm(){
    return this.cortexApiService.get({
      path: ['carts', this.cortexApiService.scope, 'default'],
      zoom: {
        enhancedpurchaseform: 'order:enhancedpurchaseform'
      },
      cache: true
    });
  }

  checkErrors(){
    return this.cortexApiService.get({
        path: ['carts', this.cortexApiService.scope, 'default'],
        zoom: {
          needInfo: 'order:needinfo[]'
        }
      })
      .map((data) => {
        let needInfo = data.needInfo;
        let errors = map(needInfo, 'name');
        return (errors && errors.length > 0) ? errors : undefined;
      })
      .do((errors) => {
        errors && this.$log.error('The user was presented with these `needinfo` errors. They should have been caught earlier in the checkout process.', errors);
      });
  }

  submit(ccv){
    return this.getPurchaseForm()
      .mergeMap((data) => {
        let postData = ccv ? {"security-code": ccv} : {};
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.enhancedpurchaseform, 'createenhancedpurchaseaction'),
          data: postData,
          followLocation: true
        });
      })
      .do((data) => {
        this.storeLastPurchaseLink(data.self.uri);
      });
  }

  storeCardSecurityCode(encryptedCcv){
    if(encryptedCcv === existingPaymentMethodFlag || toString(encryptedCcv).length > 50){
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

  storeLastPurchaseLink(link){
    this.sessionStorage.setItem('lastPurchaseLink', link);
  }

  retrieveLastPurchaseLink(){
    return this.sessionStorage.getItem('lastPurchaseLink');
  }

}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    hateoasHelperService.name
  ])
  .service(serviceName, Order);
