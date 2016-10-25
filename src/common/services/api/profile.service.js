import angular from 'angular';
import pick from 'lodash/pick';
import find from 'lodash/find';
import omit from 'lodash/omit';
import map from 'lodash/map';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import sortPaymentMethods from 'common/services/paymentHelpers/paymentMethodSort';

import cortexApiService from '../cortexApi.service';
import hateoasHelperService from 'common/services/hateoasHelper.service';

import formatAddressForCortex from '../addressHelpers/formatAddressForCortex';
import formatAddressForTemplate from '../addressHelpers/formatAddressForTemplate';

let serviceName = 'profileService';

class Profile {

  /*@ngInject*/
  constructor($log, cortexApiService, hateoasHelperService){
    this.$log = $log;
    this.cortexApiService = cortexApiService;
    this.hateoasHelperService = hateoasHelperService;
  }

  getGivingProfile() {
    return this.cortexApiService
      .get( {
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          donorDetails:   'donordetails',
          mailingAddress: 'addresses:mailingaddress',
          emailAddress:   'emails:element',
          phoneNumbers:   'phonenumbers:element[]',
          spouse:         'addspousedetails',
          yearToDate:     'givingdashboard:yeartodateamount'
        }
      } )
      .map( ( data ) => {
        let donor = pick( data.rawData, ['family-name', 'given-name'] ),
          spouse = pick( data.spouse, ['given-name'] ),
          phone = find( data.phoneNumbers, {primary: true} );
        return {
          name:        (spouse['given-name']) ?
            `${donor['given-name']} & ${spouse['given-name']} ${donor['family-name']}` :
            `${donor['given-name']} ${donor['family-name']}`,
          donorNumber: angular.isDefined( data.donorDetails ) ? data.donorDetails['donor-number'] : undefined,
          email:       angular.isDefined( data.emailAddress ) ? data.emailAddress.email : undefined,
          phone:       angular.isDefined( phone ) ? phone['phone-number'] : undefined,
          address:     angular.isDefined( data.mailingAddress ) ?
            formatAddressForTemplate( data.mailingAddress.address ) : undefined,
          yearToDate:  angular.isDefined( data.yearToDate ) ? data.yearToDate['year-to-date-amount'] : undefined
        };
      } );
  }

  getDonorDetails() {
    return this.cortexApiService
      .get( {
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          donorDetails:   'donordetails'
        }
      } )
      .pluck( 'donorDetails' )
      .map((donorDetails) => {
        donorDetails.mailingAddress = formatAddressForTemplate(donorDetails['mailing-address']);
        delete donorDetails['mailing-address'];
        return donorDetails;
      });
  }

  getProfileDonorDetails() {
    return this.cortexApiService
      .get( {
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          donorDetails: 'selfservicedonordetails'
        }
      })
      .pluck('donorDetails');
  }

  updateProfileDonorDetails(donorDetails) {
    return this.cortexApiService.put({
      path: donorDetails.self.uri,
      data: donorDetails
    });
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

  updateEmail(data){
    return this.cortexApiService.post({
        path: ['emails', this.cortexApiService.scope],
        data: data,
        followLocation: true
      });
  }

  getPhoneNumbers(){
    return this.cortexApiService.get({
        path: ['phonenumbers', this.cortexApiService.scope],
        zoom: {
          phoneNumbers: 'element[]'
        }
      })
      .pluck('phoneNumbers');
  }

  addPhoneNumber(number){
    return this.cortexApiService.post({
      path: ['phonenumbers', this.cortexApiService.scope],
      data: number,
      followLocation: true
    });
  }

  updatePhoneNumber(number){
    return this.cortexApiService.put({
      path: number.self.uri,
      data: number
    });
  }

  deletePhoneNumber(number){
    return this.cortexApiService.delete({
      path: number.self.uri
    });
  }

  getMailingAddress(uri) {
    return this.cortexApiService.get({
      path: uri || ['addresses', this.cortexApiService.scope]
    });
  }


  updateMailingAddress(mailingAddress){
    let mailingAddressCopy = Object.assign({}, mailingAddress);
    mailingAddressCopy.address = formatAddressForCortex(mailingAddressCopy.address);
    return this.cortexApiService.put({
      path: mailingAddress.self.uri,
      data: mailingAddressCopy
    });
  }

  getPaymentMethods(){
    return this.cortexApiService.get({
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          paymentMethods: 'selfservicepaymentmethods:element[]'
        },
        cache: true
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

  getPaymentMethodsWithDonations(){
    return this.cortexApiService.get({
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          paymentMethods: 'selfservicepaymentmethods:element[]',
          recurringGifts: 'selfservicepaymentmethods:element:recurringgifts'
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

  updateRecurringGifts(recurringGifts){
    return this.cortexApiService.put({
      path: recurringGifts.self.uri,
      data: recurringGifts
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

  updatePaymentMethod(originalPaymentInfo, paymentInfo){
    if(paymentInfo.bankAccount){
      paymentInfo = paymentInfo.bankAccount;
    }else if(paymentInfo.creditCard){
      paymentInfo = paymentInfo.creditCard;
      if(paymentInfo.address) {
        paymentInfo.address = formatAddressForCortex(paymentInfo.address);
      }
    }else{
      return Observable.throw('Error updating payment method. The data passed to profileService.updatePaymentMethod did not contain bankAccount or creditCard data.');
    }
    return this.cortexApiService.put({
      path: originalPaymentInfo.self.uri,
      data: paymentInfo
    });
  }

  deletePaymentMethod(uri){
    return this.cortexApiService.delete({
      path: uri
    });
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
