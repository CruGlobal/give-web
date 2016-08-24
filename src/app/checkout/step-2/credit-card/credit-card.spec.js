import angular from 'angular';
import 'angular-mocks';
import size from 'lodash/size';
import find from 'lodash/find';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './credit-card.component';

import countriesResponse from 'common/services/api/fixtures/cortex-countries.fixture.js';
import donorDetailsResponse from 'common/services/api/fixtures/cortex-donordetails.fixture.js';

describe('checkout', () => {
  describe('step 2', () => {
    describe('credit card', () => {
      beforeEach(angular.mock.module(module.name));
      var self = {};

      beforeEach(inject(($rootScope, $httpBackend, $compile) => {
        self.outerScope = $rootScope.$new();
        self.$httpBackend = $httpBackend;

        self.outerScope.submitted = false;
        self.outerScope.onSave = () => {};
        let compiledElement = $compile(angular.element('<checkout-credit-card submitted="submitted" on-save="onSave(success)"></checkout-credit-card>'))(self.outerScope);
        // TODO: figure out how to skip calling $onInit when using $compile. For now, just expect the requests generated by calling $onInit. Adding a spy to $onInit would be best but I couldn't figure out how to access the controller before $onInit is called
        self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:donordetails,order:emailinfo:email').respond(200, donorDetailsResponse);
        self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/geographies/crugive/countries?zoom=element').respond(200, '');
        self.outerScope.$apply();
        self.$httpBackend.flush();
        self.controller = compiledElement.controller(module.name);
        self.formController = self.controller.creditCardPaymentForm;
      }));

      describe('$onChanges', () => {
        it('should call savePayment when called directly with a mock change object', () => {
          spyOn(self.controller, 'savePayment');
          self.controller.$onChanges({
            submitted: {
              currentValue: true
            }
          });
          expect(self.controller.savePayment).toHaveBeenCalled();
        });
        it('should call savePayment when submitted changes to true', () => {
          spyOn(self.controller, 'savePayment');
          self.outerScope.submitted = true;
          self.outerScope.$apply();
          expect(self.controller.savePayment).toHaveBeenCalled();
        });
      });

      describe('waitForFormInitialization', () => {
        it('should call addCustomValidators when the form is initialized', () => {
          spyOn(self.controller, 'addCustomValidators');
          self.controller.waitForFormInitialization();
          self.controller.creditCardPaymentForm = {};
          self.controller.$scope.$apply();
          expect(self.controller.addCustomValidators).toHaveBeenCalled();
        });
      });

      describe('addCustomValidators', () => {
        it('should add parser and validator functions to ngModelControllers ', () => {
          self.controller.addCustomValidators();
          expect(size(self.formController.cardNumber.$parsers)).toEqual(2);
          expect(size(self.formController.cardNumber.$validators)).toEqual(4);

          expect(size(self.formController.expiryYear.$validators)).toEqual(2);

          expect(size(self.formController.securityCode.$parsers)).toEqual(2);
          expect(size(self.formController.securityCode.$validators)).toEqual(3);
        });
      });

      describe('loadCountries', () => {
        it('should get the list of countries', () => {
          spyOn(self.controller.geographiesService, 'getCountries').and.callFake(() => Observable.of(['country1', 'country2']));
          spyOn(self.controller, 'refreshRegions');
          self.controller.loadCountries();
          expect(self.controller.countries).toEqual(['country1', 'country2']);
          expect(self.controller.refreshRegions).toHaveBeenCalled();
        });
      });

      describe('refreshRegions', () => {
        it('should get the list of regions of a given country', () => {
          self.controller.countries = countriesResponse._element;
          spyOn(self.controller.geographiesService, 'getRegions').and.callFake(() => Observable.of(['region1', 'region2']));
          self.controller.refreshRegions('US');
          expect(self.controller.geographiesService.getRegions).toHaveBeenCalledWith(find(countriesResponse._element, { name: 'US' }));
          expect(self.controller.regions).toEqual(['region1', 'region2']);
        });
        it('should do nothing if the country doesn\'t exist in the loaded list of countries', () => {
          self.controller.countries = countriesResponse._element;
          spyOn(self.controller.geographiesService, 'getRegions');
          self.controller.refreshRegions('USA');
          expect(self.controller.geographiesService.getRegions).not.toHaveBeenCalled();
          expect(self.controller.regions).toBeUndefined();
        });
      });

      describe('loadDonorDetails', () => {
        it('should get the donor\'s details', () => {
          spyOn(self.controller.orderService, 'getDonorDetails').and.callFake(() => Observable.of('some details'));
          self.controller.loadDonorDetails('US');
          expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled();
          expect(self.controller.donorDetails).toEqual('some details');
        });
      });

      describe('savePayment', () => {
        beforeEach(() => {
          spyOn(self.formController, '$setSubmitted');
          spyOn(self.controller.orderService, 'addCreditCardPayment').and.callFake(() => Observable.of('saved credit card'));
          spyOn(self.controller.orderService, 'addBillingAddress').and.callFake(() => Observable.of('saved billing address'));
          spyOn(self.controller.orderService, 'storeCardSecurityCode');
          spyOn(self.controller, 'onSave').and.callThrough();
          spyOn(self.outerScope, 'onSave');
        });

        it('should call onSave with success false when form is invalid', () => {
          self.controller.savePayment();
          expect(self.formController.$setSubmitted).toHaveBeenCalled();
          expect(self.controller.onSave).toHaveBeenCalledWith({success: false});
          expect(self.outerScope.onSave).toHaveBeenCalledWith(false);
        });
        it('should send a request to save the credit card payment and billing address info', () => {
          self.controller.creditCardPayment = {
            cardNumber: '4111111111111111',
            cardholderName: 'Person Name',
            expiryMonth: 12,
            expiryYear: 19,
            securityCode: '123'
          };
          self.controller.billingAddress = {
            isMailingAddress: false,
            streetAddress: '123 First St',
            extendedAddress: 'Apt 123',
            locality: 'Sacramento',
            postalCode: '12345',
            region: 'CA'
          };
          self.formController.$valid = true;
          self.controller.savePayment();
          expect(self.formController.$setSubmitted).toHaveBeenCalled();
          expect(self.controller.orderService.addCreditCardPayment).toHaveBeenCalledWith(jasmine.objectContaining({
            'card-number': jasmine.stringMatching(/^.{50,}$/), // Check for long encrypted string
            'cardholder-name': 'Person Name',
            'expiry-month': 12,
            'expiry-year': 19
          }));
          expect(self.controller.orderService.addBillingAddress).toHaveBeenCalledWith({
            address: {
              isMailingAddress: false,
              streetAddress: '123 First St',
              extendedAddress: 'Apt 123',
              locality: 'Sacramento',
              postalCode: '12345',
              region: 'CA'
            },
            name: {
              'family-name': 'none',
              'given-name': 'none'
            }
          });
          expect(self.controller.orderService.storeCardSecurityCode).toHaveBeenCalledWith(jasmine.stringMatching(/^.{50,}$/)); // Check for long encrypted string
          expect(self.controller.onSave).toHaveBeenCalledWith({success: true});
          expect(self.outerScope.onSave).toHaveBeenCalledWith(true);
        });
        it('should use the mailing address for the billing address if that checkbox is checked', () => {
          self.controller.creditCardPayment = {
            cardNumber: '4111111111111111',
            cardholderName: 'Person Name',
            expiryMonth: 12,
            expiryYear: 19,
            securityCode: '123'
          };
          self.controller.donorDetails.mailingAddress = {
            streetAddress: '1234 First St',
            extendedAddress: 'Apt 123',
            locality: 'Sacramento',
            postalCode: '12345',
            region: 'CA'
          };
          self.controller.billingAddress.isMailingAddress = true;
          self.formController.$valid = true;
          self.controller.savePayment();
          expect(self.formController.$setSubmitted).toHaveBeenCalled();
          expect(self.controller.orderService.addCreditCardPayment).toHaveBeenCalledWith(jasmine.objectContaining({
            'card-number': jasmine.stringMatching(/^.{50,}$/), // Check for long encrypted string
            'cardholder-name': 'Person Name',
            'expiry-month': 12,
            'expiry-year': 19
          }));
          expect(self.controller.orderService.addBillingAddress).toHaveBeenCalledWith({
            address: {
              streetAddress: '1234 First St',
              extendedAddress: 'Apt 123',
              locality: 'Sacramento',
              postalCode: '12345',
              region: 'CA'
            },
            name: {
              'family-name': 'none',
              'given-name': 'none'
            }
          });
          expect(self.controller.orderService.storeCardSecurityCode).toHaveBeenCalledWith(jasmine.stringMatching(/^.{50,}$/)); // Check for long encrypted string
          expect(self.controller.onSave).toHaveBeenCalledWith({success: true});
          expect(self.outerScope.onSave).toHaveBeenCalledWith(true);
        });
        it('should handle an error saving credit card info', () => {
          self.controller.orderService.addCreditCardPayment.and.callFake(() => Observable.throw('error saving credit card info'));

          self.controller.creditCardPayment = {
            cardNumber: '4111111111111111',
            cardholderName: 'Person Name',
            expiryMonth: 12,
            expiryYear: 19,
            securityCode: '123'
          };
          self.formController.$valid = true;
          self.controller.savePayment();

          expect(self.formController.$setSubmitted).toHaveBeenCalled();
          expect(self.controller.onSave).toHaveBeenCalledWith({success: false});
          expect(self.outerScope.onSave).toHaveBeenCalledWith(false);
        });
        it('should handle an error saving billing address info', () => {
          self.controller.orderService.addBillingAddress.and.callFake(() => Observable.throw('error saving billing address info'));
          self.controller.creditCardPayment = {
            cardNumber: '4111111111111111',
            cardholderName: 'Person Name',
            expiryMonth: 12,
            expiryYear: 19,
            securityCode: '123'
          };
          self.formController.$valid = true;
          self.controller.savePayment();

          expect(self.formController.$setSubmitted).toHaveBeenCalled();
          expect(self.controller.onSave).toHaveBeenCalledWith({success: false});
          expect(self.outerScope.onSave).toHaveBeenCalledWith(false);
        });
      });

      describe('form controller', () => {
        it('should be invalid if any of the inputs are invalid', () => {
          self.formController.cardNumber.$setViewValue('');
          expect(self.formController.$valid).toEqual(false);
        });
        it('should be valid if all of the inputs are valid', () => {
          self.formController.cardNumber.$setViewValue('4111111111111111');
          self.formController.cardholderName.$setViewValue('Person Name');
          self.formController.expiryMonth.$setViewValue('12');
          self.formController.expiryYear.$setViewValue('19');
          self.formController.securityCode.$setViewValue('1234');
          expect(self.formController.$valid).toEqual(true);
        });
        describe('cardNumber input', () => {
          it('should not be valid if the field is empty',  () => {
            expect(self.formController.cardNumber.$valid).toEqual(false);
            expect(self.formController.cardNumber.$error.required).toEqual(true);
          });
          it('should not be valid if the input is too short',  () => {
            self.formController.cardNumber.$setViewValue('123456789012');
            expect(self.formController.cardNumber.$valid).toEqual(false);
            expect(self.formController.cardNumber.$error.required).toBeUndefined();
            expect(self.formController.cardNumber.$error.minlength).toEqual(true);
          });
          it('should not be valid if the input is too lond',  () => {
            self.formController.cardNumber.$setViewValue('12345678901234567');
            expect(self.formController.cardNumber.$valid).toEqual(false);
            expect(self.formController.cardNumber.$error.required).toBeUndefined();
            expect(self.formController.cardNumber.$error.maxlength).toEqual(true);
          });
          it('should be valid if it contains a valid card number',  () => {
            self.formController.cardNumber.$setViewValue('4111111111111111');
            expect(self.formController.cardNumber.$valid).toEqual(true);
          });
        });
        describe('cardholderName input', () => {
          it('should not be valid if the field is empty',  () => {
            expect(self.formController.cardholderName.$valid).toEqual(false);
            expect(self.formController.cardholderName.$error.required).toEqual(true);
          });
          it('should be valid if it contains text',  () => {
            self.formController.cardholderName.$setViewValue('Person Name');
            expect(self.formController.cardholderName.$valid).toEqual(true);
          });
        });
        describe('expiryMonth input', () => {
          it('should not be valid if the field is empty',  () => {
            expect(self.formController.expiryMonth.$valid).toEqual(false);
            expect(self.formController.expiryMonth.$error.required).toEqual(true);
          });
          it('should not be valid if it is less than 1',  () => {
            self.formController.expiryMonth.$setViewValue('0');
            expect(self.formController.expiryMonth.$valid).toEqual(false);
            expect(self.formController.expiryMonth.$error.required).toBeUndefined();
            expect(self.formController.expiryMonth.$error.min).toEqual(true);
          });
          it('should not be valid if it is greater than 12',  () => {
            self.formController.expiryMonth.$setViewValue('13');
            expect(self.formController.expiryMonth.$valid).toEqual(false);
            expect(self.formController.expiryMonth.$error.required).toBeUndefined();
            expect(self.formController.expiryMonth.$error.max).toEqual(true);
          });
          it('should be valid if it is between 1 and 12',  () => {
            self.formController.expiryMonth.$setViewValue('1');
            expect(self.formController.expiryMonth.$valid).toEqual(true);
            self.formController.expiryMonth.$setViewValue('6');
            expect(self.formController.expiryMonth.$valid).toEqual(true);
            self.formController.expiryMonth.$setViewValue('12');
            expect(self.formController.expiryMonth.$valid).toEqual(true);
          });
        });
        describe('expiryYear input', () => {
          it('should not be valid if the field is empty',  () => {
            expect(self.formController.expiryYear.$valid).toEqual(false);
            expect(self.formController.expiryYear.$error.required).toEqual(true);
          });
          it('should not be valid if it is not 2 or 4 digits',  () => {
            self.formController.expiryYear.$setViewValue('1');
            expect(self.formController.expiryYear.$valid).toEqual(false);
            expect(self.formController.expiryYear.$error.required).toBeUndefined();
            expect(self.formController.expiryYear.$error.length).toEqual(true);
            self.formController.expiryMonth.$setViewValue('123');
            expect(self.formController.expiryYear.$valid).toEqual(false);
            expect(self.formController.expiryYear.$error.required).toBeUndefined();
            expect(self.formController.expiryYear.$error.length).toEqual(true);
            self.formController.expiryYear.$setViewValue('12345');
            expect(self.formController.expiryYear.$valid).toEqual(false);
            expect(self.formController.expiryYear.$error.required).toBeUndefined();
            expect(self.formController.expiryYear.$error.length).toEqual(true);
          });
          it('should be valid if it is 4 digits',  () => {
            self.formController.expiryYear.$setViewValue('12');
            expect(self.formController.expiryYear.$valid).toEqual(true);
          });
          it('should be valid if it is 2 digits',  () => {
            self.formController.expiryYear.$setViewValue('2012');
            expect(self.formController.expiryYear.$valid).toEqual(true);
          });
        });
        describe('securityCode input', () => {
          it('should not be valid if the field is empty',  () => {
            expect(self.formController.securityCode.$valid).toEqual(false);
            expect(self.formController.securityCode.$error.required).toEqual(true);
          });
          it('should not be valid if it is less than 3 digits',  () => {
            self.formController.securityCode.$setViewValue('12');
            expect(self.formController.securityCode.$valid).toEqual(false);
            expect(self.formController.securityCode.$error.required).toBeUndefined();
            expect(self.formController.securityCode.$error.minlength).toEqual(true);
          });
          it('should not be valid if it is greater than 4 digits',  () => {
            self.formController.securityCode.$setViewValue('12345');
            expect(self.formController.securityCode.$valid).toEqual(false);
            expect(self.formController.securityCode.$error.required).toBeUndefined();
            expect(self.formController.securityCode.$error.maxlength).toEqual(true);
          });
          it('should be valid if it is 3 digits',  () => {
            self.formController.securityCode.$setViewValue('123');
            expect(self.formController.securityCode.$valid).toEqual(true);
          });
          it('should be valid if it is 4 digits',  () => {
            self.formController.securityCode.$setViewValue('1234');
            expect(self.formController.securityCode.$valid).toEqual(true);
          });
        });
      });
    });
  });
});
