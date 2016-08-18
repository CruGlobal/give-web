import angular from 'angular';
import 'angular-mocks';
import module from './order.service';

import cartResponse from 'common/services/api/fixtures/cortex-cart-paymentmethodinfo-forms.fixture.js';
import paymentMethodResponse from 'common/services/api/fixtures/cortex-paymentmethod.fixture.js';
import purchaseFormResponse from 'common/services/api/fixtures/cortex-purchaseform.fixture.js';

describe('order service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject((orderService, $httpBackend, $window) => {
    self.orderService = orderService;
    self.$httpBackend = $httpBackend;
    self.$window = $window;
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
    purchaseform: purchaseFormResponse._order[0]._purchaseform[0],
    enhancedpurchaseform: purchaseFormResponse._order[0]._enhancedpurchaseform[0],
    rawData: purchaseFormResponse
  };

  describe('getPaymentMethodForms', () => {
    function setupRequest() {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform').respond(200, cartResponse);
    }

    function initiateRequest(){
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
        'expiry-year': '12'
      };

      self.$httpBackend.expectPOST(
        'https://cortex-gateway-stage.cru.org/cortex/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=?followLocation=true',
        paymentInfo
      ).respond(200, 'success');

      // cache getPaymentForms response to avoid another http request while testing
      self.orderService.paymentMethodForms = cartResponseZoomMapped;

      self.orderService.addCreditCardPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      self.$httpBackend.flush();
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
  });

  describe('getPurchaseForms', () => {
    function setupRequest() {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:purchaseform,order:enhancedpurchaseform').respond(200, purchaseFormResponse);
    }

    function initiateRequest(){
      self.orderService.getPurchaseForms()
        .subscribe((data) => {
          expect(data).toEqual(purchaseFormResponseZoomMapped);
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

  describe('submit', () => {
    it('should send a request to finalize the purchase', () => {
      self.$httpBackend.expectPOST(
        'https://cortex-gateway-stage.cru.org/cortex/purchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=',
      ).respond(200, 'success');

      // cache getPaymentForms response to avoid another http request while testing
      self.orderService.purchaseForms = purchaseFormResponseZoomMapped;

      self.orderService.submit()
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      self.$httpBackend.flush();
    });
  });

  describe('submitWithCcv', () => {
    it('should send a request to finalize the purchase and send the saved CCV', () => {
      self.$httpBackend.expectPOST(
        'https://cortex-gateway-stage.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=',
        {"security-code": '123'}
      ).respond(200, 'success');

      // cache getPaymentForms response to avoid another http request while testing
      self.orderService.purchaseForms = purchaseFormResponseZoomMapped;

      self.orderService.submitWithCcv('123')
        .subscribe((data) => {
          expect(data).toEqual('success');
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
});
