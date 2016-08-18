import angular from 'angular';
import 'angular-mocks';
import omit from 'lodash/omit';
import size from 'lodash/size';
import module from './credit-card.component';

import cartResponse from 'common/services/api/fixtures/cortex-cart-paymentmethodinfo-forms.fixture.js';

describe('checkout', () => {
  describe('step 2', () => {
    describe('credit card', () => {
      beforeEach(angular.mock.module(module.name));
      var self = {};

      beforeEach(inject(($rootScope, $componentController, $httpBackend, $compile) => {
        self.outerScope = $rootScope.$new();
        self.$httpBackend = $httpBackend;

        self.outerScope.submitted = false;
        self.outerScope.onSave = () => {};
        let compiledElement = $compile(angular.element('<checkout-credit-card submitted="submitted" on-save="onSave(success)"></checkout-credit-card>'))(self.outerScope);
        self.outerScope.$apply();
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

      describe('savePayment', () => {
        afterEach(function() {
          self.$httpBackend.verifyNoOutstandingExpectation();
          self.$httpBackend.verifyNoOutstandingRequest();
        });

        it('should call onSave with success false when form is invalid', () => {
          spyOn(self.controller, 'onSave').and.callThrough();
          spyOn(self.outerScope, 'onSave');
          self.controller.savePayment();
          expect(self.controller.onSave).toHaveBeenCalledWith({success: false});
          expect(self.outerScope.onSave).toHaveBeenCalledWith(false);
        });
        it('should send a request to save the credit card payment info', () => {
          //Request to get form link
          self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform').respond(200, cartResponse);

          //Custom post data validator to check match on everything except encrypted-account-number which changes on each run
          let expectedPostData ={
            'card-number': '***encrypted***',
            'card-type': 'VISA',
            'cardholder-name': 'Person Name',
            'expiry-month': 12,
            'expiry-year': 19
          };
          function dataValidator(data){
            data = angular.fromJson(data);
            return angular.equals(omit(data, 'card-number'), omit(expectedPostData, 'card-number')) && data['card-number'].length >= 100;
          }
          dataValidator.toString = () => 'card-number must be at least 100 chars (because it should be encrypted) and rest of object must match: ' + angular.toJson(expectedPostData);

          //Request to save credit card info
          self.$httpBackend.expectPOST(
            'https://cortex-gateway-stage.cru.org/cortex/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=?followLocation=true',
            dataValidator
          ).respond(200, 'success');

          spyOn(self.formController, '$setSubmitted');
          spyOn(self.controller, 'onSave').and.callThrough();
          spyOn(self.outerScope, 'onSave');

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

          self.$httpBackend.flush();
          self.$httpBackend.flush();
          expect(self.controller.onSave).toHaveBeenCalledWith({success: true});
          expect(self.outerScope.onSave).toHaveBeenCalledWith(true);
        });
        it('should handle an error saving to cortex', () => {
          //Request to get form link
          self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform').respond(400, 'error');

          spyOn(self.formController, '$setSubmitted');
          spyOn(self.controller, 'onSave').and.callThrough();
          spyOn(self.outerScope, 'onSave');

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

          self.$httpBackend.flush();
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
