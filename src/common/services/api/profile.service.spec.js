import angular from 'angular';
import 'angular-mocks';
import omit from 'lodash/omit';
import assign from 'lodash/assign';
import cloneDeep from 'lodash/cloneDeep';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import module from './profile.service';

import formatAddressForTemplate from '../addressHelpers/formatAddressForTemplate';

import emailsResponse from './fixtures/cortex-profile-emails.fixture.js';
import donorDetailsResponse from './fixtures/cortex-profile-donordetails.fixture';
import givingProfileResponse from './fixtures/cortex-profile-giving.fixture';
import paymentmethodsResponse from './fixtures/cortex-profile-paymentmethods.fixture.js';
import paymentmethodResponse from './fixtures/cortex-profile-paymentmethod.fixture.js';
import paymentmethodsFormsResponse from './fixtures/cortex-profile-paymentmethods-forms.fixture.js';
import paymentmethodsWithDonationsResponse from 'common/services/api/fixtures/cortex-profile-paymentmethods-with-donations.fixture.js';
import purchaseResponse from 'common/services/api/fixtures/cortex-purchase.fixture.js';
import phoneNumbersResponse from 'common/services/api/fixtures/cortex-profile-phonenumbers.fixture.js';
import selfserviceDonorDetailsResponse from 'common/services/api/fixtures/cortex-profile-selfservicedonordetails.fixture.js';
import mailingAddressResponse from 'common/services/api/fixtures/cortex-profile-mailingaddress.fixture.js';
import RecurringGiftModel from 'common/models/recurringGift.model';

const paymentMethodForms = cloneDeep(
  paymentmethodsFormsResponse._paymentmethods[0]._element,
);
angular.forEach(paymentMethodForms, (form) => {
  form.selfservicepaymentinstrumentform =
    form._selfservicepaymentinstrumentform[0];
  delete form._selfservicepaymentinstrumentform;
});

const paymentmethodsFormsResponseZoomMapped = {
  paymentMethodForms: paymentMethodForms,
  rawData: paymentmethodsFormsResponse,
};

describe('profile service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject((profileService, analyticsFactory, $httpBackend) => {
    self.profileService = profileService;
    self.analyticsFactory = analyticsFactory;
    self.$httpBackend = $httpBackend;
  }));

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getEmail', () => {
    it("should load the user's email", () => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=emails:element',
        )
        .respond(200, emailsResponse);
      self.profileService.getEmails().subscribe((data) => {
        expect(data).toBeTruthy();
      });
      self.$httpBackend.flush();
    });
  });

  describe('getPaymentMethods', () => {
    const testGetPaymentMethods = (paymentMethodsResponse) => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=selfservicepaymentinstruments:element',
        )
        .respond(200, paymentMethodsResponse);

      const expectedPaymentMethods = angular.copy(
        paymentMethodsResponse._selfservicepaymentinstruments[0]._element,
      );
      expectedPaymentMethods[0].address = {
        country: 'US',
        streetAddress: '123 First St',
        extendedAddress: '',
        locality: 'Sacramento',
        region: 'CA',
        postalCode: '12345',
      };
      expectedPaymentMethods[0].id = expectedPaymentMethods[0].self.uri
        .split('/')
        .pop();
      expectedPaymentMethods[1].id = expectedPaymentMethods[1].self.uri
        .split('/')
        .pop();
      self.profileService.getPaymentMethods().subscribe((data) => {
        expect(data).toEqual([
          expectedPaymentMethods[1],
          expectedPaymentMethods[0],
        ]);
      });
      self.$httpBackend.flush();
    };
    it("should load the user's saved payment methods", () => {
      testGetPaymentMethods(paymentmethodsResponse);
    });

    it('should format the address', () => {
      const incomingPaymentMethodsResponse = angular.copy(
        paymentmethodsResponse,
      );
      const incomingCreditCard =
        incomingPaymentMethodsResponse._selfservicepaymentinstruments[0]
          ._element[0];
      incomingCreditCard.address = undefined;
      incomingCreditCard['payment-instrument-identification-attributes'] = {
        'country-name': 'US',
        'street-address': '123 First St',
        'extended-address': 'Apt 123',
        locality: 'Sacramento',
        'postal-code': '12345',
        region: 'CA',
      };
      testGetPaymentMethods(incomingPaymentMethodsResponse);
    });
  });

  describe('getPaymentMethod', () => {
    const testGetPaymentMethod = (paymentMethodResponse) => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/crugive/giydiojyg4=',
        )
        .respond(200, paymentMethodResponse);

      const expectedPaymentMethod = angular.copy(paymentMethodResponse);
      expectedPaymentMethod.id = expectedPaymentMethod.self.uri
        .split('/')
        .pop();
      expectedPaymentMethod.address = {
        'country-name': 'US',
        'extended-address': '',
        locality: 'Franklin',
        'postal-code': '46131-1632',
        region: 'IN',
        'street-address': '198 W King St',
      };
      self.profileService
        .getPaymentMethod('/selfservicepaymentinstruments/crugive/giydiojyg4=')
        .subscribe((data) => {
          expect(data.id).toEqual(expectedPaymentMethod.id);
          expect(data.address['card-number']).toEqual(
            expectedPaymentMethod.address['card-number'],
          );
          expect(data.address.streetAddress).toEqual(
            expectedPaymentMethod.address['street-address'],
          );
        });
      self.$httpBackend.flush();
    };

    it("should load a user's payment method", () => {
      testGetPaymentMethod(paymentmethodResponse);
    });

    it('should format the address', () => {
      const incomingPaymentMethodResponse = angular.copy(paymentmethodResponse);
      incomingPaymentMethodResponse.address = undefined;
      incomingPaymentMethodResponse[
        'payment-instrument-identification-attributes'
      ] = {
        'country-name': 'US',
        'extended-address': '',
        locality: 'Franklin',
        'postal-code': '46131-1632',
        region: 'IN',
        'street-address': '198 W King St',
      };
      testGetPaymentMethod(incomingPaymentMethodResponse);
    });
  });

  describe('getPaymentMethodsWithDonations', () => {
    it("should load the user's saved payment methods with donations", () => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=selfservicepaymentinstruments:element,selfservicepaymentinstruments:element:recurringgifts',
        )
        .respond(200, paymentmethodsWithDonationsResponse);

      const expectedData = cloneDeep(
        paymentmethodsWithDonationsResponse._selfservicepaymentinstruments[0]
          ._element,
      ).map((paymentMethod) => {
        paymentMethod.recurringGifts = [];
        delete paymentMethod._recurringgifts;
        return paymentMethod;
      });
      expectedData[1].recurringGifts = [
        expect.any(RecurringGiftModel),
        expect.any(RecurringGiftModel),
      ];
      self.profileService.getPaymentMethodsWithDonations().subscribe((data) => {
        expect(data).toEqual(expectedData);
      });
      self.$httpBackend.flush();
    });
  });

  describe('getPaymentMethodForms', () => {
    function setupRequest() {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=paymentmethods:element,paymentmethods:element:selfservicepaymentinstrumentform',
        )
        .respond(200, paymentmethodsFormsResponse);
    }

    function initiateRequest() {
      self.profileService.getPaymentMethodForms().subscribe((data) => {
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
      const paymentInfo = {
        'account-type': 'checking',
        'bank-name': 'First Bank',
        'display-account-number': '************9012',
        'encrypted-account-number': '**fake*encrypted**123456789012**',
        'routing-number': '123456789',
      };

      const expectedPostData = {
        'payment-instrument-identification-form': paymentInfo,
      };

      self.$httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/paymentmethods/profiles/crugive/mm3gkodgmztgcljtgm2dsljumu2teljygi2weljzgjsdomryha3tkzrymu=/gftgenrymm4dgllega2geljug44dillcga3dollbhe2wcnbugazdgobqgy=/selfservicepaymentinstrument/form?FollowLocation=true',
          expectedPostData,
        )
        .respond(200, 'success');

      // cache getPaymentForms response to avoid another http request while testing
      self.profileService.paymentMethodForms =
        paymentmethodsFormsResponseZoomMapped;

      self.profileService
        .addBankAccountPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      self.$httpBackend.flush();
    });
  });

  describe('addCreditCardPayment', () => {
    it('should send a request to save the credit card payment info with no billing address', () => {
      const paymentInfo = {
        'card-number': '**fake*encrypted**1234567890123456**',
        'card-type': 'VISA',
        'cardholder-name': 'Test Name',
        'expiry-month': '06',
        'expiry-year': '12',
        cvv: 'someEncryptedCVV...',
      };

      const expectedPostData = {
        'payment-instrument-identification-form': paymentInfo,
      };
      delete expectedPostData['payment-instrument-identification-form'].cvv;

      self.$httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/paymentmethods/profiles/crugive/mm3gkodgmztgcljtgm2dsljumu2teljygi2weljzgjsdomryha3tkzrymu=/g4ygeodbg42tilldha4wiljrgfswellbgvsdmllfgu4wenjxmu2ton3bgm=/selfservicepaymentinstrument/form?FollowLocation=true',
          expectedPostData,
        )
        .respond(200, 'success');

      // cache getPaymentForms response to avoid another http request while testing
      self.profileService.paymentMethodForms =
        paymentmethodsFormsResponseZoomMapped;

      self.profileService
        .addCreditCardPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      self.$httpBackend.flush();
    });

    it('should send a request to save the credit card payment info with a billing address', () => {
      const paymentInfo = {
        address: {
          country: 'US',
          streetAddress: '123 First St',
          extendedAddress: 'Apt 123',
          locality: 'Sacramento',
          postalCode: '12345',
          region: 'CA',
        },
        'card-number': '**fake*encrypted**1234567890123456**',
        'card-type': 'VISA',
        'cardholder-name': 'Test Name',
        'expiry-month': '06',
        'expiry-year': '12',
        cvv: 'someEncryptedCVV...',
      };

      const expectedPostData = {
        'billing-address': {
          address: {
            'country-name': 'US',
            'street-address': '123 First St',
            'extended-address': 'Apt 123',
            locality: 'Sacramento',
            'postal-code': '12345',
            region: 'CA',
          },
        },
        'payment-instrument-identification-form': {
          'card-number': '**fake*encrypted**1234567890123456**',
          'card-type': 'VISA',
          'cardholder-name': 'Test Name',
          'expiry-month': '06',
          'expiry-year': '12',
        },
      };

      self.$httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/paymentmethods/profiles/crugive/mm3gkodgmztgcljtgm2dsljumu2teljygi2weljzgjsdomryha3tkzrymu=/g4ygeodbg42tilldha4wiljrgfswellbgvsdmllfgu4wenjxmu2ton3bgm=/selfservicepaymentinstrument/form?FollowLocation=true',
          expectedPostData,
        )
        .respond(200, 'success');

      // cache getPaymentForms response to avoid another http request while testing
      self.profileService.paymentMethodForms =
        paymentmethodsFormsResponseZoomMapped;

      self.profileService
        .addCreditCardPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      self.$httpBackend.flush();
    });
  });

  describe('getGivingProfile', () => {
    it('should load the giving profile with spouse', () => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=donordetails,addresses:mailingaddress,emails:element,phonenumbers:element,addspousedetails,givingdashboard:yeartodateamount',
        )
        .respond(200, givingProfileResponse);

      self.profileService.getGivingProfile().subscribe((profile) => {
        expect(profile).toEqual(
          expect.objectContaining({
            name: 'Mark & Julia Tubbs',
            email: 'mt@example.com',
            address: expect.any(Object),
            phone: '(909) 337-2433',
            donorNumber: '447072430',
            yearToDate: 0,
          }),
        );
      });
      self.$httpBackend.flush();
    });

    it('should load the giving profile without spouse', () => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=donordetails,addresses:mailingaddress,emails:element,phonenumbers:element,addspousedetails,givingdashboard:yeartodateamount',
        )
        .respond(
          200,
          omit(givingProfileResponse, [
            '_addspousedetails',
            '_emails',
            '_givingdashboard',
            '_phonenumbers',
            '_addresses',
            '_donordetails',
          ]),
        );

      self.profileService.getGivingProfile().subscribe((profile) => {
        expect(profile).toEqual(
          expect.objectContaining({
            name: 'Mark Tubbs',
            email: undefined,
            address: undefined,
            phone: undefined,
            yearToDate: undefined,
            donorNumber: undefined,
          }),
        );
      });
      self.$httpBackend.flush();
    });

    it('should load the giving profile with an organization', () => {
      const orgGivingProfileResponse = angular.copy(givingProfileResponse);
      orgGivingProfileResponse['_donordetails'][0]['donor-type'] =
        'Organization';
      orgGivingProfileResponse['_donordetails'][0]['organization-name'] =
        'Organization XYZ';

      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=donordetails,addresses:mailingaddress,emails:element,phonenumbers:element,addspousedetails,givingdashboard:yeartodateamount',
        )
        .respond(200, orgGivingProfileResponse);

      self.profileService.getGivingProfile().subscribe((profile) => {
        expect(profile).toEqual(
          expect.objectContaining({
            name: 'Organization XYZ',
          }),
        );
      });
      self.$httpBackend.flush();
    });
  });

  describe('addPaymentMethod', () => {
    it('should save a new bank account payment method', () => {
      jest
        .spyOn(self.profileService, 'addBankAccountPayment')
        .mockReturnValue(Observable.of('success'));
      jest.spyOn(self.analyticsFactory, 'track').mockReturnValue(() => {});
      const paymentInfo = {
        'account-type': 'checking',
        'bank-name': 'First Bank',
        'display-account-number': '************9012',
        'encrypted-account-number': '**fake*encrypted**123456789012**',
        'routing-number': '123456789',
      };
      self.profileService
        .addPaymentMethod({
          bankAccount: paymentInfo,
        })
        .subscribe((data) => {
          expect(data).toEqual('success');
        });

      expect(self.profileService.addBankAccountPayment).toHaveBeenCalledWith(
        paymentInfo,
      );
      expect(self.analyticsFactory.track).toHaveBeenCalledWith(
        'add-payment-method',
      );
    });

    it('should save a new credit card payment method', () => {
      jest
        .spyOn(self.profileService, 'addCreditCardPayment')
        .mockReturnValue(Observable.of('credit card success'));
      jest.spyOn(self.analyticsFactory, 'track').mockReturnValue(() => {});

      const paymentInfo = {
        address: {
          'country-name': 'US',
          'extended-address': '',
          locality: 'Sacramento',
          'postal-code': '12345',
          region: 'CA',
          'street-address': '123 First St',
        },
        'card-number': '**fake*encrypted**1234567890123456**',
        'card-type': 'VISA',
        'cardholder-name': 'Test Name',
        'expiry-month': '06',
        'expiry-year': '12',
        cvv: 'someEncryptedCVV...',
      };

      self.profileService
        .addPaymentMethod({
          creditCard: paymentInfo,
        })
        .subscribe((data) => {
          expect(data).toEqual('credit card success');
        });

      expect(self.profileService.addCreditCardPayment).toHaveBeenCalledWith(
        paymentInfo,
      );
      expect(self.analyticsFactory.track).toHaveBeenCalledWith(
        'add-payment-method',
      );
    });

    it("should throw an error if the payment info doesn't contain a bank account or credit card", () => {
      self.profileService
        .addPaymentMethod({
          billingAddress: {},
        })
        .subscribe(
          () => {
            fail(
              'the addPaymentMethod Observable completed successfully when it should have thrown an error',
            );
          },
          (error) => {
            expect(error).toEqual(
              'Error adding payment method. The data passed to profileService.addPaymentMethod did not contain bankAccount or creditCard data',
            );
          },
        );
    });
  });

  describe('updatePaymentMethod', () => {
    it('should update a bank account', () => {
      self.$httpBackend
        .expectPUT('https://give-stage2.cru.org/cortex/paymentUri', {
          'payment-instrument-identification-attributes': {
            'bank-name': 'Some Bank',
          },
        })
        .respond(200, null);
      self.profileService
        .updatePaymentMethod(
          { self: { uri: 'paymentUri' } },
          { bankAccount: { 'bank-name': 'Some Bank' } },
        )
        .subscribe(null, () => fail());
      self.$httpBackend.flush();
    });

    it('should update a credit card', () => {
      self.$httpBackend
        .expectPUT('https://give-stage2.cru.org/cortex/paymentUri', {
          'payment-instrument-identification-attributes': {
            'cardholder-name': 'Some Person',
            'street-address': 'Some Address||||||',
            'extended-address': '',
            locality: '',
            'postal-code': '',
            region: '',
          },
        })
        .respond(200, null);
      self.profileService
        .updatePaymentMethod(
          { self: { uri: 'paymentUri' } },
          {
            creditCard: {
              'cardholder-name': 'Some Person',
              address: { streetAddress: 'Some Address' },
            },
          },
        )
        .subscribe(null, () => fail());
      self.$httpBackend.flush();
    });

    it('should update a credit card with no billing address (api will use mailing address)', () => {
      self.$httpBackend
        .expectPUT('https://give-stage2.cru.org/cortex/paymentUri', {
          'payment-instrument-identification-attributes': {
            'cardholder-name': 'Some Person',
          },
        })
        .respond(200, null);
      self.profileService
        .updatePaymentMethod(
          { self: { uri: 'paymentUri' } },
          {
            creditCard: {
              'cardholder-name': 'Some Person',
              address: undefined,
            },
          },
        )
        .subscribe(null, () => fail());
      self.$httpBackend.flush();
    });

    it('should handle a missing bank account or credit card', () => {
      self.profileService
        .updatePaymentMethod({ self: { uri: 'paymentUri' } }, {})
        .subscribe(
          () => fail(),
          (error) => {
            expect(error).toEqual(
              'Error updating payment method. The data passed to profileService.updatePaymentMethod did not contain bankAccount or creditCard data.',
            );
          },
        );
    });
  });

  describe('deletePaymentMethod', () => {
    it('should delete payment method', () => {
      jest.spyOn(self.analyticsFactory, 'track').mockReturnValue(() => {});
      const uri = '/uri';
      self.$httpBackend
        .expectDELETE('https://give-stage2.cru.org/cortex' + uri)
        .respond(200, 'success');
      self.profileService.deletePaymentMethod(uri).subscribe((data) => {
        expect(data).toEqual('success');
      });
      self.$httpBackend.flush();
      expect(self.analyticsFactory.track).toHaveBeenCalledWith(
        'delete-payment-method',
      );
    });
  });

  describe('getPurchase', () => {
    it('should load the purchase specified by the uri', () => {
      const modifiedPurchaseResponse = angular.copy(purchaseResponse);

      const expectedPurchaseData = {
        donorDetails: modifiedPurchaseResponse._donordetails[0],
        paymentInstruments:
          modifiedPurchaseResponse._paymentinstruments[0]._element[0],
        lineItems: [
          assign(
            omit(modifiedPurchaseResponse._lineitems[0]._element[0], [
              '_code',
              '_rate',
            ]),
            {
              code: modifiedPurchaseResponse._lineitems[0]._element[0]._item[0]
                ._code[0],
              rate: modifiedPurchaseResponse._lineitems[0]._element[0]._rate[0],
            },
          ),
          assign(
            omit(modifiedPurchaseResponse._lineitems[0]._element[1], [
              '_code',
              '_rate',
            ]),
            {
              code: modifiedPurchaseResponse._lineitems[0]._element[1]._item[0]
                ._code[0],
              rate: modifiedPurchaseResponse._lineitems[0]._element[1]._rate[0],
            },
          ),
        ],
        rateTotals: modifiedPurchaseResponse._ratetotals[0]._element,
        billingAddress: modifiedPurchaseResponse._billingaddress[0],
        rawData: purchaseResponse,
      };

      expectedPurchaseData.donorDetails.mailingAddress =
        formatAddressForTemplate(
          expectedPurchaseData.donorDetails['mailing-address'],
        );
      delete expectedPurchaseData.donorDetails['mailing-address'];
      expectedPurchaseData.paymentInstruments.address =
        formatAddressForTemplate(expectedPurchaseData.billingAddress.address);
      delete expectedPurchaseData.billingAddress;

      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/purchases/crugive/giydanbt=?zoom=donordetails,paymentinstruments:element,lineitems:element,lineitems:element:item:code,lineitems:element:item:offer:code,lineitems:element:rate,ratetotals:element,billingaddress',
        )
        .respond(200, purchaseResponse);
      self.profileService
        .getPurchase('/purchases/crugive/giydanbt=')
        .subscribe((data) => {
          expect(data).toEqual(expectedPurchaseData);
        });
      self.$httpBackend.flush();
    });
  });

  describe('getDonorDetails', () => {
    it("should load the user's donorDetails", () => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=donordetails',
        )
        .respond(200, donorDetailsResponse);

      let expectedDonorDetails = angular.copy(
        donorDetailsResponse['_donordetails'][0],
      );
      expectedDonorDetails.mailingAddress = formatAddressForTemplate(
        expectedDonorDetails['mailing-address'],
      );
      expectedDonorDetails = omit(expectedDonorDetails, 'mailing-address');
      self.profileService.getDonorDetails().subscribe((donorDetails) => {
        expect(donorDetails).toEqual(expectedDonorDetails);
      });
      self.$httpBackend.flush();
    });
  });

  describe('getProfileDonorDetails', () => {
    it("should load the user's profile donorDetails", () => {
      const response = {
        self: {
          type: 'cru.selfservicedonor.self-service-donor',
          uri: '/selfservicedonordetails/profiles/crugive/gzsdkojsmvsdcljsmu2geljumqzgmljyg5qtillemy4ggnryhbrwezbzge=',
          href: 'https://give-stage2.cru.org/cortex/selfservicedonordetails/profiles/crugive/gzsdkojsmvsdcljsmu2geljumqzgmljyg5qtillemy4ggnryhbrwezbzge=',
        },
        links: [
          {
            rel: 'profile',
            rev: 'selfservicedonordetails',
            type: 'elasticpath.profiles.profile',
            uri: '/profiles/crugive/gzsdkojsmvsdcljsmu2geljumqzgmljyg5qtillemy4ggnryhbrwezbzge=',
            href: 'https://give-stage2.cru.org/cortex/profiles/crugive/gzsdkojsmvsdcljsmu2geljumqzgmljyg5qtillemy4ggnryhbrwezbzge=',
          },
        ],
        'donor-number': '467023686',
        name: {
          'family-name': 'stin',
          'given-name': 'stin',
          'middle-initial': '',
          suffix: '',
          title: '',
        },
        'organization-name': '',
        'spouse-name': {
          'family-name': 'stin',
          'given-name': 'stiness',
          'middle-initial': '',
          suffix: 'Jr.',
          title: 'Mrs',
        },
      };
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=selfservicedonordetails',
        )
        .respond(200, selfserviceDonorDetailsResponse);
      self.profileService.getProfileDonorDetails().subscribe((donorDetails) => {
        expect(donorDetails).toEqual(response);
      });
      self.$httpBackend.flush();
    });
  });

  describe('updateProfileDonorDetails', () => {
    it("should update user's details", () => {
      self.$httpBackend
        .expectPUT(
          'https://give-stage2.cru.org/cortex/selfservicedonordetails/profiles/crugive/gzsdkojsmvsdcljsmu2geljumqzgmljyg5qtillemy4ggnryhbrwezbzge=',
        )
        .respond(200, 'success');
      self.profileService
        .updateProfileDonorDetails({
          self: {
            uri: '/selfservicedonordetails/profiles/crugive/gzsdkojsmvsdcljsmu2geljumqzgmljyg5qtillemy4ggnryhbrwezbzge=',
          },
        })
        .subscribe((data) => {
          expect(data).toEqual('success');
        });
      self.$httpBackend.flush();
    });
  });

  describe('addSpouse', () => {
    it("should add spouse's details", () => {
      self.$httpBackend
        .expectPUT(
          'https://give-stage2.cru.org/cortex/selfservicedonordetails/crugive/spousedetails',
        )
        .respond(200, 'success');
      self.profileService
        .addSpouse('/selfservicedonordetails/crugive/spousedetails', {})
        .subscribe((data) => {
          expect(data).toEqual('success');
        });
      self.$httpBackend.flush();
    });
  });

  describe('updateEmail', () => {
    it("should add spouse's details", () => {
      self.$httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/spouseemails/crugive/spouse/form?FollowLocation=true',
        )
        .respond(200, 'spouse success');
      self.$httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/emails/crugive/form?FollowLocation=true',
        )
        .respond(200, 'donor success');

      self.profileService.updateEmail({}, true).subscribe((data) => {
        expect(data).toEqual('spouse success');
      });

      self.profileService.updateEmail({}, false).subscribe((data) => {
        expect(data).toEqual('donor success');
      });
      self.$httpBackend.flush();
    });
  });

  describe('getPhoneNumbers', () => {
    it("should load the user's phonenumbers", () => {
      const response = [
        {
          self: {
            type: 'elasticpath.phonenumbers.phone-number',
            uri: '/phonenumbers/crugive/gewuwmktgjivi=',
            href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive/gewuwmktgjivi=',
          },
          links: [
            {
              rel: 'list',
              type: 'elasticpath.collections.links',
              uri: '/phonenumbers/crugive',
              href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive',
            },
          ],
          locked: false,
          'phone-number': '(343) 454-3344',
          'phone-number-type': 'Mobile',
          primary: false,
          'is-spouse': false,
        },
        {
          self: {
            type: 'elasticpath.phonenumbers.phone-number',
            uri: '/phonenumbers/crugive/gewuwmktgjjfq=',
            href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive/gewuwmktgjjfq=',
          },
          links: [
            {
              rel: 'list',
              type: 'elasticpath.collections.links',
              uri: '/phonenumbers/crugive',
              href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive',
            },
          ],
          locked: false,
          'phone-number': '(565) 777-5656',
          'phone-number-type': 'Mobile',
          primary: false,
          'is-spouse': true,
        },
      ];
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/phonenumbers/crugive?zoom=element',
        )
        .respond(200, phoneNumbersResponse);
      self.profileService.getPhoneNumbers().subscribe((data) => {
        expect(data).toEqual(response);
      });
      self.$httpBackend.flush();
    });
  });

  describe('addPhoneNumber', () => {
    it('should add phone number', () => {
      self.$httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/phonenumbers/crugive/spouse/form?FollowLocation=true',
        )
        .respond(200, 'spouse success');
      self.$httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/phonenumbers/crugive/form?FollowLocation=true',
        )
        .respond(200, 'donor success');
      const phoneNumber = {
        'is-spouse': true,
      };
      self.profileService.addPhoneNumber(phoneNumber).subscribe((data) => {
        expect(data).toEqual('spouse success');
      });
      phoneNumber['is-spouse'] = false;
      self.profileService.addPhoneNumber(phoneNumber).subscribe((data) => {
        expect(data).toEqual('donor success');
      });
      self.$httpBackend.flush();
    });
  });

  describe('updatePhoneNumber', () => {
    it('should update phone number', () => {
      const phoneNumber = {
        self: {
          uri: 'uri',
        },
      };
      self.$httpBackend
        .expectPUT('https://give-stage2.cru.org/cortex/uri')
        .respond(200, 'success');
      self.profileService.updatePhoneNumber(phoneNumber).subscribe((data) => {
        expect(data).toEqual('success');
      });
      self.$httpBackend.flush();
    });
  });

  describe('deletePhoneNumber', () => {
    it('should update phone number', () => {
      const phoneNumber = {
        self: {
          uri: 'uri',
        },
      };
      self.$httpBackend
        .expectDELETE('https://give-stage2.cru.org/cortex/uri')
        .respond(200, 'success');
      self.profileService.deletePhoneNumber(phoneNumber).subscribe((data) => {
        expect(data).toEqual('success');
      });
      self.$httpBackend.flush();
    });
  });

  describe('getMailingAddress', () => {
    it('should get mailing address', () => {
      const response = {
        self: {
          type: 'elasticpath.addresses.address',
          uri: '/addresses/crugive/gewuwmktgjfem=',
          href: 'https://give-stage2.cru.org/cortex/addresses/crugive/gewuwmktgjfem=',
        },
        links: [
          {
            rel: 'profile',
            rev: 'addresses',
            type: 'elasticpath.profiles.profile',
            uri: '/profiles/crugive/gzsdkojsmvsdcljsmu2geljumqzgmljyg5qtillemy4ggnryhbrwezbzge=',
            href: 'https://give-stage2.cru.org/cortex/profiles/crugive/gzsdkojsmvsdcljsmu2geljumqzgmljyg5qtillemy4ggnryhbrwezbzge=',
          },
          {
            rel: 'list',
            type: 'elasticpath.collections.links',
            uri: '/addresses/crugive',
            href: 'https://give-stage2.cru.org/cortex/addresses/crugive',
          },
        ],
        address: {
          country: 'US',
          streetAddress: '123 Test street',
          extendedAddress: undefined,
          locality: 'Lehi',
          region: 'AR',
          postalCode: '88888',
        },
        name: {},
      };
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=addresses:mailingaddress',
        )
        .respond(200, mailingAddressResponse);
      self.profileService.getMailingAddress().subscribe((data) => {
        expect(data).toEqual(response);
      });
      self.$httpBackend.flush();
    });
  });

  describe('updateMailingAddress', () => {
    it('should update mailing address', () => {
      const mailingAddress = {
        self: {
          uri: 'uri',
        },
        address: {
          country: 'US',
          streetAddress: '123 First St',
          extendedAddress: '',
          locality: 'Sacramento',
          region: 'CA',
          postalCode: '12345',
        },
      };
      self.$httpBackend
        .expectPUT('https://give-stage2.cru.org/cortex/uri')
        .respond(200, 'success');
      self.profileService
        .updateMailingAddress(mailingAddress)
        .subscribe((data) => {
          expect(data).toEqual('success');
        });
      self.$httpBackend.flush();
    });
  });
});
