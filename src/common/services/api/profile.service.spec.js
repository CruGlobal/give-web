import angular from 'angular';
import 'angular-mocks';
import omit from 'lodash/omit';
import assign from 'lodash/assign';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import module from './profile.service';

import formatAddressForTemplate from '../addressHelpers/formatAddressForTemplate';

import emailsResponse from './fixtures/cortex-profile-emails.fixture.js';
import donorDetailsResponse from './fixtures/cortex-profile-donordetails.fixture';
import givingProfileResponse from './fixtures/cortex-profile-giving.fixture';
import paymentmethodsResponse from './fixtures/cortex-profile-paymentmethods.fixture.js';
import paymentmethodsFormsResponse from './fixtures/cortex-profile-paymentmethods-forms.fixture.js';
import paymentmethodsWithDonationsResponse from 'common/services/api/fixtures/cortex-profile-paymentmethods-with-donations.fixture.js';
import purchaseResponse from 'common/services/api/fixtures/cortex-purchase.fixture.js';

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

  describe('getPaymentMethodsWithDonations', () => {
    it('should load the user\'s saved payment methods with donations', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/profiles/crugive/default?zoom=selfservicepaymentmethods:element,selfservicepaymentmethods:element:recurringgifts')
        .respond(200, paymentmethodsWithDonationsResponse);
      self.profileService.getPaymentMethodsWithDonations()
        .subscribe((data) => {
          expect(data).toEqual([
            paymentmethodsWithDonationsResponse._selfservicepaymentmethods[0]._element[0],
            paymentmethodsWithDonationsResponse._selfservicepaymentmethods[0]._element[1]
          ]);
        });
      self.$httpBackend.flush();
    });
  });

  describe('updateRecurringGifts', () => {
    it('should update recurring gifts', () => {
      let recurringGifts = {
        self: {
          uri: '/donations/recurring/crugive/paymentmethods/giydimjygq='
        }
      };
      self.$httpBackend.expectPUT('https://cortex-gateway-stage.cru.org/cortex'+recurringGifts.self.uri)
        .respond(200, 'success');
      self.profileService.updateRecurringGifts(recurringGifts)
        .subscribe((data) => {
          expect(data).toEqual('success');
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

  describe('getGivingProfile', () => {
    it( 'should load the giving profile with spouse', () => {
      self.$httpBackend.expectGET( 'https://cortex-gateway-stage.cru.org/cortex/profiles/crugive/default?zoom=donordetails,addresses:mailingaddress,emails:element,phonenumbers:element,addspousedetails,givingdashboard:yeartodateamount' )
        .respond( 200, givingProfileResponse );

      self.profileService.getGivingProfile().subscribe( ( profile ) => {
        expect( profile ).toEqual( jasmine.objectContaining( {
          name:       'Mark & Julia Tubbs',
          email:      'mt@example.com',
          address:    jasmine.any( Object ),
          phone:      '(909) 337-2433',
          donorNumber: '447072430',
          yearToDate: 0
        } ) );
      } );
      self.$httpBackend.flush();
    } );

    it( 'should load the giving profile without spouse', () => {
      self.$httpBackend.expectGET( 'https://cortex-gateway-stage.cru.org/cortex/profiles/crugive/default?zoom=donordetails,addresses:mailingaddress,emails:element,phonenumbers:element,addspousedetails,givingdashboard:yeartodateamount' )
        .respond( 200, omit( givingProfileResponse, ['_addspousedetails', '_emails', '_givingdashboard', '_phonenumbers', '_addresses', '_donordetails'] ) );

      self.profileService.getGivingProfile().subscribe( ( profile ) => {
        expect( profile ).toEqual( jasmine.objectContaining( {
          name: 'Mark Tubbs', email: undefined, address: undefined, phone: undefined, yearToDate: undefined, donorNumber: undefined
        } ) );
      } );
      self.$httpBackend.flush();
    } );
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

  describe('updatePaymentMethod', () => {
    it('should update a bank account', () => {
      self.$httpBackend.expectPUT('https://cortex-gateway-stage.cru.org/cortex/paymentUri',
        { 'bank-name': 'Some Bank' }
      ).respond(200, null);
      self.profileService.updatePaymentMethod({ self: { uri: 'paymentUri' } }, { bankAccount: { 'bank-name': 'Some Bank' } })
        .subscribe(null, () => fail());
      self.$httpBackend.flush();
    });
    it('should update a credit card', () => {
      self.$httpBackend.expectPUT('https://cortex-gateway-stage.cru.org/cortex/paymentUri',
        { 'cardholder-name': 'Some Person', address: { 'street-address': 'Some Address||||||', 'extended-address': '', locality: '', 'postal-code': '', region: ''} }
      ).respond(200, null);
      self.profileService.updatePaymentMethod({ self: { uri: 'paymentUri' } }, { creditCard: { 'cardholder-name': 'Some Person', address: { streetAddress: 'Some Address' } } })
        .subscribe(null, () => fail());
      self.$httpBackend.flush();
    });
    it('should update a credit card with no billing address (api will use mailing address)', () => {
      self.$httpBackend.expectPUT('https://cortex-gateway-stage.cru.org/cortex/paymentUri',
        { 'cardholder-name': 'Some Person' }
      ).respond(200, null);
      self.profileService.updatePaymentMethod({ self: { uri: 'paymentUri' } }, { creditCard: { 'cardholder-name': 'Some Person', address: undefined } })
        .subscribe(null, () => fail());
      self.$httpBackend.flush();
    });
    it('should handle a missing bank account or credit card', () => {
      self.profileService.updatePaymentMethod({ self: { uri: 'paymentUri' } }, {})
        .subscribe(() => fail(), (error) => {
          expect(error).toEqual('Error updating payment method. The data passed to profileService.updatePaymentMethod did not contain bankAccount or creditCard data.');
        });
    });
  });

  describe('deletePaymentMethod', () => {
    it('should delete payment method', () => {
      let uri = '/uri';
      self.$httpBackend.expectDELETE('https://cortex-gateway-stage.cru.org/cortex'+uri)
        .respond(200, 'success');
      self.profileService.deletePaymentMethod(uri)
        .subscribe((data) => {
          expect(data).toEqual('success');
        });
      self.$httpBackend.flush();
    })
  })

  describe('getPurchase', () => {
    it('should load the purchase specified by the uri', () => {
      let modifiedPurchaseResponse = angular.copy(purchaseResponse);

      let expectedPurchaseData = {
        donorDetails: modifiedPurchaseResponse._donordetails[0],
        paymentMeans: modifiedPurchaseResponse._paymentmeans[0]._element[0],
        lineItems: [
          assign(omit(modifiedPurchaseResponse._lineitems[0]._element[0], ['_code', '_rate']), {
            code: modifiedPurchaseResponse._lineitems[0]._element[0]._code[0],
            rate: modifiedPurchaseResponse._lineitems[0]._element[0]._rate[0]
          }),
          assign(omit(modifiedPurchaseResponse._lineitems[0]._element[1], ['_code', '_rate']), {
            code: modifiedPurchaseResponse._lineitems[0]._element[1]._code[0],
            rate: modifiedPurchaseResponse._lineitems[0]._element[1]._rate[0]
          })
        ],
        rateTotals: modifiedPurchaseResponse._ratetotals[0]._element,
        rawData: purchaseResponse
      };

      expectedPurchaseData.donorDetails.mailingAddress = formatAddressForTemplate(expectedPurchaseData.donorDetails['mailing-address']);
      delete expectedPurchaseData.donorDetails['mailing-address'];
      expectedPurchaseData.paymentMeans.address = formatAddressForTemplate(expectedPurchaseData.paymentMeans['billing-address'].address);
      delete expectedPurchaseData.paymentMeans['billing-address'];

      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=?zoom=donordetails,paymentmeans:element,lineitems:element,lineitems:element:code,lineitems:element:rate,ratetotals:element')
        .respond(200, purchaseResponse);
      self.profileService.getPurchase('/purchases/crugive/giydanbt=')
        .subscribe((data) => {
          expect(data).toEqual(expectedPurchaseData);
        });
      self.$httpBackend.flush();
    });
  });

  describe('getDonorDetails', () => {
    it('should load the user\'s donorDetails', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/profiles/crugive/default?zoom=donordetails')
        .respond(200, donorDetailsResponse);

      let expectedDonorDetails = angular.copy(donorDetailsResponse['_donordetails'][0]);
      expectedDonorDetails.mailingAddress = formatAddressForTemplate(expectedDonorDetails['mailing-address']);
      expectedDonorDetails = omit(expectedDonorDetails, 'mailing-address');
      self.profileService.getDonorDetails()
        .subscribe((donorDetails) => {
          expect(donorDetails).toEqual(expectedDonorDetails);
        });
      self.$httpBackend.flush();
    });
  });
});
