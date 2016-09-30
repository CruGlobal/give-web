import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './profile.service';

import emailsResponse from 'common/services/api/fixtures/cortex-profile-emails.fixture.js';
import paymentmethodsResponse from 'common/services/api/fixtures/cortex-profile-paymentmethods.fixture.js';
import paymentmethodsFormsResponse from 'common/services/api/fixtures/cortex-profile-paymentmethods-forms.fixture.js';

let paymentmethodsFormsResponseZoomMapped = {
  bankAccount: paymentmethodsFormsResponse._selfservicepaymentmethods[0]._createbankaccountform[0],
  creditCard: paymentmethodsFormsResponse._selfservicepaymentmethods[0]._createcreditcardform[0],
  rawData: paymentmethodsFormsResponse
};

describe('profile service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject((profileService, $httpBackend) => {
    self.profileService = profileService;
    self.$httpBackend = $httpBackend;
  }));

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getEmail', () => {
    it('should load the user\'s email', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/profiles/crugive/default?zoom=emails:element')
        .respond(200, emailsResponse);
      self.profileService.getEmail()
        .subscribe((data) => {
          expect(data).toEqual('asdf@asdf.com');
        });
      self.$httpBackend.flush();
    });
  });

  describe('getPaymentMethods', () => {
    it('should load the user\'s saved payment methods', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/profiles/crugive/default?zoom=selfservicepaymentmethods:element')
        .respond(200, paymentmethodsResponse);

      let expectedPaymentMethods = angular.copy(paymentmethodsResponse._selfservicepaymentmethods[0]._element);
      expectedPaymentMethods[0].address = {
        country: 'US',
        streetAddress: '123 First St',
        extendedAddress: '',
        locality: 'Sacramento',
        region: 'CA',
        postalCode: '12345'
      };
      self.profileService.getPaymentMethods()
        .subscribe((data) => {
          expect(data).toEqual([
            expectedPaymentMethods[1],
            expectedPaymentMethods[0]
          ]);
        });
      self.$httpBackend.flush();
    });
  });

  describe('getPaymentMethodForms', () => {
    function setupRequest() {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/profiles/crugive/default?zoom=selfservicepaymentmethods:createbankaccountform,selfservicepaymentmethods:createcreditcardform')
        .respond(200, paymentmethodsFormsResponse);
    }

    function initiateRequest() {
      self.profileService.getPaymentMethodForms()
        .subscribe((data) => {
          expect(data).toEqual(paymentmethodsFormsResponseZoomMapped);
        });
    }

    it('should send a request to get the payment form links', () => {
      setupRequest();
      initiateRequest();
      self.$httpBackend.flush();
    });

    it('should use the cached response if called a second time', () => {
      setupRequest();
      initiateRequest();
      self.$httpBackend.flush();
      initiateRequest();
    });
  });

  describe('addBankAccountPayment', () => {
    it('should send a request to save the bank account payment info', () => {
      let paymentInfo = {
        'account-type': 'checking',
        'bank-name': 'First Bank',
        'display-account-number': '************9012',
        'encrypted-account-number': '**fake*encrypted**123456789012**',
        'routing-number': '123456789'
      };

      self.$httpBackend.expectPOST(
        'https://cortex-gateway-stage.cru.org/cortex/bankaccounts/selfservicepaymentmethods/crugive?followLocation=true',
        paymentInfo
      ).respond(200, 'success');

      // cache getPaymentForms response to avoid another http request while testing
      self.profileService.paymentMethodForms = paymentmethodsFormsResponseZoomMapped;

      self.profileService.addBankAccountPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      self.$httpBackend.flush();
    });
  });

  describe('addCreditCardPayment', () => {
    it('should send a request to save the credit card payment info with no billing address', () => {
      let paymentInfo = {
        'card-number': '**fake*encrypted**1234567890123456**',
        'card-type': 'VISA',
        'cardholder-name': 'Test Name',
        'expiry-month': '06',
        'expiry-year': '12',
        ccv: 'someEncryptedCCV...'
      };

      let paymentInfoWithoutCCV = angular.copy(paymentInfo);
      delete paymentInfoWithoutCCV.ccv;

      self.$httpBackend.expectPOST(
        'https://cortex-gateway-stage.cru.org/cortex/creditcards/selfservicepaymentmethods/crugive?followLocation=true',
        paymentInfoWithoutCCV
      ).respond(200, 'success');

      // cache getPaymentForms response to avoid another http request while testing
      self.profileService.paymentMethodForms = paymentmethodsFormsResponseZoomMapped;

      self.profileService.addCreditCardPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      self.$httpBackend.flush();
    });
    it('should send a request to save the credit card payment info with a billing address', () => {
      let paymentInfo = {
        address: {
          country: 'US',
          streetAddress: '123 First St',
          extendedAddress: 'Apt 123',
          locality: 'Sacramento',
          postalCode: '12345',
          region: 'CA'
        },
        'card-number': '**fake*encrypted**1234567890123456**',
        'card-type': 'VISA',
        'cardholder-name': 'Test Name',
        'expiry-month': '06',
        'expiry-year': '12',
        ccv: 'someEncryptedCCV...'
      };

      let paymentInfoWithoutCCV = angular.copy(paymentInfo);
      delete paymentInfoWithoutCCV.ccv;
      paymentInfoWithoutCCV.address = {
        'country-name': 'US',
        'street-address': '123 First St',
        'extended-address': 'Apt 123',
        'locality': 'Sacramento',
        'postal-code': '12345',
        'region': 'CA'
      };

      self.$httpBackend.expectPOST(
        'https://cortex-gateway-stage.cru.org/cortex/creditcards/selfservicepaymentmethods/crugive?followLocation=true',
        paymentInfoWithoutCCV
      ).respond(200, 'success');

      // cache getPaymentForms response to avoid another http request while testing
      self.profileService.paymentMethodForms = paymentmethodsFormsResponseZoomMapped;

      self.profileService.addCreditCardPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      self.$httpBackend.flush();
    });
  });

  describe('addPaymentMethod', () => {
    it('should save a new bank account payment method', () => {
      spyOn(self.profileService,'addBankAccountPayment').and.returnValue(Observable.of('success'));
      let paymentInfo = {
        'account-type': 'checking',
        'bank-name': 'First Bank',
        'display-account-number': '************9012',
        'encrypted-account-number': '**fake*encrypted**123456789012**',
        'routing-number': '123456789'
      };
      self.profileService.addPaymentMethod({
        bankAccount: paymentInfo
      }).subscribe((data) => {
        expect(data).toEqual('success');
      });
      expect(self.profileService.addBankAccountPayment).toHaveBeenCalledWith(paymentInfo);
    });
    it('should save a new credit card payment method', () => {
      spyOn(self.profileService,'addCreditCardPayment').and.returnValue(Observable.of('credit card success'));

      let paymentInfo = {
        address: {
          'country-name': 'US',
          'extended-address': '',
          'locality': 'Sacramento',
          'postal-code': '12345',
          'region': 'CA',
          'street-address': '123 First St'
        },
        'card-number': '**fake*encrypted**1234567890123456**',
        'card-type': 'VISA',
        'cardholder-name': 'Test Name',
        'expiry-month': '06',
        'expiry-year': '12',
        ccv: 'someEncryptedCCV...'
      };

      self.profileService.addPaymentMethod({
        creditCard: paymentInfo
      }).subscribe((data) => {
        expect(data).toEqual('credit card success');
      });
      expect(self.profileService.addCreditCardPayment).toHaveBeenCalledWith(paymentInfo);
    });
    it('should throw an error if the payment info doesn\'t contain a bank account or credit card', () => {
      self.profileService.addPaymentMethod({
          billingAddress: {}
        })
        .subscribe(() => {
            fail('the addPaymentMethod Observable completed successfully when it should have thrown an error');
          },
          (error) => {
            expect(error).toEqual('Error adding payment method. The data passed to profileService.addPaymentMethod did not contain bankAccount or creditCard data');
          });
    });
  });
});
