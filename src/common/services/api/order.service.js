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
        donorDetails.mailingAddress = this.formatAddressForTemplate(donorDetails['mailing-address']);
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
    details['mailing-address'] = this.formatAddressForCortex(details.mailingAddress);
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
    return this.getPaymentMethodForms()
      .mergeMap((data) => {
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.creditCard, 'createcreditcardfororderaction'),
          data: paymentInfo,
          followLocation: true
        });
      });
  }

  addBillingAddress(billingAddress){
    billingAddress.address = this.formatAddressForCortex(billingAddress.address);
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
        data.billingAddress.address = this.formatAddressForTemplate(data.billingAddress.address);
        return data.billingAddress;
      });
  }

  formatAddressForCortex(address){
    let isUsAddress = address.country === 'US' || ''; // Becomes true or empty string
    let internationalAddressLines = [
      address.streetAddress,
      address.extendedAddress,
      address.intAddressLine3,
      address.intAddressLine4
    ];
    return {
      'country-name': address.country,
      'street-address': isUsAddress ? address.streetAddress : internationalAddressLines.join('||'),
      'extended-address': isUsAddress && address.extendedAddress,
      'locality': isUsAddress && address.locality,
      'postal-code': isUsAddress && address.postalCode,
      'region': isUsAddress && address.region
    };
  }

  formatAddressForTemplate(address){
    let output = {
      country: address['country-name']
    };
    if(output.country === 'US'){
      output.streetAddress = address['street-address'];
      output.extendedAddress = address['extended-address'];
      output.locality = address['locality'];
      output.region = address['region'];
      output.postalCode = address['postal-code'];
    }else{
      let intAddress = address['street-address'].split('||');
      output.streetAddress = intAddress[0];
      output.extendedAddress = intAddress[1];
      output.intAddressLine3 = intAddress[2];
      output.intAddressLine4 = intAddress[3];
    }
    return output;
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

  submit(ccv){
    return this.getPurchaseForm()
      .mergeMap((data) => {
        let postData = ccv ? {"security-code": ccv} : undefined;
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.enhancedpurchaseform, 'createenhancedpurchaseaction'),
          data: postData
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
