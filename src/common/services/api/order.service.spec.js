import angular from 'angular';
import 'angular-mocks';
import omit from 'lodash/omit';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import formatAddressForTemplate from '../addressHelpers/formatAddressForTemplate';

import module, {existingPaymentMethodFlag} from './order.service';

import cartResponse from 'common/services/api/fixtures/cortex-cart-paymentmethodinfo-forms.fixture.js';
import paymentMethodResponse from 'common/services/api/fixtures/cortex-order-paymentmethod.fixture.js';
import paymentMethodSelectorResponse from 'common/services/api/fixtures/cortex-order-paymentmethod-selector.fixture.js';
import purchaseFormResponse from 'common/services/api/fixtures/cortex-order-purchaseform.fixture.js';
import donorDetailsResponse from 'common/services/api/fixtures/cortex-donordetails.fixture.js';
import billingAddressResponse from 'common/services/api/fixtures/cortex-billing-address.fixture.js';
import needInfoResponse from 'common/services/api/fixtures/cortex-order-needinfo.fixture.js';
import purchaseResponse from 'common/services/api/fixtures/cortex-purchase.fixture.js';

describe('order service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject((orderService, $httpBackend, $window, $log) => {
    self.orderService = orderService;
    self.$httpBackend = $httpBackend;
    self.$window = $window;
    self.$log = $log;
  }));

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  let cartResponseZoomMapped = {
    bankAccount: cartResponse._order[0]._paymentmethodinfo[0]._bankaccountform[0],
    creditCard: cartResponse._order[0]._paymentmethodinfo[0]._creditcardform[0],
    rawData: cartResponse
  };

  let purchaseFormResponseZoomMapped = {
    enhancedpurchaseform: purchaseFormResponse._order[0]._enhancedpurchaseform[0],
    rawData: purchaseFormResponse
  };

  describe('getDonorDetails', () => {
    it('should load the donorDetails', () => {
      let donorDetailsResponseZoomMapped = {
        donorDetails: donorDetailsResponse._order[0]._donordetails[0],
        email: donorDetailsResponse._order[0]._emailinfo[0]._email[0],
        rawData: donorDetailsResponse
      };

      //
      let expectedDonorDetails = omit(donorDetailsResponseZoomMapped.donorDetails, 'mailing-address');
      expectedDonorDetails.mailingAddress = formatAddressForTemplate(donorDetailsResponseZoomMapped.donorDetails['mailing-address']);
      expectedDonorDetails.email = donorDetailsResponseZoomMapped.email.email;

      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:donordetails,order:emailinfo:email')
        .respond(200, donorDetailsResponse);
      self.orderService.getDonorDetails()
        .subscribe((data) => {
          expect(data).toEqual(expectedDonorDetails);
        });
      self.$httpBackend.flush();
    });
    it('should set the mailingAddress country to US if undefined', () => {
      donorDetailsResponse._order[0]._donordetails[0]['mailing-address']['country-name'] = '';
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:donordetails,order:emailinfo:email')
        .respond(200, donorDetailsResponse);
      self.orderService.getDonorDetails()
        .subscribe((data) => {
          expect(data).toEqual(jasmine.objectContaining({
            mailingAddress: jasmine.objectContaining({country: 'US'})
          }));
        });
      self.$httpBackend.flush();
    });
  });

  describe('updateDonorDetails', () => {
    it('should send a request to save the donor details', () => {
      self.$httpBackend.expectPUT(
        'https://cortex-gateway-stage.cru.org/cortex/donordetails/orders/crugive/mjstoztgmqydaljrmeytqljumm3dmljymnrdallbhfsdqnbrmq2wimrqgu=',
        {
          "self": {
            "type": "elasticpath.donordetails.donor",
            "uri": "/donordetails/orders/crugive/mjstoztgmqydaljrmeytqljumm3dmljymnrdallbhfsdqnbrmq2wimrqgu=",
            "href": "https://cortex-gateway-stage.cru.org/cortex/donordetails/orders/crugive/mjstoztgmqydaljrmeytqljumm3dmljymnrdallbhfsdqnbrmq2wimrqgu="
          },
          'mailing-address': {
            'country-name': 'US',
            'street-address': '123 First St',
            'extended-address': 'Apt 123',
            'locality': 'Sacramento',
            'postal-code': '12345',
            'region': 'CA'
          },
          otherStuff: 'is also here'
        }
      ).respond(200, 'somedata');
      self.orderService.updateDonorDetails({
          "self": {
            "type": "elasticpath.donordetails.donor",
            "uri": "/donordetails/orders/crugive/mjstoztgmqydaljrmeytqljumm3dmljymnrdallbhfsdqnbrmq2wimrqgu=",
            "href": "https://cortex-gateway-stage.cru.org/cortex/donordetails/orders/crugive/mjstoztgmqydaljrmeytqljumm3dmljymnrdallbhfsdqnbrmq2wimrqgu="
          },
          mailingAddress: {
            country: 'US',
            streetAddress: '123 First St',
            extendedAddress: 'Apt 123',
            locality: 'Sacramento',
            postalCode: '12345',
            region: 'CA'
          },
          otherStuff: 'is also here'
        })
        .subscribe((data) => {
          expect(data).toEqual('somedata');
        });
      self.$httpBackend.flush();
    });
  });

  describe('addEmail', () => {
    it('should send a request to save the email', () => {
      self.$httpBackend.expectPOST(
        'https://cortex-gateway-stage.cru.org/cortex/emails/crugive',
        {email: 'someemail@somedomain.com'}
      ).respond(200, 'somedata');
      self.orderService.addEmail('someemail@somedomain.com')
        .subscribe((data) => {
          expect(data).toEqual('somedata');
        });
      self.$httpBackend.flush();
    });
  });

  describe('getPaymentMethodForms', () => {
    function setupRequest() {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform')
        .respond(200, cartResponse);
    }

    function initiateRequest() {
      self.orderService.getPaymentMethodForms()
        .subscribe((data) => {
          expect(data).toEqual(cartResponseZoomMapped);
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
        'https://cortex-gateway-stage.cru.org/cortex/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=?followLocation=true',
        paymentInfo
      ).respond(200, 'success');

      // cache getPaymentForms response to avoid another http request while testing
      self.orderService.paymentMethodForms = cartResponseZoomMapped;

      self.orderService.addBankAccountPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      self.$httpBackend.flush();
    });
  });

  describe('addCreditCardPayment', () => {
    it('should send a request to save the credit card payment info', () => {
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
        'https://cortex-gateway-stage.cru.org/cortex/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=?followLocation=true',
        paymentInfoWithoutCCV
      ).respond(200, 'success');

      // cache getPaymentForms response to avoid another http request while testing
      self.orderService.paymentMethodForms = cartResponseZoomMapped;

      self.orderService.addCreditCardPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      self.$httpBackend.flush();
    });
  });

  describe('addPaymentMethod', () => {
    it('should save a new bank account payment method', () => {
      spyOn(self.orderService,'addBankAccountPayment').and.callFake(() => Observable.of('success'));
      let paymentInfo = {
        'account-type': 'checking',
        'bank-name': 'First Bank',
        'display-account-number': '************9012',
        'encrypted-account-number': '**fake*encrypted**123456789012**',
        'routing-number': '123456789'
      };
      self.orderService.addPaymentMethod({
        bankAccount: paymentInfo
      }).subscribe((data) => {
        expect(data).toEqual('success');
      });
      expect(self.orderService.addBankAccountPayment).toHaveBeenCalledWith(paymentInfo);
    });
    it('should save a new credit card payment method', () => {
      spyOn(self.orderService,'addCreditCardPayment').and.callFake(() => Observable.of('credit card success'));
      spyOn(self.orderService,'addBillingAddress').and.callFake(() => Observable.of('billing address success'));
      spyOn(self.orderService,'storeCardSecurityCode');
      let paymentInfo = {
        'card-number': '**fake*encrypted**1234567890123456**',
        'card-type': 'VISA',
        'cardholder-name': 'Test Name',
        'expiry-month': '06',
        'expiry-year': '12',
        ccv: 'someEncryptedCCV...'
      };
      let billingAddress = {
        address: {
          'country-name': 'US',
          'street-address': '123 First St',
          'extended-address': 'Apt 123',
          'locality': 'Sacramento',
          'postal-code': '12345',
          'region': 'CA'
        },
        name: {
          'family-name': 'Lname',
          'given-name': 'Fname'
        }
      };
      self.orderService.addPaymentMethod({
        creditCard: paymentInfo,
        billingAddress: billingAddress
      }).subscribe((data) => {
        expect(data).toEqual(['credit card success', 'billing address success']);
      });
      expect(self.orderService.addCreditCardPayment).toHaveBeenCalledWith(paymentInfo);
      expect(self.orderService.addBillingAddress).toHaveBeenCalledWith(billingAddress);
      expect(self.orderService.storeCardSecurityCode).toHaveBeenCalledWith('someEncryptedCCV...');
    });
    it('should throw an error if the payment info doesn\'t contain a bank account or credit card', () => {
      self.orderService.addPaymentMethod({
          billingAddress: {}
        })
        .subscribe(() => {
            fail('the addPaymentMethod Observable completed successfully when it should have thrown an error');
          },
          (error) => {
            expect(error).toEqual('Error adding payment method. The data passed to orderService.addPaymentMethod did not contain bankAccount or creditCard data');
          });
    });
  });

  describe('getExistingPaymentMethods', () => {
    let expectedResponse = [{
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
      "display-account-number": "6548",
      "encrypted-account-number": "FAecKEPeUdW6KjbHo/na/hXlAS9OjZR51dlBgKKInf2mJh4bSP9WMvsKfAAL1rW7o6P9Rmx87dp0rDz0NArbWGIdsYeoFVOaIATzQqAe4ECuy0gfHcDva26HmgriGqRWkWPDeQvEdU9jENu0XKskxAjk2sBLJOHhoTCi8+LTLUrNwu40CSdT/PGNK8/lnO27wTZDPmc221xJ6hzB/F+0sRRvJhWky2oxA491MG+SRk7lWhccqSq5KtrijfA88Ebb/EivnsSJwqZgv/WNIP2u/V3dsMF1YRtyEsEAkmgxCCYBye2TT5ehIVOChQdlUbHxF+z/izrmn+0u2IYXvyX4dw==",
      "routing-number": "121042882",
      "chosen": true,
      "selectAction": "/paymentmethods/crugive/giydcmzyge=/selector/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq="
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
      "routing-number": "021000021",
      "selectAction": "/paymentmethods/crugive/giydcnzyga=/selector/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq="
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
      "expiry-year": "2019",
      "selectAction": "/paymentmethods/crugive/giydembug4=/selector/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq="
    }];

    it('should load a user\'s existing payment methods', () => {
      self.$httpBackend.expectGET(
        'https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:selector:choice,order:paymentmethodinfo:selector:choice:description,order:paymentmethodinfo:selector:chosen,order:paymentmethodinfo:selector:chosen:description'
      ).respond(200, paymentMethodSelectorResponse);

      self.orderService.getExistingPaymentMethods()
        .subscribe((data) => {
          expect(data).toEqual(expectedResponse);
        });

      self.$httpBackend.flush();
    });
    it('should load a user\'s existing payment methods even if there is no chosen one', () => {
      // Move the payment method in chosen to be one of the choices for this test
      paymentMethodSelectorResponse._order[0]._paymentmethodinfo[0]._selector[0]._choice.push(paymentMethodSelectorResponse._order[0]._paymentmethodinfo[0]._selector[0]._chosen[0]);
      delete paymentMethodSelectorResponse._order[0]._paymentmethodinfo[0]._selector[0]._chosen;

      self.$httpBackend.expectGET(
        'https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:selector:choice,order:paymentmethodinfo:selector:choice:description,order:paymentmethodinfo:selector:chosen,order:paymentmethodinfo:selector:chosen:description'
      ).respond(200, paymentMethodSelectorResponse);

      // Since there is no chosen element, this payment method should not be marked as chosen
      delete expectedResponse[0].chosen;

      self.orderService.getExistingPaymentMethods()
        .subscribe((data) => {
          expect(data).toEqual(expectedResponse);
        });

      self.$httpBackend.flush();
    });
  });

  describe('selectPaymentMethod', () => {
    it('should post the URI of the selected payment method for cortex to select it', () => {
      self.$httpBackend.expectPOST(
        'https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydembug4=/selector/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq=',
        {}
      ).respond(200, 'success');

      self.orderService.selectPaymentMethod('/paymentmethods/crugive/giydembug4=/selector/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq=')
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      self.$httpBackend.flush();
    });
  });

  describe('addBillingAddress', () => {
    it('should send a request to save the new billing address', () => {
      self.$httpBackend.expectPOST(
        'https://cortex-gateway-stage.cru.org/cortex/addresses/crugive',
        {
          address: {
            'country-name': 'US',
            'street-address': '123 First St',
            'extended-address': 'Apt 123',
            'locality': 'Sacramento',
            'postal-code': '12345',
            'region': 'CA'
          },
          name: {
            'family-name': 'Lname',
            'given-name': 'Fname'
          }
        }
      ).respond(200, 'success');

      self.orderService.addBillingAddress({
          address: {
            country: 'US',
            streetAddress: '123 First St',
            extendedAddress: 'Apt 123',
            locality: 'Sacramento',
            postalCode: '12345',
            region: 'CA'
          },
          name: {
            'family-name': 'Lname',
            'given-name': 'Fname'
          }
        })
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      self.$httpBackend.flush();
    });
  });

  describe('getBillingAddress', () => {
    it('should send a request to save the new billing address', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:billingaddressinfo:billingaddress')
        .respond(200, billingAddressResponse);

      self.orderService.getBillingAddress()
        .subscribe((data) => {
          expect(data).toEqual({
            self: {
              type: 'elasticpath.addresses.address',
              uri: '/addresses/crugive/gm4dkyldmuzgkljwgbqtmljuha2dqllcge4dsljqge4gembzmvtdczbrme=',
              href: 'https://cortex-gateway-stage.cru.org/cortex/addresses/crugive/gm4dkyldmuzgkljwgbqtmljuha2dqllcge4dsljqge4gembzmvtdczbrme='
            },
            links: [{
              rel: 'profile',
              rev: 'addresses',
              type: 'elasticpath.profiles.profile',
              uri: '/profiles/crugive/gjqwinrxmfrgillemi2wkljumqzteljzmfsgellcmqzdmojqgyzdoyjsga=',
              href: 'https://cortex-gateway-stage.cru.org/cortex/profiles/crugive/gjqwinrxmfrgillemi2wkljumqzteljzmfsgellcmqzdmojqgyzdoyjsga='
            }, {
              rel: 'list',
              type: 'elasticpath.collections.links',
              uri: '/addresses/crugive',
              href: 'https://cortex-gateway-stage.cru.org/cortex/addresses/crugive'
            }],
            address: {
              country: 'US',
              streetAddress: '123 Asdf St',
              extendedAddress: 'Apt 45',
              locality: 'State',
              region: 'AL',
              postalCode: '12345'
            },
            name: {
              'family-name': 'none',
              'given-name': 'none'
            }
          });
        });

      self.$httpBackend.flush();
    });
  });

  describe('getCurrentPayment', () => {
    it('should retrieve the current payment details', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:paymentmethod')
        .respond(200, paymentMethodResponse);

      self.orderService.getCurrentPayment()
        .subscribe((data) => {
          expect(data).toEqual(paymentMethodResponse._order[0]._paymentmethodinfo[0]._paymentmethod[0]);
        });

      self.$httpBackend.flush();
    });
  });

  describe('getPurchaseForms', () => {
    it('should send a request to get the payment form links', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:enhancedpurchaseform').respond(200, purchaseFormResponse);
      self.orderService.getPurchaseForm()
        .subscribe((data) => {
          expect(data).toEqual(purchaseFormResponseZoomMapped);
        });
      self.$httpBackend.flush();
    });
  });

  describe('checkErrors', () => {
    it('should send a request to get the payment form links', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:needinfo').respond(200, needInfoResponse);
      self.orderService.checkErrors()
        .subscribe((data) => {
          expect(data).toEqual(['email-info', 'billing-address-info', 'payment-method-info']);
        });
      self.$httpBackend.flush();
      expect(self.$log.error.logs[0]).toEqual(['The user was presented with these `needinfo` errors. They should have been caught earlier in the checkout process.', ['email-info', 'billing-address-info', 'payment-method-info']]);
    });
    it('should return undefined and not log anything if there are no errors', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:needinfo').respond(200, undefined);
      self.orderService.checkErrors()
        .subscribe((data) => {
          expect(data).toBeUndefined();
        });
      self.$httpBackend.flush();
      self.$log.assertEmpty();
    });
  });

  describe('submit', () => {
    beforeEach(() => {
      // Avoid another http request while testing
      spyOn(self.orderService, 'getPurchaseForm').and.callFake(() => Observable.of(purchaseFormResponseZoomMapped));
    });
    it('should send a request to finalize the purchase', () => {
      self.$httpBackend.expectPOST(
        'https://cortex-gateway-stage.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?followLocation=true',
        {}
      ).respond(200, purchaseResponse);

      self.orderService.submit()
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse);
        });

      self.$httpBackend.flush();
    });
    it('should send a request to finalize the purchase and with a CCV', () => {
      self.$httpBackend.expectPOST(
        'https://cortex-gateway-stage.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?followLocation=true',
        {"security-code": '123'}
      ).respond(200, purchaseResponse);

      self.orderService.submit('123')
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse);
        });

      self.$httpBackend.flush();
    });
  });

  describe('storeCardSecurityCode', () => {
    it('should store the encrypted ccv', () => {
      let encryptedCcv = 'g43wj7sevtiusehiuhrv3478wehr783awhsuircahneyisuhwaf7eysu';
      self.orderService.storeCardSecurityCode(encryptedCcv);
      expect(self.$window.sessionStorage.getItem('ccv')).toEqual(encryptedCcv);
    });
    it('should allow \'existing payment method\' to be stored', () => {
      let encryptedCcv = existingPaymentMethodFlag;
      self.orderService.storeCardSecurityCode(encryptedCcv);
      expect(self.$window.sessionStorage.getItem('ccv')).toEqual(encryptedCcv);
    });
    it('should throw an error when it looks like the security code is unencrypted (has less than 50 chars)', () => {
      expect(() => self.orderService.storeCardSecurityCode('1234')).toThrowError('The CCV should be encrypted and the provided CCV looks like it is too short to be encrypted correctly');
    });
  });

  describe('retrieveCardSecurityCode', () => {
    it('should return the stored the encrypted ccv', () => {
      let encryptedCcv = 'g43wj7sevtiusehiuhrv3478wehr783awhsuircahneyisuhwaf7eysu';
      self.$window.sessionStorage.setItem('ccv', encryptedCcv);
      expect(self.orderService.retrieveCardSecurityCode()).toEqual(encryptedCcv);
    });
  });

  describe('clearCardSecurityCode', () => {
    it('should clear the stored the encrypted ccv', () => {
      let encryptedCcv = 'g43wj7sevtiusehiuhrv3478wehr783awhsuircahneyisuhwaf7eysu';
      self.$window.sessionStorage.setItem('ccv', encryptedCcv);
      self.orderService.clearCardSecurityCode();
      expect(self.$window.sessionStorage.getItem('ccv')).toBeNull();
    });
  });

  describe('storeLastPurchaseLink', () => {
    it('should save the link to the completed purchase', () => {
      self.orderService.storeLastPurchaseLink('/purchases/crugive/giydanbt=');
      expect(self.$window.sessionStorage.getItem('lastPurchaseLink')).toEqual('/purchases/crugive/giydanbt=');
    });
  });

  describe('retrieveLastPurchaseLink', () => {
    it('should save the link to the completed purchase', () => {
      self.$window.sessionStorage.setItem('lastPurchaseLink', '/purchases/crugive/hiydanbt=');
      expect(self.orderService.retrieveLastPurchaseLink()).toEqual('/purchases/crugive/hiydanbt=');
    });
  });
});
