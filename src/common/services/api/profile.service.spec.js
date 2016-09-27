import angular from 'angular';
import 'angular-mocks';

import module from './profile.service';

import emailsResponse from 'common/services/api/fixtures/cortex-profile-emails.fixture.js';
import paymentmethodsResponse from 'common/services/api/fixtures/cortex-profile-paymentmethods.fixture.js';

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
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/profiles/crugive/default?zoom=paymentmethods:element,paymentmethods:element:bankaccount,paymentmethods:element:creditcard')
        .respond(200, paymentmethodsResponse);
      self.profileService.getPaymentMethods()
        .subscribe((data) => {
          expect(data).toEqual([{
            "self": {
              "type": "elasticpath.bankaccounts.bank-account",
              "uri": "/bankaccounts/paymentmethods/crugive/giydcnzyga=",
              "href": "https://cortex-gateway-stage.cru.org/cortex/bankaccounts/paymentmethods/crugive/giydcnzyga="
            },
            "links": [{
              "rel": "paymentmethod",
              "uri": "/paymentmethods/crugive/giydcnzyga=",
              "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydcnzyga="
            }, {
              "rel": "bankaccount",
              "type": "elasticpath.bankaccounts.bank-account",
              "uri": "/bankaccounts/paymentmethods/crugive/giydcnzyga=",
              "href": "https://cortex-gateway-stage.cru.org/cortex/bankaccounts/paymentmethods/crugive/giydcnzyga="
            }],
            "account-type": "Savings",
            "bank-name": "2nd Bank",
            "display-account-number": "3456",
            "encrypted-account-number": "",
            "routing-number": "021000021"
          }, {
            "self": {
              "type": "cru.creditcards.named-credit-card",
              "uri": "/creditcards/paymentmethods/crugive/giydgmrrhe=",
              "href": "https://cortex-gateway-stage.cru.org/cortex/creditcards/paymentmethods/crugive/giydgmrrhe="
            },
            "links": [{
              "rel": "paymentmethod",
              "uri": "/paymentmethods/crugive/giydgmrrhe=",
              "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydgmrrhe="
            }, {
              "rel": "creditcard",
              "type": "cru.creditcards.named-credit-card",
              "uri": "/creditcards/paymentmethods/crugive/giydgmrrhe=",
              "href": "https://cortex-gateway-stage.cru.org/cortex/creditcards/paymentmethods/crugive/giydgmrrhe="
            }],
            "address": {
              "country-name": "US",
              "extended-address": "",
              "locality": "Sacramento",
              "postal-code": "12345",
              "region": "CA",
              "street-address": "123 Some Street"
            },
            "card-number": "1118",
            "card-type": "MasterCard",
            "cardholder-name": "Test Person",
            "description": "Mastercard Test Card",
            "expiry-month": "08",
            "expiry-year": "2020",
            "status": "Active"
          }]);
        });
      self.$httpBackend.flush();
    });
    it('should log an error if a payment method type isn\'t recognized', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/profiles/crugive/default?zoom=paymentmethods:element,paymentmethods:element:bankaccount,paymentmethods:element:creditcard')
        .respond(200, {
          _paymentmethods: [{
            _element: [{
              self: {
                type: 'unknown'
              }
            }]
          }]
        });
      self.profileService.getPaymentMethods()
        .subscribe((data) => {
          expect(data).toEqual([{
            self: {
              type: 'unknown'
            },
            bankaccount: undefined,
            creditcard: undefined
          }]);
        });
      self.$httpBackend.flush();
      expect(self.profileService.$log.error.logs[0]).toEqual(['Unable to recognize the type of this payment method', 'unknown']);
    });
  });
});
