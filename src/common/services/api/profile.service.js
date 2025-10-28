import angular from 'angular';
import pick from 'lodash/pick';
import find from 'lodash/find';
import omit from 'lodash/omit';
import map from 'lodash/map';
import flatMap from 'lodash/flatMap';
import assign from 'lodash/assign';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import sortPaymentMethods from 'common/services/paymentHelpers/paymentMethodSort';
import extractPaymentAttributes from 'common/services/paymentHelpers/extractPaymentAttributes';
import RecurringGiftModel from 'common/models/recurringGift.model';

import cortexApiService from '../cortexApi.service';
import hateoasHelperService from 'common/services/hateoasHelper.service';

import formatAddressForCortex from '../addressHelpers/formatAddressForCortex';
import formatAddressForTemplate from '../addressHelpers/formatAddressForTemplate';

import analyticsFactory from 'app/analytics/analytics.factory';

const serviceName = 'profileService';

class Profile {
  /* @ngInject */
  constructor($log, cortexApiService, hateoasHelperService, analyticsFactory) {
    this.$log = $log;
    this.cortexApiService = cortexApiService;
    this.hateoasHelperService = hateoasHelperService;
    this.analyticsFactory = analyticsFactory;
  }

  getGivingProfile() {
    return this.cortexApiService
      .get({
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          donorDetails: 'donordetails',
          mailingAddress: 'addresses:mailingaddress',
          emailAddress: 'emails:element',
          phoneNumbers: 'phonenumbers:element[]',
          spouse: 'addspousedetails',
          yearToDate: 'givingdashboard:yeartodateamount',
        },
      })
      .map((data) => {
        const donor = pick(data.rawData, ['family-name', 'given-name']);
        const spouse = pick(data.spouse, ['given-name']);
        const phone = find(data.phoneNumbers, { primary: true });
        return {
          name:
            angular.isDefined(data.donorDetails) &&
            data.donorDetails['donor-type'] === 'Organization'
              ? data.donorDetails['organization-name']
              : spouse['given-name']
                ? `${donor['given-name']} & ${spouse['given-name']} ${donor['family-name']}`
                : `${donor['given-name']} ${donor['family-name']}`,
          donorNumber: angular.isDefined(data.donorDetails)
            ? data.donorDetails['donor-number']
            : undefined,
          email: angular.isDefined(data.emailAddress)
            ? data.emailAddress.email
            : undefined,
          phone: angular.isDefined(phone) ? phone['phone-number'] : undefined,
          address: angular.isDefined(data.mailingAddress)
            ? formatAddressForTemplate(data.mailingAddress.address)
            : undefined,
          yearToDate: angular.isDefined(data.yearToDate)
            ? data.yearToDate['year-to-date-amount']
            : undefined,
        };
      });
  }

  getDonorDetails() {
    return this.cortexApiService
      .get({
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          donorDetails: 'donordetails',
        },
      })
      .pluck('donorDetails')
      .map((donorDetails) => {
        donorDetails.mailingAddress = formatAddressForTemplate(
          donorDetails['mailing-address'].address,
        );
        delete donorDetails['mailing-address'];
        return donorDetails;
      });
  }

  getProfileDonorDetails() {
    return this.cortexApiService
      .get({
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          donorDetails: 'selfservicedonordetails',
        },
      })
      .pluck('donorDetails');
  }

  updateProfileDonorDetails(donorDetails) {
    return this.cortexApiService.put({
      path: donorDetails.self.uri,
      data: donorDetails,
    });
  }

  addSpouse(path, data) {
    return this.cortexApiService.put({
      path: path,
      data: data,
    });
  }

  getEmails() {
    // for now zero indexed element is a donor's email and the element with index '1' is spouse's email. TODO: submit ticket to BE team to get rid of 'magic numbers'
    return this.cortexApiService
      .get({
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          emails: 'emails:element[]',
        },
      })
      .pluck('emails');
  }

  updateEmail(data, spouse) {
    const initialPath = spouse ? 'spouseemails' : 'emails';
    const formPath = spouse ? 'spouse/form' : 'form';
    return this.cortexApiService.post({
      path: [initialPath, this.cortexApiService.scope, formPath],
      data: { email: data.email },
      followLocation: true,
    });
  }

  getPhoneNumbers() {
    return this.cortexApiService
      .get({
        path: ['phonenumbers', this.cortexApiService.scope],
        zoom: {
          donor: 'element[]',
        },
      })
      .map((data) => data.donor);
  }

  addPhoneNumber(number) {
    const formPath = number['is-spouse'] ? 'spouse/form' : 'form';
    return this.cortexApiService.post({
      path: ['phonenumbers', this.cortexApiService.scope, formPath],
      data: number,
      followLocation: true,
    });
  }

  updatePhoneNumber(number) {
    return this.cortexApiService.put({
      path: number.self.uri,
      data: number,
    });
  }

  deletePhoneNumber(number) {
    return this.cortexApiService.delete({
      path: number.self.uri,
    });
  }

  getMailingAddress() {
    return this.cortexApiService
      .get({
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          mailingAddress: 'addresses:mailingaddress',
        },
      })
      .map((response) => {
        response.mailingAddress.address = formatAddressForTemplate(
          response.mailingAddress.address,
        );
        return response.mailingAddress;
      });
  }

  updateMailingAddress(mailingAddress) {
    const mailingAddressCopy = assign({}, mailingAddress);
    mailingAddressCopy.address = formatAddressForCortex(
      mailingAddressCopy.address,
    );
    return this.cortexApiService.put({
      path: mailingAddress.self.uri,
      data: mailingAddressCopy,
    });
  }

  getPaymentMethods(cache) {
    return this.cortexApiService
      .get({
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          paymentMethods: 'selfservicepaymentinstruments:element[]',
        },
        cache: !!cache,
      })
      .pluck('paymentMethods')
      .map((paymentMethods) => {
        paymentMethods = map(paymentMethods, (paymentMethod) => {
          paymentMethod.id = paymentMethod.self.uri.split('/').pop();
          if (
            paymentMethod['payment-instrument-identification-attributes'][
              'street-address'
            ]
          ) {
            paymentMethod.address = formatAddressForTemplate(
              paymentMethod['payment-instrument-identification-attributes'],
            );
          }
          return extractPaymentAttributes(paymentMethod);
        });
        return sortPaymentMethods(paymentMethods);
      });
  }

  getPaymentMethod(uri, cache) {
    return this.cortexApiService
      .get({
        path: uri,
        cache: !!cache,
      })
      .map((paymentMethod) => {
        paymentMethod.id = paymentMethod.self.uri.split('/').pop();
        if (
          paymentMethod['payment-instrument-identification-attributes'][
            'street-address'
          ]
        ) {
          paymentMethod.address = formatAddressForTemplate(
            paymentMethod['payment-instrument-identification-attributes'],
          );
        }
        return extractPaymentAttributes(paymentMethod);
      });
  }

  getPaymentMethodsWithDonations() {
    return this.cortexApiService
      .get({
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          paymentMethods:
            'selfservicepaymentinstruments:element[],selfservicepaymentinstruments:element:recurringgifts',
        },
      })
      .pluck('paymentMethods')
      .map((paymentMethods) => {
        paymentMethods = map(paymentMethods, (paymentMethod) => {
          if (
            paymentMethod['payment-instrument-identification-attributes'][
              'street-address'
            ]
          ) {
            paymentMethod.address = formatAddressForTemplate(
              paymentMethod['payment-instrument-identification-attributes'],
            );
          }
          paymentMethod.recurringGifts = flatMap(
            paymentMethod.recurringgifts.donations,
            (donation) => {
              return map(donation['donation-lines'], (donationLine) => {
                return new RecurringGiftModel(donationLine, donation);
              });
            },
          );
          delete paymentMethod.recurringgifts;
          return extractPaymentAttributes(paymentMethod);
        });
        return sortPaymentMethods(paymentMethods);
      });
  }

  getPaymentMethodForms() {
    if (this.paymentMethodForms) {
      return Observable.of(this.paymentMethodForms);
    } else {
      return this.cortexApiService
        .get({
          path: ['profiles', this.cortexApiService.scope, 'default'],
          zoom: {
            paymentMethodForms:
              'paymentmethods:element[],paymentmethods:element:selfservicepaymentinstrumentform',
          },
        })
        .do((data) => {
          this.paymentMethodForms = data;

          angular.forEach(this.paymentMethodForms, (paymentMethodForm) => {
            if (
              !this.hateoasHelperService.getLink(
                paymentMethodForm.selfservicepaymentinstrumentform,
                'createpaymentinstrumentaction',
              )
            ) {
              this.$log.warn('Payment form request contains empty link', data);
            }
          });
        });
    }
  }

  addBankAccountPayment(paymentInfo) {
    return this.getPaymentMethodForms().mergeMap((data) => {
      const link = this.determinePaymentMethodFormLink(data, 'bank-name');
      return this.cortexApiService.post({
        path: link,
        data: { 'payment-instrument-identification-form': paymentInfo },
        followLocation: true,
      });
    });
  }

  addCreditCardPayment(paymentInfo) {
    paymentInfo = omit(paymentInfo, 'cvv');

    const dataToSend = {};

    if (paymentInfo.address) {
      dataToSend['billing-address'] = {
        address: formatAddressForCortex(paymentInfo.address),
      };
      paymentInfo.address = undefined;
    }
    dataToSend['payment-instrument-identification-form'] = paymentInfo;

    return this.getPaymentMethodForms().mergeMap((data) => {
      const link = this.determinePaymentMethodFormLink(data, 'card-number');
      return this.cortexApiService.post({
        path: link,
        data: dataToSend,
        followLocation: true,
      });
    });
  }

  determinePaymentMethodFormLink(data, fieldName) {
    let link = '';
    angular.forEach(data.paymentMethodForms, (paymentMethodForm) => {
      if (
        paymentMethodForm.selfservicepaymentinstrumentform[
          'payment-instrument-identification-form'
        ][fieldName] !== undefined
      ) {
        link = this.hateoasHelperService.getLink(
          paymentMethodForm.selfservicepaymentinstrumentform,
          'createpaymentinstrumentaction',
        );
      }
    });
    return link;
  }

  addPaymentMethod(paymentInfo) {
    if (paymentInfo.bankAccount) {
      this.analyticsFactory.track('add-payment-method');
      return this.addBankAccountPayment(paymentInfo.bankAccount);
    } else if (paymentInfo.creditCard) {
      this.analyticsFactory.track('add-payment-method');
      return this.addCreditCardPayment(paymentInfo.creditCard);
    } else {
      return Observable.throw(
        'Error adding payment method. The data passed to profileService.addPaymentMethod did not contain bankAccount or creditCard data',
      );
    }
  }

  updatePaymentMethod(originalPaymentInfo, paymentInfo) {
    if (paymentInfo.bankAccount) {
      paymentInfo = paymentInfo.bankAccount;
    } else if (paymentInfo.creditCard) {
      paymentInfo = paymentInfo.creditCard;
      if (paymentInfo.address) {
        paymentInfo.address = formatAddressForCortex(paymentInfo.address);
        paymentInfo = { ...paymentInfo, ...paymentInfo.address };
        delete paymentInfo.address;
      }
    } else {
      return Observable.throw(
        'Error updating payment method. The data passed to profileService.updatePaymentMethod did not contain bankAccount or creditCard data.',
      );
    }
    return this.cortexApiService.put({
      path: originalPaymentInfo.self.uri,
      data: { 'payment-instrument-identification-attributes': paymentInfo },
    });
  }

  deletePaymentMethod(uri) {
    this.analyticsFactory.track('delete-payment-method');
    return this.cortexApiService.delete({
      path: uri,
    });
  }

  getPurchase(uri) {
    return this.cortexApiService
      .get({
        path: uri,
        zoom: {
          donorDetails: 'donordetails',
          paymentInstruments: 'paymentinstruments:element',
          lineItems:
            'lineitems:element[],lineitems:element:item:code,lineitems:element:item:offer:code,lineitems:element:rate',
          rateTotals: 'ratetotals:element[]',
          billingAddress: 'billingaddress',
        },
      })
      .map((data) => {
        data.donorDetails.mailingAddress = formatAddressForTemplate(
          data.donorDetails['mailing-address'].address,
        );
        delete data.donorDetails['mailing-address'];

        data.paymentInstruments = extractPaymentAttributes(
          data.paymentInstruments,
        );
        if (data.paymentInstruments['card-number']) {
          // only credit card type has billing address
          data.paymentInstruments.address = formatAddressForTemplate(
            data.billingAddress.address,
          );
        }
        delete data.billingAddress;
        return data;
      });
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    hateoasHelperService.name,
    analyticsFactory.name,
  ])
  .service(serviceName, Profile);
