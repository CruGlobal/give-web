import angular from 'angular';
import 'angular-mocks';
import size from 'lodash/size';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

jest.mock('@cruglobal/cru-payments/dist/cru-payments', () => {
  const originalModule = jest.requireActual(
    '@cruglobal/cru-payments/dist/cru-payments',
  );
  return {
    bankAccount: {
      ...originalModule.bankAccount,
      init: jest.fn(),
      encrypt: jest.fn(),
    },
  };
});

import * as cruPayments from '@cruglobal/cru-payments/dist/cru-payments';
import { ccpKey, ccpStagingKey } from 'common/app.constants';

import module from './bankAccountForm.component';

describe('bank account form', () => {
  beforeEach(angular.mock.module(module.name));
  const self = {};

  beforeEach(inject(($rootScope, $httpBackend, $compile) => {
    self.outerScope = $rootScope.$new();
    self.$httpBackend = $httpBackend;

    self.outerScope.paymentFormState = 'unsubmitted';
    self.outerScope.onPaymentFormStateChange = () => {};
    const compiledElement = $compile(
      angular.element(
        '<bank-account-form payment-form-state="paymentFormState" on-payment-form-state-change="onPaymentFormStateChange($event)"></bank-account-form>',
      ),
    )(self.outerScope);
    self.outerScope.$apply();
    self.controller = compiledElement.controller(module.name);
    self.formController = self.controller.bankPaymentForm;
  }));

  describe('$onInit', () => {
    it('should call the necessary initialization functions', () => {
      jest
        .spyOn(self.controller, 'initExistingPaymentMethod')
        .mockImplementation(() => {});
      jest
        .spyOn(self.controller, 'waitForFormInitialization')
        .mockImplementation(() => {});
      self.controller.$onInit();

      expect(self.controller.initExistingPaymentMethod).toHaveBeenCalled();
      expect(self.controller.waitForFormInitialization).toHaveBeenCalled();
    });
  });

  describe('$onChanges', () => {
    it('should call savePayment when called directly with a mock change object', () => {
      jest.spyOn(self.controller, 'savePayment').mockImplementation(() => {});
      self.controller.$onChanges({
        paymentFormState: {
          currentValue: 'submitted',
        },
      });

      expect(self.controller.savePayment).toHaveBeenCalled();
    });

    it('should call savePayment state changes to submitted', () => {
      jest.spyOn(self.controller, 'savePayment').mockImplementation(() => {});
      self.outerScope.paymentFormState = 'submitted';
      self.outerScope.$apply();

      expect(self.controller.savePayment).toHaveBeenCalled();
    });
  });

  describe('initExistingPaymentMethod', () => {
    it('should populate the bankPayment fields if a paymentMethod is present', () => {
      self.controller.paymentMethod = {
        'account-type': 'Checking',
        'bank-name': 'Some Bank',
        'display-account-number': '1234',
        'routing-number': '021000021',
      };
      self.controller.initExistingPaymentMethod();

      expect(self.controller.bankPayment).toEqual({
        accountType: 'Checking',
        bankName: 'Some Bank',
        accountNumberPlaceholder: '1234',
        routingNumber: '021000021',
      });
    });
  });

  describe('waitForFormInitialization', () => {
    it('should call addCustomValidators when the form is initialized', () => {
      jest
        .spyOn(self.controller, 'addCustomValidators')
        .mockImplementation(() => {});
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
      expect(
        size(self.formController.accountNumber.$viewChangeListeners),
      ).toEqual(2);

      expect(size(self.formController.verifyAccountNumber.$parsers)).toEqual(2);
      expect(size(self.formController.verifyAccountNumber.$validators)).toEqual(
        2,
      );
    });
  });

  describe('savePayment', () => {
    const encryptedAccountNumber =
      'ckp3FnRl1+eHIuBXapX2K7wfKoXlSeUrgYXONJBiYpJwDK+nLa+7anu7TOY+Ypsl3bjSQYCuvt0OuHZtQcxJQYdOiDnpHliFqqc/mpw8dcb5DCTaTOIP3mm122o4tdlPHw6m+fgnOF3RIqkPPe0qGRNNr5fK9qmwjt5NcSZ1j+xWeNAT7AI6nPuqHHOOF2tggtQSwZ5cBdkJuF/KIJe6MY7PLMbMf209csz+zdMhnxu4nWM79FYVzAcFz3C62eEXp73xGULAkhTil9YAtLdYmdsQk6/46JlsRV2JfjFAHNU8/6ZAGo5JKEsi58SlWO1BLcuSa1/Z/Po2XcBmEbTXEA==';
    beforeEach(() => {
      jest
        .spyOn(self.formController, '$setSubmitted')
        .mockImplementation(() => {});
      jest.spyOn(self.controller, 'onPaymentFormStateChange');
      jest
        .spyOn(self.outerScope, 'onPaymentFormStateChange')
        .mockImplementation(() => {});
      jest.spyOn(cruPayments.bankAccount, 'init').mockImplementation(() => {});
      jest
        .spyOn(cruPayments.bankAccount, 'encrypt')
        .mockReturnValue(Observable.of(encryptedAccountNumber));
    });

    it('should call onPaymentFormStateChange to change state to unsubmitted when form is invalid', () => {
      self.controller.savePayment();

      expect(self.formController.$setSubmitted).toHaveBeenCalled();
      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({
        $event: { state: 'unsubmitted' },
      });
      expect(self.outerScope.onPaymentFormStateChange).toHaveBeenCalledWith({
        state: 'unsubmitted',
      });
    });

    it('should send a request to save the bank account payment info', () => {
      self.controller.bankPayment = {
        accountType: 'checking',
        bankName: 'First Bank',
        routingNumber: '123456789',
        accountNumber: '123456789012',
      };
      self.formController.$valid = true;
      self.controller.savePayment();

      expect(cruPayments.bankAccount.init).toHaveBeenCalledWith(
        'development',
        ccpStagingKey,
      );
      expect(cruPayments.bankAccount.encrypt).toHaveBeenCalledWith(
        '123456789012',
      );
      expect(self.formController.$setSubmitted).toHaveBeenCalled();
      const expectedData = {
        bankAccount: {
          'account-type': 'checking',
          'bank-name': 'First Bank',
          'encrypted-account-number': encryptedAccountNumber,
          'display-account-number': '9012',
          'routing-number': '123456789',
        },
      };

      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({
        $event: { state: 'loading', payload: expectedData },
      });
      expect(self.outerScope.onPaymentFormStateChange).toHaveBeenCalledWith({
        state: 'loading',
        payload: expectedData,
      });
    });

    it('should send a request to save the bank account payment info using the prod env', () => {
      self.controller.bankPayment = {
        accountType: 'checking',
        bankName: 'First Bank',
        routingNumber: '123456789',
        accountNumber: '123456789012',
      };
      self.formController.$valid = true;
      self.controller.envService.set('production');
      self.controller.savePayment();

      expect(cruPayments.bankAccount.init).toHaveBeenCalledWith(
        'production',
        ccpKey,
      );
      expect(cruPayments.bankAccount.encrypt).toHaveBeenCalledWith(
        '123456789012',
      );
      expect(self.formController.$setSubmitted).toHaveBeenCalled();
      const expectedData = {
        bankAccount: {
          'account-type': 'checking',
          'bank-name': 'First Bank',
          'encrypted-account-number': encryptedAccountNumber,
          'display-account-number': '9012',
          'routing-number': '123456789',
        },
      };

      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({
        $event: { state: 'loading', payload: expectedData },
      });
      expect(self.outerScope.onPaymentFormStateChange).toHaveBeenCalledWith({
        state: 'loading',
        payload: expectedData,
      });
    });

    it('should send a request to save the bank account payment info using the prodcloud env', () => {
      self.controller.bankPayment = {
        accountType: 'checking',
        bankName: 'First Bank',
        routingNumber: '123456789',
        accountNumber: '123456789012',
      };
      self.formController.$valid = true;
      self.controller.envService.set('prodcloud');
      self.controller.savePayment();

      expect(cruPayments.bankAccount.init).toHaveBeenCalledWith(
        'production',
        ccpKey,
      );
      expect(cruPayments.bankAccount.encrypt).toHaveBeenCalledWith(
        '123456789012',
      );
      expect(self.formController.$setSubmitted).toHaveBeenCalled();
      const expectedData = {
        bankAccount: {
          'account-type': 'checking',
          'bank-name': 'First Bank',
          'encrypted-account-number': encryptedAccountNumber,
          'display-account-number': '9012',
          'routing-number': '123456789',
        },
      };

      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({
        $event: { state: 'loading', payload: expectedData },
      });
      expect(self.outerScope.onPaymentFormStateChange).toHaveBeenCalledWith({
        state: 'loading',
        payload: expectedData,
      });
    });

    it('should send a request to save the bank account payment info using the preprod env', () => {
      self.controller.bankPayment = {
        accountType: 'checking',
        bankName: 'First Bank',
        routingNumber: '123456789',
        accountNumber: '123456789012',
      };
      self.formController.$valid = true;
      self.controller.envService.set('preprod');
      self.controller.savePayment();

      expect(cruPayments.bankAccount.init).toHaveBeenCalledWith(
        'production',
        ccpKey,
      );
      expect(cruPayments.bankAccount.encrypt).toHaveBeenCalledWith(
        '123456789012',
      );
      expect(self.formController.$setSubmitted).toHaveBeenCalled();
      const expectedData = {
        bankAccount: {
          'account-type': 'checking',
          'bank-name': 'First Bank',
          'encrypted-account-number': encryptedAccountNumber,
          'display-account-number': '9012',
          'routing-number': '123456789',
        },
      };

      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({
        $event: { state: 'loading', payload: expectedData },
      });
      expect(self.outerScope.onPaymentFormStateChange).toHaveBeenCalledWith({
        state: 'loading',
        payload: expectedData,
      });
    });

    it('should send a request to save the bank account payment info with an existing payment method where the accountNumber is empty', () => {
      self.controller.paymentMethod = {
        'display-account-number': '9012',
      };
      self.controller.bankPayment = {
        accountType: 'checking',
        bankName: 'First Bank',
        routingNumber: '123456789',
        accountNumber: '',
      };
      self.formController.$valid = true;
      self.controller.savePayment();

      expect(self.formController.$setSubmitted).toHaveBeenCalled();
      const expectedData = {
        bankAccount: {
          'account-type': 'checking',
          'bank-name': 'First Bank',
          'encrypted-account-number': '',
          'display-account-number': '9012',
          'routing-number': '123456789',
        },
      };

      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({
        $event: { state: 'loading', payload: expectedData },
      });
      expect(self.outerScope.onPaymentFormStateChange).toHaveBeenCalledWith({
        state: 'loading',
        payload: expectedData,
      });
    });

    it('should handle an error while encrypting the bank account number', () => {
      self.formController.$valid = true;
      cruPayments.bankAccount.encrypt.mockReturnValue(
        Observable.throw('some error'),
      );
      self.controller.savePayment();

      expect(self.formController.$setSubmitted).toHaveBeenCalled();
      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({
        $event: { state: 'error', error: 'some error' },
      });
      expect(self.outerScope.onPaymentFormStateChange).toHaveBeenCalledWith({
        state: 'error',
        error: 'some error',
      });
      expect(self.controller.$log.error.logs[0]).toEqual([
        'Error encrypting bank account number',
        'some error',
      ]);
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
      it('should not be valid if the field is empty', () => {
        self.formController.bankName.$setViewValue('');

        expect(self.formController.bankName.$valid).toEqual(false);
        expect(self.formController.bankName.$error.required).toEqual(true);
      });

      it('should be valid if there is something in the input', () => {
        self.formController.bankName.$setViewValue('Some Bank');

        expect(self.formController.bankName.$valid).toEqual(true);
      });
    });

    describe('accountType input', () => {
      it('should not be valid if the field is empty', () => {
        self.formController.accountType.$setViewValue('');

        expect(self.formController.accountType.$valid).toEqual(false);
        expect(self.formController.routingNumber.$error.required).toEqual(true);
      });

      it('should be valid if checking is selected', () => {
        self.formController.accountType.$setViewValue('checking');

        expect(self.formController.accountType.$valid).toEqual(true);
      });

      it('should be valid if savings is selected', () => {
        self.formController.accountType.$setViewValue('savings');

        expect(self.formController.accountType.$valid).toEqual(true);
      });
    });

    describe('routingNumber input', () => {
      it('should not be valid if the field is empty', () => {
        self.formController.routingNumber.$setViewValue('');

        expect(self.formController.routingNumber.$valid).toEqual(false);
        expect(self.formController.routingNumber.$error.required).toEqual(true);
      });

      it('should not be valid if there are less than 9 digits', () => {
        self.formController.routingNumber.$setViewValue('12345678');

        expect(self.formController.routingNumber.$valid).toEqual(false);
        expect(
          self.formController.routingNumber.$error.required,
        ).toBeUndefined();
        expect(self.formController.routingNumber.$error.length).toEqual(true);
      });

      it('should not be valid if there are more than 9 digits', () => {
        self.formController.routingNumber.$setViewValue('1234567890');

        expect(self.formController.routingNumber.$valid).toEqual(false);
        expect(
          self.formController.routingNumber.$error.required,
        ).toBeUndefined();
        expect(self.formController.routingNumber.$error.length).toEqual(true);
      });

      it('should not be valid if the checksum is incorrect ', () => {
        self.formController.routingNumber.$setViewValue('123456789');

        expect(self.formController.routingNumber.$valid).toEqual(false);
        expect(
          self.formController.routingNumber.$error.required,
        ).toBeUndefined();
        expect(self.formController.routingNumber.$error.length).toBeUndefined();
        expect(self.formController.routingNumber.$error.checksum).toEqual(true);
      });

      it('should be valid if the checksum is correct', () => {
        self.formController.routingNumber.$setViewValue('267084131');

        expect(self.formController.routingNumber.$valid).toEqual(true);
        expect(
          self.formController.routingNumber.$error.required,
        ).toBeUndefined();
        expect(self.formController.routingNumber.$error.length).toBeUndefined();
        expect(
          self.formController.routingNumber.$error.checksum,
        ).toBeUndefined();
      });

      it('should have the stripNonDigits parser', () => {
        self.formController.routingNumber.$setViewValue(
          '2a670-84!1dsafsdafasdf asdfasdf31',
        );

        expect(self.formController.routingNumber.$valid).toEqual(true);
      });
    });

    describe('accountNumber input', () => {
      it('should not be valid if the field is empty', () => {
        self.formController.accountNumber.$setViewValue('');

        expect(self.formController.accountNumber.$valid).toEqual(false);
        expect(self.formController.accountNumber.$error.required).toEqual(true);
      });

      it('should be valid if the field is empty and an existing payment method is present', () => {
        self.controller.paymentMethod = {};
        self.formController.accountNumber.$setViewValue('');

        expect(self.formController.accountNumber.$valid).toEqual(true);
        expect(
          self.formController.accountNumber.$error.required,
        ).toBeUndefined();
        expect(
          self.formController.accountNumber.$error.minlength,
        ).toBeUndefined();
      });

      it('should not be valid if there are less than 2 digits', () => {
        self.formController.accountNumber.$setViewValue('1');

        expect(self.formController.accountNumber.$valid).toEqual(false);
        expect(
          self.formController.accountNumber.$error.required,
        ).toBeUndefined();
        expect(self.formController.accountNumber.$error.minLength).toEqual(
          true,
        );
      });

      it('should not be valid if there are more than 17 digits', () => {
        self.formController.accountNumber.$setViewValue('123456789012345678');

        expect(self.formController.accountNumber.$valid).toEqual(false);
        expect(
          self.formController.accountNumber.$error.required,
        ).toBeUndefined();
        expect(self.formController.accountNumber.$error.maxLength).toEqual(
          true,
        );
      });

      it('should be valid if the length is correct', () => {
        self.formController.accountNumber.$setViewValue('1234567890123456');

        expect(self.formController.accountNumber.$valid).toEqual(true);
        expect(
          self.formController.accountNumber.$error.required,
        ).toBeUndefined();
        expect(
          self.formController.accountNumber.$error.minLength,
        ).toBeUndefined();
        expect(
          self.formController.accountNumber.$error.maxLength,
        ).toBeUndefined();
      });

      it('should have the stripNonDigits parser', () => {
        self.formController.accountNumber.$setViewValue(
          '1#$$^%2s345 67g89sdafsadfsa0',
        );

        expect(self.formController.accountNumber.$valid).toEqual(true);
      });
    });

    describe('verifyAccountNumber input', () => {
      it('should not be valid if the field is empty and accountNumber is valid', () => {
        self.formController.accountNumber.$setViewValue('1234567890123456');
        self.formController.verifyAccountNumber.$setViewValue('');

        expect(self.formController.verifyAccountNumber.$valid).toEqual(false);
        expect(self.formController.verifyAccountNumber.$error.required).toEqual(
          true,
        );
      });

      it('should be valid if the field is empty and accountNumber is empty (using existing payment method)', () => {
        self.controller.paymentMethod = {};

        expect(self.formController.verifyAccountNumber.$valid).toEqual(true);
        expect(
          self.formController.verifyAccountNumber.$error.required,
        ).toBeUndefined();
      });

      it('should be valid if the account numbers match', () => {
        self.formController.accountNumber.$setViewValue('1234567890123456');
        self.formController.verifyAccountNumber.$setViewValue(
          '1234567890123456',
        );

        expect(self.formController.verifyAccountNumber.$valid).toEqual(true);
        expect(
          self.formController.verifyAccountNumber.$error.required,
        ).toBeUndefined();
        expect(
          self.formController.verifyAccountNumber.$error.verifyAccountNumber,
        ).toBeUndefined();
      });

      it('should be become valid if the accountNumber is updated to match the verifyAccountNumber', () => {
        self.formController.verifyAccountNumber.$setViewValue(
          '1234567890123456',
        );
        self.formController.accountNumber.$setViewValue('1234567890123456');

        expect(self.formController.verifyAccountNumber.$valid).toEqual(true);
        expect(
          self.formController.verifyAccountNumber.$error.required,
        ).toBeUndefined();
        expect(
          self.formController.verifyAccountNumber.$error.verifyAccountNumber,
        ).toBeUndefined();
      });

      it('should have the stripNonDigits parser', () => {
        self.formController.accountNumber.$setViewValue(
          '1#$$^%2s345 67g89sdafsadfsa0',
        );
        self.formController.verifyAccountNumber.$setViewValue(
          '123asdf! 4@%$#56 7d$%8d90',
        );

        expect(self.formController.verifyAccountNumber.$valid).toEqual(true);
      });
    });

    describe('acceptedAgreement input', () => {
      it('should not be valid if the field is empty', () => {
        self.formController.acceptedAgreement.$setViewValue(false);

        expect(self.formController.acceptedAgreement.$valid).toEqual(false);
        expect(self.formController.acceptedAgreement.$error.required).toEqual(
          true,
        );
      });

      it('should be valid if the box is checked', () => {
        self.formController.acceptedAgreement.$setViewValue(true);

        expect(self.formController.acceptedAgreement.$valid).toEqual(true);
        expect(
          self.formController.acceptedAgreement.$error.required,
        ).toBeUndefined();
      });
    });
  });
});
