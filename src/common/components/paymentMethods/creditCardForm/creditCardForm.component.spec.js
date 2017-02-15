import angular from 'angular';
import 'angular-mocks';
import size from 'lodash/size';
import ccp from 'common/lib/ccp';
import { ccpStagingKey } from 'common/app.constants';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './creditCardForm.component';

describe('credit card form', () => {
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

  beforeEach(inject(($rootScope, $httpBackend, $compile) => {
    self.outerScope = $rootScope.$new();
    self.$httpBackend = $httpBackend;

    self.outerScope.paymentFormState = 'unsubmitted';
    self.outerScope.onPaymentFormStateChange = () => {};
    let compiledElement = $compile(angular.element('<credit-card-form payment-form-state="paymentFormState" on-payment-form-state-change="onPaymentFormStateChange($event)"></credit-card-form>'))(self.outerScope);
    self.outerScope.$apply();
    self.controller = compiledElement.controller(module.name);
    self.formController = self.controller.creditCardPaymentForm;
  }));

  describe('$onInit', () => {
    it('should call the needed functions to load data', () => {
      spyOn(self.controller, 'loadCcp');
      spyOn(self.controller, 'initExistingPaymentMethod');
      spyOn(self.controller, 'waitForFormInitialization');
      spyOn(self.controller, 'initializeExpirationDateOptions');
      self.controller.$onInit();
      expect(self.controller.loadCcp).toHaveBeenCalled();
      expect(self.controller.initExistingPaymentMethod).toHaveBeenCalled();
      expect(self.controller.waitForFormInitialization).toHaveBeenCalled();
      expect(self.controller.initializeExpirationDateOptions).toHaveBeenCalled();
    });
  });

  describe('$onChanges', () => {
    it('should call savePayment when called directly with a mock change object', () => {
      spyOn(self.controller, 'savePayment');
      self.controller.$onChanges({
        paymentFormState: {
          currentValue: 'submitted'
        }
      });
      expect(self.controller.savePayment).toHaveBeenCalled();
    });
    it('should call savePayment state changes to submitted', () => {
      spyOn(self.controller, 'savePayment');
      self.outerScope.paymentFormState = 'submitted';
      self.outerScope.$apply();
      expect(self.controller.savePayment).toHaveBeenCalled();
    });
  });

  describe('loadCcp', () => {
    it('should load ccp', () => {
      spyOn(self.controller.ccpService, 'get').and.returnValue(Observable.of('ccp object'));
      self.controller.loadCcp();
      expect(self.controller.ccp).toEqual('ccp object');
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

      expect(size(self.formController.expiryMonth.$validators)).toEqual(2);

      expect(size(self.formController.securityCode.$parsers)).toEqual(1);
      expect(size(self.formController.securityCode.$validators)).toEqual(4);
    });
  });

  describe('savePayment', () => {
    beforeEach(() => {
      spyOn(self.formController, '$setSubmitted');
      spyOn(self.controller, 'onPaymentFormStateChange').and.callThrough();
      spyOn(self.outerScope, 'onPaymentFormStateChange');
    });

    it('should call onPaymentFormStateChange with success false when form is invalid', () => {
      self.controller.savePayment();
      expect(self.formController.$setSubmitted).toHaveBeenCalled();
      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'unsubmitted'} });
      expect(self.outerScope.onPaymentFormStateChange).toHaveBeenCalledWith({ state: 'unsubmitted'});
    });
    it('should send a request to save the credit card payment and billing address info', () => {
      self.controller.creditCardPayment = {
        address: {
          streetAddress: '123 First St',
          extendedAddress: 'Apt 123',
          locality: 'Sacramento',
          postalCode: '12345',
          region: 'CA'
        },
        cardNumber: '4111111111111111',
        cardholderName: 'Person Name',
        expiryMonth: 12,
        expiryYear: 19,
        securityCode: '123'
      };
      self.controller.useMailingAddress = false;
      self.formController.$valid = true;
      self.controller.savePayment();
      expect(self.formController.$setSubmitted).toHaveBeenCalled();
      let expectedData = {
        creditCard: {
          address: {
            streetAddress: '123 First St',
            extendedAddress: 'Apt 123',
            locality: 'Sacramento',
            postalCode: '12345',
            region: 'CA'
          },
          'card-number': jasmine.stringMatching(/^.{50,}$/), // Check for long encrypted string
          'cardholder-name': 'Person Name',
          'expiry-month': 12,
          'expiry-year': 19,
          ccv: jasmine.stringMatching(/^.{50,}$/) // Check for long encrypted string
        },
        paymentMethodNumber: '1111'
      };
      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'loading', payload: expectedData } });
      expect(self.outerScope.onPaymentFormStateChange).toHaveBeenCalledWith({ state: 'loading', payload: expectedData });
    });
    it('should not send a billing address if the Same as Mailing Address box is checked as the api will use the mailing address there', () => {
      self.controller.creditCardPayment = {
        cardNumber: '4111111111111111',
        cardholderName: 'Person Name',
        expiryMonth: 12,
        expiryYear: 19,
        securityCode: '123'
      };
      self.controller.useMailingAddress = true;
      self.formController.$valid = true;
      self.controller.savePayment();
      expect(self.formController.$setSubmitted).toHaveBeenCalled();
      let expectedData = {
        creditCard: {
          address: undefined,
          'card-number': jasmine.stringMatching(/^.{50,}$/), // Check for long encrypted string
          'cardholder-name': 'Person Name',
          'expiry-month': 12,
          'expiry-year': 19,
          ccv: jasmine.stringMatching(/^.{50,}$/) // Check for long encrypted string
        },
        paymentMethodNumber: '1111'
      };
      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'loading', payload: expectedData } });
      expect(self.outerScope.onPaymentFormStateChange).toHaveBeenCalledWith({ state: 'loading', payload: expectedData });
    });
    it('should not send a credit card or security code if a paymentMethod is present and cardNumber is unchanged', () => {
      self.controller.paymentMethod = {
        'card-number': '4567'
      };
      self.controller.creditCardPayment = {
        cardNumber: undefined,
        cardholderName: 'Person Name',
        expiryMonth: 12,
        expiryYear: 19,
        securityCode: '123'
      };
      self.controller.useMailingAddress = true;
      self.formController.$valid = true;
      self.controller.savePayment();
      expect(self.formController.$setSubmitted).toHaveBeenCalled();
      let expectedData = {
        creditCard: {
          address: undefined,
          'card-number': '4567',
          'cardholder-name': 'Person Name',
          'expiry-month': 12,
          'expiry-year': 19,
          ccv: null
        },
        paymentMethodNumber: false
      };
      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'loading', payload: expectedData } });
      expect(self.outerScope.onPaymentFormStateChange).toHaveBeenCalledWith({ state: 'loading', payload: expectedData });
    });
  });


  describe('initializeExpirationDateOptions', () => {
    it('should generate a range of credit card expiration years for the view dropdown', () => {
      jasmine.clock().mockDate(new Date(2012, 11, 31)); // Dec 31 2012
      self.controller.initializeExpirationDateOptions();
      expect(self.controller.expirationDateYears).toEqual([
        2012,
        2013,
        2014,
        2015,
        2016,
        2017,
        2018,
        2019,
        2020,
        2021
      ]);
    });
  });

  describe('form controller', () => {
    it('should be invalid if any of the inputs are invalid', () => {
      self.formController.cardNumber.$setViewValue('');
      expect(self.formController.$valid).toEqual(false);
    });
    it('should be valid if all of the inputs are valid', () => {
      jasmine.clock().mockDate(new Date(2012, 11, 31)); // Dec 31 2012
      self.formController.cardNumber.$setViewValue('4111111111111111');
      self.formController.cardholderName.$setViewValue('Person Name');
      self.formController.expiryMonth.$setViewValue('12');
      self.formController.expiryYear.$setViewValue('2012');
      self.formController.securityCode.$setViewValue('1234');
      expect(self.formController.$valid).toEqual(true);
    });
    describe('cardNumber input', () => {
      it('should not be valid if the field is empty',  () => {
        expect(self.formController.cardNumber.$valid).toEqual(false);
      });
      it('should be valid if the field is empty and an existing payment method is present',  () => {
        self.controller.paymentMethod = {};
        self.formController.cardNumber.$setViewValue('');
        expect(self.formController.cardNumber.$valid).toEqual(true);
        expect(self.formController.cardNumber.$error.required).toBeUndefined();
        expect(self.formController.cardNumber.$error.minlength).toBeUndefined();
        expect(self.formController.cardNumber.$error.cardNumber).toBeUndefined();
      });
      it('should not be valid if the input is too short',  () => {
        self.formController.cardNumber.$setViewValue('123456789012');
        expect(self.formController.cardNumber.$valid).toEqual(false);
        expect(self.formController.cardNumber.$error.required).toBeUndefined();
        expect(self.formController.cardNumber.$error.minlength).toEqual(true);
      });
      it('should not be valid if the input is too long',  () => {
        self.formController.cardNumber.$setViewValue('12345678901234567');
        expect(self.formController.cardNumber.$valid).toEqual(false);
        expect(self.formController.cardNumber.$error.required).toBeUndefined();
        expect(self.formController.cardNumber.$error.maxlength).toEqual(true);
      });
      it('should not be valid if it contains an invalid card number',  () => {
        self.formController.cardNumber.$setViewValue('411111111111111'); // Missing 1 digit
        expect(self.formController.cardNumber.$valid).toEqual(false);
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
      it('should be valid if it contains a month',  () => {
        self.formController.expiryMonth.$setViewValue('01');
        expect(self.formController.expiryMonth.$valid).toEqual(true);
        self.formController.expiryMonth.$setViewValue('06');
        expect(self.formController.expiryMonth.$valid).toEqual(true);
        self.formController.expiryMonth.$setViewValue('12');
        expect(self.formController.expiryMonth.$valid).toEqual(true);
      });
      it('should be invalid if it is expired',  () => {
        jasmine.clock().mockDate(new Date(2012, 11, 31)); // Dec 31 2012
        self.formController.expiryMonth.$setViewValue('11');
        self.formController.expiryYear.$setViewValue('2012');
        expect(self.formController.expiryMonth.$valid).toEqual(false);
      });
      it('should be valid if it the current month',  () => {
        jasmine.clock().mockDate(new Date(2012, 11, 31)); // Dec 31 2012
        self.formController.expiryYear.$setViewValue('2012');
        self.formController.expiryMonth.$setViewValue('12');
        expect(self.formController.expiryMonth.$valid).toEqual(true);
      });
    });
    describe('expiryYear input', () => {
      it('should not be valid if the field is empty',  () => {
        expect(self.formController.expiryYear.$valid).toEqual(false);
        expect(self.formController.expiryYear.$error.required).toEqual(true);
      });
      it('should be valid if it is 4 digits',  () => {
        self.formController.expiryYear.$setViewValue('2012');
        expect(self.formController.expiryYear.$valid).toEqual(true);
      });
    });
    describe('securityCode input', () => {
      it('should not be valid if the field is empty',  () => {
        expect(self.formController.securityCode.$valid).toEqual(false);
      });
      it('should not exist if existing payment method is present',  () => {
        self.controller.paymentMethod = {};
        self.formController.securityCode.$setViewValue('foo');
        expect(self.formController.securityCode).toBeUndefined();
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
      it('should be valid if it is 4 digits and the card tyoe is American Express',  () => {
        self.formController.cardNumber.$setViewValue('371449635398431');
        self.formController.securityCode.$setViewValue('1234');
        expect(self.formController.securityCode.$valid).toEqual(true);
      });
      it('should not be valid if it is 3 digits and the card tyoe is American Express',  () => {
        self.formController.cardNumber.$setViewValue('371449635398431');
        self.formController.securityCode.$setViewValue('123');
        expect(self.formController.securityCode.$valid).toEqual(false);
      });
      it('should not be valid if it is 3 digits and the card tyoe is updated to American Express after',  () => {
        self.formController.securityCode.$setViewValue('123');
        expect(self.formController.securityCode.$valid).toEqual(true);
        self.formController.cardNumber.$setViewValue('371449635398431');
        expect(self.formController.securityCode.$valid).toEqual(false);
      });
    });

    describe('initExistingPaymentMethod', () => {
      it('should populate the creditCardPayment fields if a paymentMethod is present', () => {
        self.controller.paymentMethod = {
          address: { streetAddress: 'Some Address' },
          'card-number': '1234',
          'cardholder-name': 'Some Person',
          'expiry-month': '10',
          'expiry-year': '2015'
        };
        self.controller.initExistingPaymentMethod();
        expect(self.controller.useMailingAddress).toEqual(false);
        expect(self.controller.creditCardPayment).toEqual({
          address: { streetAddress: 'Some Address' },
          cardNumberPlaceholder: '1234',
          cardholderName: 'Some Person',
          expiryMonth: '10',
          expiryYear: 2015
        });
      });
    });
  });
});
