import angular from 'angular';
import 'angular-mocks';
import module from './order.service';


describe('order service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject((orderService, $httpBackend) => {
    self.orderService = orderService;
    self.$httpBackend = $httpBackend;
  }));

  afterEach(function() {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  let paymentFormsResponse = {
    links: [
      {
        rel: 'createbankaccountfororderaction',
        uri: '/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq='
      }
    ],
    "_order": [
      {
        "_paymentmethodinfo": [
          {
            "_bankaccountform": [
              {
                "links": [
                  {
                    "rel": "createbankaccountfororderaction",
                    "uri": "/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=",
                    "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq="
                  }
                ]
              }
            ],
            "_creditcardform": [
              {
                "links": [
                  {
                    "rel": "createcreditcardfororderaction",
                    "uri": "/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=",
                    "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq="
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  let paymentFormsResponseZoomMapped = {
    bankAccount: paymentFormsResponse._order[0]._paymentmethodinfo[0]._bankaccountform[0],
    creditCard: paymentFormsResponse._order[0]._paymentmethodinfo[0]._creditcardform[0],
    rawData: paymentFormsResponse
  };

  describe('getPaymentForms', () => {
    function setupRequest() {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform').respond(200, paymentFormsResponse);
    }

    function initiateRequest(){
      self.orderService.getPaymentForms()
        .subscribe((data) => {
          expect(data).toEqual(paymentFormsResponseZoomMapped);
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
      self.orderService.paymentTypes = paymentFormsResponseZoomMapped;

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
      self.orderService.paymentTypes = paymentFormsResponseZoomMapped;

      self.orderService.addCreditCardPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      self.$httpBackend.flush();
    });
  });
});
