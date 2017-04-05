import angular from 'angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import map from 'lodash/map';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import sortPaymentMethods from 'common/services/paymentHelpers/paymentMethodSort';

import cortexApiService from '../cortexApi.service';
import hateoasHelperService from 'common/services/hateoasHelper.service';

import formatAddressForCortex from '../addressHelpers/formatAddressForCortex';
import formatAddressForTemplate from '../addressHelpers/formatAddressForTemplate';

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
        email: 'order:emailinfo:email',
        emailForm: 'order:emailinfo:emailform'
      }
    })
      .map(data => {
        let donorDetails = { name: {}, mailingAddress: {} };
        if(data.donorDetails){
          donorDetails = data.donorDetails;
          donorDetails.mailingAddress = formatAddressForTemplate(donorDetails['mailing-address']);
          delete donorDetails['mailing-address'];
        }

        // Default country to US
        if(!donorDetails.mailingAddress.country){
          donorDetails.mailingAddress.country = 'US';
        }

        donorDetails.email = data.email && data.email.email;
        donorDetails.emailFormUri = data.emailForm && data.emailForm.links[0].uri;

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

  addEmail(email, uri){
    return this.cortexApiService.post({
      path: uri,
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
    const cvv = paymentInfo.cvv;
    paymentInfo = omit(paymentInfo, 'cvv');
    if(paymentInfo.address) {
      paymentInfo.address = formatAddressForCortex(paymentInfo.address);
    }
    return this.getPaymentMethodForms()
      .mergeMap((data) => {
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.creditCard, 'createcreditcardfororderaction'),
          data: paymentInfo,
          followLocation: true
        }).do(creditCard => {
          this.storeCardSecurityCode(cvv, creditCard.self.uri);
        });
      });
  }

  addPaymentMethod(paymentInfo){
    if(paymentInfo.bankAccount){
      return this.addBankAccountPayment(paymentInfo.bankAccount);
    }else if(paymentInfo.creditCard){
      return this.addCreditCardPayment(paymentInfo.creditCard);
    }else{
      return Observable.throw('Error adding payment method. The data passed to orderService.addPaymentMethod did not contain bankAccount or creditCard data');
    }
  }

  updatePaymentMethod(paymentMethod, paymentInfo){
    //Only supports updating credit cards here
    paymentInfo = paymentInfo.creditCard;

    if(paymentInfo.address) {
      paymentInfo.address = formatAddressForCortex(paymentInfo.address);
    }

    return this.selectPaymentMethod(paymentMethod.selectAction)
      .mergeMap(() => {
        return this.cortexApiService.get({
          path: ['carts', this.cortexApiService.scope, 'default'],
          zoom: {
            updateForm: 'order:paymentmethodinfo:creditcardupdateform'
          }
        });
      })
      .mergeMap(data => {
        return this.cortexApiService.post({
          path: this.hateoasHelperService.getLink(data.updateForm, 'updatecreditcardfororderaction'),
          data: pick(paymentInfo, ['address', 'cardholder-name', 'expiry-month', 'expiry-year'])
        })
          .do(() => {
            this.storeCardSecurityCode(paymentInfo.cvv, paymentMethod.self.uri);
          });
      });
  }

  getExistingPaymentMethods(){
    return this.cortexApiService.get({
      path: ['carts', this.cortexApiService.scope, 'default'],
      zoom: {
        choices: 'order:paymentmethodinfo:selector:choice[],order:paymentmethodinfo:selector:choice:description',
        chosen: 'order:paymentmethodinfo:selector:chosen,order:paymentmethodinfo:selector:chosen:description'
      }
    })
      .map(selector => {
        let paymentMethods = selector.choices || [];
        if(selector.chosen) {
          selector.chosen.description.chosen = true;
          paymentMethods.unshift(selector.chosen);
        }
        return map(paymentMethods, paymentMethod => {
          paymentMethod.description.selectAction = paymentMethod.self.uri;
          if(paymentMethod.description.address){
            paymentMethod.description.address = formatAddressForTemplate(paymentMethod.description.address);
          }
          return paymentMethod.description;
        });
      })
      .map(paymentMethods => {
        return sortPaymentMethods(paymentMethods);
      });
  }

  selectPaymentMethod(uri){
    return this.cortexApiService.post({
      path: uri,
      data: {}
    });
  }

  getCurrentPayment(){
    return this.cortexApiService.get({
      path: ['carts', this.cortexApiService.scope, 'default'],
      zoom: {
        paymentMethod: 'order:paymentmethodinfo:paymentmethod'
      }
    })
      .pluck('paymentMethod')
      .map(data => {
        if(data && data.address){
          data.address = formatAddressForTemplate(data.address);
        }
        return data;
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

  submit(cvv){
    return this.getPurchaseForm()
      .mergeMap((data) => {
        let postData = cvv ? {"security-code": cvv} : {};
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

  storeCardSecurityCode(cvv, uri){
    const storedCvvs = this.retrieveCardSecurityCodes();
    if(!cvv){
      cvv = storedCvvs[uri]; // Try looking up previously stored CVV by payment method uri
    }else{
      // Save new cvv in list of stored CVVs
      storedCvvs[uri] = cvv;
      this.sessionStorage.setItem('storedCvvs', angular.toJson(storedCvvs));
    }

    if(cvv){
      this.sessionStorage.setItem('cvv', cvv);
    }else{
      this.sessionStorage.removeItem('cvv');
    }
  }

  retrieveCardSecurityCode(){
    return this.sessionStorage.getItem('cvv');
  }

  retrieveCardSecurityCodes(){
    const storedCvvs = this.sessionStorage.getItem('storedCvvs');
    return storedCvvs && angular.fromJson(storedCvvs) || {};
  }

  clearCardSecurityCodes(){
    this.sessionStorage.removeItem('cvv');
    this.sessionStorage.removeItem('storedCvvs');
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
