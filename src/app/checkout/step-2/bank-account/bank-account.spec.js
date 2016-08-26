import angular from 'angular';
import 'angular-mocks';
import size from 'lodash/size';
import ccp from 'common/lib/ccp';
import { ccpStagingKey } from 'common/app.constants';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './bank-account.component';

describe('checkout', () => {
  describe('step 2', () => {
    describe('bank account', () => {
      beforeEach(angular.mock.module(module.name));
      var self = {};

      beforeEach(() => {
        angular.mock.module(($provide) => {
          $provide.value('ccpService', {
            get: () => {
              ccp.initialize(ccpStagingKey);
              return Observable.of(ccp);
            }
          });
        });
      });

      beforeEach(inject(($rootScope, $componentController, $httpBackend, $compile) => {
        self.outerScope = $rootScope.$new();
        self.$httpBackend = $httpBackend;

        self.outerScope.submitted = false;
        self.outerScope.onSave = () => {};
        let compiledElement = $compile(angular.element('<checkout-bank-account submitted="submitted" on-save="onSave(success)"></checkout-bank-account>'))(self.outerScope);
        self.outerScope.$apply();
        self.controller = compiledElement.controller(module.name);
        self.formController = self.controller.bankPaymentForm;
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
          self.controller.bankPaymentForm = {};
          self.controller.$scope.$apply();
          expect(self.controller.addCustomValidators).toHaveBeenCalled();
        });
      });

      describe('addCustomValidators', () => {
        it('should add parser and validator functions to ngModelControllers ', () => {
          self.controller.addCustomValidators();
          expect(size(self.formController.routingNumber.$parsers)).toEqual(2);
          expect(size(self.formController.routingNumber.$validators)).toEqual(3);

          expect(size(self.formController.accountNumber.$parsers)).toEqual(2);
          expect(size(self.formController.accountNumber.$validators)).toEqual(3);
          expect(size(self.formController.accountNumber.$viewChangeListeners)).toEqual(2);

          expect(size(self.formController.verifyAccountNumber.$parsers)).toEqual(2);
          expect(size(self.formController.verifyAccountNumber.$validators)).toEqual(2);
        });
      });

      describe('savePayment', () => {
        beforeEach(() => {
          spyOn(self.formController, '$setSubmitted');
          spyOn(self.controller.orderService, 'addBankAccountPayment').and.callFake(() => Observable.of('saved bank account'));
          spyOn(self.controller, 'onSave').and.callThrough();
          spyOn(self.outerScope, 'onSave');
        });

        it('should call onSave with success false when form is invalid', () => {
          self.controller.savePayment();
          expect(self.formController.$setSubmitted).toHaveBeenCalled();
          expect(self.controller.onSave).toHaveBeenCalledWith({success: false});
          expect(self.outerScope.onSave).toHaveBeenCalledWith(false);
        });
        it('should send a request to save the bank account payment info', () => {
          self.controller.bankPayment = {
            accountType: 'checking',
            bankName: 'First Bank',
            routingNumber: '123456789',
            accountNumber: '123456789012'
          };
          self.formController.$valid = true;
          self.controller.savePayment();
          expect(self.formController.$setSubmitted).toHaveBeenCalled();
          expect(self.controller.orderService.addBankAccountPayment).toHaveBeenCalledWith(jasmine.objectContaining({
            "account-type": "checking",
            "bank-name": "First Bank",
            "encrypted-account-number": jasmine.stringMatching(/^.{50,}$/), // Check for long encrypted string
            "routing-number": "123456789"
          }));
          expect(self.controller.onSave).toHaveBeenCalledWith({success: true});
          expect(self.outerScope.onSave).toHaveBeenCalledWith(true);
        });
        it('should handle an error saving to cortex', () => {
          self.controller.orderService.addBankAccountPayment.and.callFake(() => Observable.throw('error saving bank account info'));

          self.controller.bankPayment = {
            accountType: 'checking',
            bankName: 'First Bank',
            routingNumber: '123456789',
            accountNumber: '123456789012'
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
          self.formController.bankName.$setViewValue('');
          expect(self.formController.$valid).toEqual(false);
        });
        it('should be valid if all of the inputs are valid', () => {
          self.formController.bankName.$setViewValue('First Bank');
          self.formController.accountType.$setViewValue('checking');
          self.formController.routingNumber.$setViewValue('267084131');
          self.formController.accountNumber.$setViewValue('123456789012');
          self.formController.verifyAccountNumber.$setViewValue('123456789012');
          self.formController.acceptedAgreement.$setViewValue('true');
          expect(self.formController.$valid).toEqual(true);
        });
        describe('bankName input', () => {
          it('should not be valid if the field is empty',  () => {
            self.formController.bankName.$setViewValue('');
            expect(self.formController.bankName.$valid).toEqual(false);
            expect(self.formController.bankName.$error.required).toEqual(true);
          });
          it('should be valid if there is something in the input',  () => {
            self.formController.bankName.$setViewValue('Some Bank');
            expect(self.formController.bankName.$valid).toEqual(true);
          });
        });
        describe('accountType input', () => {
          it('should not be valid if the field is empty',  () => {
            self.formController.accountType.$setViewValue('');
            expect(self.formController.accountType.$valid).toEqual(false);
            expect(self.formController.routingNumber.$error.required).toEqual(true);
          });
          it('should be valid if checking is selected',  () => {
            self.formController.accountType.$setViewValue('checking');
            expect(self.formController.accountType.$valid).toEqual(true);
          });
          it('should be valid if savings is selected',  () => {
            self.formController.accountType.$setViewValue('savings');
            expect(self.formController.accountType.$valid).toEqual(true);
          });
        });
        describe('routingNumber input', () => {
          it('should not be valid if the field is empty',  () => {
            self.formController.routingNumber.$setViewValue('');
            expect(self.formController.routingNumber.$valid).toEqual(false);
            expect(self.formController.routingNumber.$error.required).toEqual(true);
          });
          it('should not be valid if there are less than 9 digits',  () => {
            self.formController.routingNumber.$setViewValue('12345678');
            expect(self.formController.routingNumber.$valid).toEqual(false);
            expect(self.formController.routingNumber.$error.required).toBeUndefined();
            expect(self.formController.routingNumber.$error.length).toEqual(true);
          });
          it('should not be valid if there are more than 9 digits',  () => {
            self.formController.routingNumber.$setViewValue('1234567890');
            expect(self.formController.routingNumber.$valid).toEqual(false);
            expect(self.formController.routingNumber.$error.required).toBeUndefined();
            expect(self.formController.routingNumber.$error.length).toEqual(true);
          });
          it('should not be valid if the checksum is incorrect ',  () => {
            self.formController.routingNumber.$setViewValue('123456789');
            expect(self.formController.routingNumber.$valid).toEqual(false);
            expect(self.formController.routingNumber.$error.required).toBeUndefined();
            expect(self.formController.routingNumber.$error.length).toBeUndefined();
            expect(self.formController.routingNumber.$error.routingNumber).toEqual(true);
          });
          it('should be valid if the checksum is correct',  () => {
            self.formController.routingNumber.$setViewValue('267084131');
            expect(self.formController.routingNumber.$valid).toEqual(true);
            expect(self.formController.routingNumber.$error.required).toBeUndefined();
            expect(self.formController.routingNumber.$error.length).toBeUndefined();
            expect(self.formController.routingNumber.$error.routingNumber).toBeUndefined();
          });
          it('should have the stripNonDigits parser',  () => {
            self.formController.routingNumber.$setViewValue('2a670-84!1dsafsdafasdf asdfasdf31');
            expect(self.formController.routingNumber.$valid).toEqual(true);
          });
        });
        describe('accountNumber input', () => {
          it('should not be valid if the field is empty',  () => {
            self.formController.accountNumber.$setViewValue('');
            expect(self.formController.accountNumber.$valid).toEqual(false);
            expect(self.formController.accountNumber.$error.required).toEqual(true);
          });
          it('should not be valid if there are less than 2 digits',  () => {
            self.formController.accountNumber.$setViewValue('1');
            expect(self.formController.accountNumber.$valid).toEqual(false);
            expect(self.formController.accountNumber.$error.required).toBeUndefined();
            expect(self.formController.accountNumber.$error.minlength).toEqual(true);
          });
          it('should not be valid if there are more than 17 digits',  () => {
            self.formController.accountNumber.$setViewValue('123456789012345678');
            expect(self.formController.accountNumber.$valid).toEqual(false);
            expect(self.formController.accountNumber.$error.required).toBeUndefined();
            expect(self.formController.accountNumber.$error.maxlength).toEqual(true);
          });
          it('should be valid if the length is correct',  () => {
            self.formController.accountNumber.$setViewValue('1234567890123456');
            expect(self.formController.accountNumber.$valid).toEqual(true);
            expect(self.formController.accountNumber.$error.required).toBeUndefined();
            expect(self.formController.accountNumber.$error.minlength).toBeUndefined();
            expect(self.formController.accountNumber.$error.maxlength).toBeUndefined();
          });
          it('should have the stripNonDigits parser',  () => {
            self.formController.accountNumber.$setViewValue('1#$$^%2s345 67g89sdafsadfsa0');
            expect(self.formController.accountNumber.$valid).toEqual(true);
          });
        });
        describe('verifyAccountNumber input', () => {
          it('should not be valid if the field is empty',  () => {
            self.formController.verifyAccountNumber.$setViewValue('');
            expect(self.formController.verifyAccountNumber.$valid).toEqual(false);
            expect(self.formController.verifyAccountNumber.$error.required).toEqual(true);
          });
          it('should be valid if the account numbers match',  () => {
            self.formController.accountNumber.$setViewValue('1234567890123456');
            self.formController.verifyAccountNumber.$setViewValue('1234567890123456');
            expect(self.formController.verifyAccountNumber.$valid).toEqual(true);
            expect(self.formController.verifyAccountNumber.$error.required).toBeUndefined();
            expect(self.formController.verifyAccountNumber.$error.verifyAccountNumber).toBeUndefined();
          });
          it('should be become valid if the accountNumber is updated to match the verifyAccountNumber',  () => {
            self.formController.verifyAccountNumber.$setViewValue('1234567890123456');
            self.formController.accountNumber.$setViewValue('1234567890123456');
            expect(self.formController.verifyAccountNumber.$valid).toEqual(true);
            expect(self.formController.verifyAccountNumber.$error.required).toBeUndefined();
            expect(self.formController.verifyAccountNumber.$error.verifyAccountNumber).toBeUndefined();
          });
          it('should have the stripNonDigits parser',  () => {
            self.formController.accountNumber.$setViewValue('1#$$^%2s345 67g89sdafsadfsa0');
            self.formController.verifyAccountNumber.$setViewValue('123asdf! 4@%$#56 7d$%8d90');
            expect(self.formController.verifyAccountNumber.$valid).toEqual(true);
          });
        });
        describe('acceptedAgreement input', () => {
          it('should not be valid if the field is empty',  () => {
            self.formController.acceptedAgreement.$setViewValue(false);
            expect(self.formController.acceptedAgreement.$valid).toEqual(false);
            expect(self.formController.acceptedAgreement.$error.required).toEqual(true);
          });
          it('should be valid if the box is checked',  () => {
            self.formController.acceptedAgreement.$setViewValue(true);
            expect(self.formController.acceptedAgreement.$valid).toEqual(true);
            expect(self.formController.acceptedAgreement.$error.required).toBeUndefined();
          });
        });
      });
    });
  });
});
