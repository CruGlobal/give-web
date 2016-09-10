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
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/profiles/crugive/default?zoom=paymentmethods:element')
        .respond(200, paymentmethodsResponse);
      self.profileService.getPaymentMethods()
        .subscribe((data) => {
          expect(data).toEqual([{
            "self": {
              "type": "elasticpath.bankaccounts.bank-account",
              "uri": "/paymentmethods/crugive/giydcmzyge=",
              "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydcmzyge="
            },
            "links": [{
              "rel": "list",
              "type": "elasticpath.collections.links",
              "uri": "/paymentmethods/crugive",
              "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive"
            }, {
              "rel": "bankaccount",
              "type": "elasticpath.bankaccounts.bank-account",
              "uri": "/bankaccounts/paymentmethods/crugive/giydcmzyge=",
              "href": "https://cortex-gateway-stage.cru.org/cortex/bankaccounts/paymentmethods/crugive/giydcmzyge="
            }],
            "account-type": "Checking",
            "bank-name": "First Bank",
            "display-account-number": "1874",
            "encrypted-account-number": "FAecKEPeUdW6KjbHo/na/hXlAS9OjZR51dlBgKKInf2mJh4bSP9WMvsKfAAL1rW7o6P9Rmx87dp0rDz0NArbWGIdsYeoFVOaIATzQqAe4ECuy0gfHcDva26HmgriGqRWkWPDeQvEdU9jENu0XKskxAjk2sBLJOHhoTCi8+LTLUrNwu40CSdT/PGNK8/lnO27wTZDPmc221xJ6hzB/F+0sRRvJhWky2oxA491MG+SRk7lWhccqSq5KtrijfA88Ebb/EivnsSJwqZgv/WNIP2u/V3dsMF1YRtyEsEAkmgxCCYBye2TT5ehIVOChQdlUbHxF+z/izrmn+0u2IYXvyX4dw==",
            "routing-number": "121042882"
          }, {
            "self": {
              "type": "elasticpath.bankaccounts.bank-account",
              "uri": "/paymentmethods/crugive/giydcnzyga=",
              "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydcnzyga="
            },
            "links": [{
              "rel": "list",
              "type": "elasticpath.collections.links",
              "uri": "/paymentmethods/crugive",
              "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive"
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
              "uri": "/paymentmethods/crugive/giydembug4=",
              "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydembug4="
            },
            "links": [{
              "rel": "list",
              "type": "elasticpath.collections.links",
              "uri": "/paymentmethods/crugive",
              "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive"
            }, {
              "rel": "creditcard",
              "type": "cru.creditcards.named-credit-card",
              "uri": "/creditcards/paymentmethods/crugive/giydembug4=",
              "href": "https://cortex-gateway-stage.cru.org/cortex/creditcards/paymentmethods/crugive/giydembug4="
            }],
            "card-number": "1111",
            "card-type": "Visa",
            "cardholder-name": "Test Card",
            "expiry-month": "11",
            "expiry-year": "2019"
          }]);
        });
      self.$httpBackend.flush();
    });
  });
});
