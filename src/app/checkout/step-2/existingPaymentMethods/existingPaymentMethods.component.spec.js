import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/toPromise';
import * as cruPayments from '@cruglobal/cru-payments/dist/cru-payments';

import { SignInEvent } from 'common/services/session/session.service';

import module from './existingPaymentMethods.component';

describe('checkout', () => {
  describe('step 2', () => {
    describe('existing payment methods', () => {
      beforeEach(angular.mock.module(module.name));
      const self = {};

      beforeEach(inject(($componentController, $timeout, $window) => {
        self.$timeout = $timeout;

        self.controller = $componentController(
          module.name,
          {},
          {
            onLoad: jest.fn(),
            onPaymentChange: jest.fn(),
            enableContinue: jest.fn(),
            onPaymentFormStateChange: jest.fn(),
            cartData: { items: [] },
            creditCardPaymentForm: {
              securityCode: {
                $valid: true,
                $validators: {
                  minLength: (value) =>
                    cruPayments.creditCard.cvv.validate.minLength(value),
                  maxLength: cruPayments.creditCard.cvv.validate.maxLength,
                },
                $setViewValue: jest.fn(),
                $render: jest.fn(),
              },
            },
            selectedPaymentMethod: {
              cvv: '',
              'card-type': 'Visa',
            },
          },
        );
        self.$window = $window;
        self.$window.sessionStorage.clear();
      }));

      describe('$onInit', () => {
        it('should call loadPaymentMethods', () => {
          jest
            .spyOn(self.controller, 'loadPaymentMethods')
            .mockImplementation(() => {});
          jest
            .spyOn(self.controller, 'waitForFormInitialization')
            .mockImplementation(() => {});
          self.controller.$onInit();

          expect(self.controller.loadPaymentMethods).toHaveBeenCalled();
          expect(self.controller.waitForFormInitialization).toHaveBeenCalled();
        });

        it('should be called on sign in', () => {
          jest.spyOn(self.controller, '$onInit').mockImplementation(() => {});
          self.controller.$scope.$broadcast(SignInEvent);

          expect(self.controller.$onInit).toHaveBeenCalled();
        });
      });

      describe('$onChanges', () => {
        beforeEach(() => {
          jest
            .spyOn(self.controller, 'selectPayment')
            .mockImplementation(() => {});
        });
        it('should call selectPayment when called with a mock change object', () => {
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'submitted',
            },
          });

          expect(self.controller.selectPayment).toHaveBeenCalled();
        });

        it('should not call selectPayment when form is unsubmitted', () => {
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'unsubmitted',
            },
          });

          expect(self.controller.selectPayment).not.toHaveBeenCalled();
        });

        it('should not call selectPayment when paymentMethodFormModal is open', () => {
          self.controller.paymentMethodFormModal = {};
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'submitted',
            },
          });

          expect(self.controller.selectPayment).not.toHaveBeenCalled();
        });

        it('should call loadPaymentMethods when called with a mock change object', () => {
          jest
            .spyOn(self.controller, 'loadPaymentMethods')
            .mockImplementation(() => {});
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'success',
            },
          });

          expect(self.controller.loadPaymentMethods).toHaveBeenCalled();
        });

        it("should not call loadPaymentMethods when submitSuccess hasn't changed to true", () => {
          jest
            .spyOn(self.controller, 'loadPaymentMethods')
            .mockImplementation(() => {});
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'loading',
            },
          });

          expect(self.controller.loadPaymentMethods).not.toHaveBeenCalled();
        });

        it('should pass the form error through when paymentFormError changes', () => {
          self.controller.$onChanges({
            paymentFormError: {
              currentValue: 'some error',
            },
          });

          expect(self.controller.paymentFormResolve.error).toEqual(
            'some error',
          );
        });
      });

      describe('loadPaymentMethods', () => {
        beforeEach(() => {
          self.controller.paymentMethodFormModal = {
            close: jest.fn(),
          };
          self.controller.submissionError = {};
        });

        afterEach(() => {
          expect(
            self.controller.paymentMethodFormModal.close,
          ).toHaveBeenCalled();
        });

        it('should load existing payment methods successfully if any exist', () => {
          jest
            .spyOn(self.controller.orderService, 'getExistingPaymentMethods')
            .mockImplementation(() => Observable.of(['first payment method']));
          jest
            .spyOn(self.controller, 'selectDefaultPaymentMethod')
            .mockImplementation(() => {});
          self.controller.loadPaymentMethods();

          expect(self.controller.paymentMethods).toEqual([
            'first payment method',
          ]);
          expect(self.controller.selectDefaultPaymentMethod).toHaveBeenCalled();
          expect(self.controller.onLoad).toHaveBeenCalledWith({
            success: true,
            hasExistingPaymentMethods: true,
            selectedPaymentMethod: self.controller.selectedPaymentMethod,
          });
        });

        it('should try load existing payment methods even if none exist', () => {
          jest
            .spyOn(self.controller.orderService, 'getExistingPaymentMethods')
            .mockImplementation(() => Observable.of([]));
          jest
            .spyOn(self.controller, 'selectDefaultPaymentMethod')
            .mockImplementation(() => {});
          self.controller.loadPaymentMethods();

          expect(self.controller.paymentMethods).toBeUndefined();
          expect(
            self.controller.selectDefaultPaymentMethod,
          ).not.toHaveBeenCalled();
          expect(self.controller.onLoad).toHaveBeenCalledWith({
            success: true,
            hasExistingPaymentMethods: false,
          });
        });

        it('should handle a failure loading payment methods', () => {
          jest
            .spyOn(self.controller.orderService, 'getExistingPaymentMethods')
            .mockImplementation(() => Observable.throw('some error'));
          jest
            .spyOn(self.controller, 'selectDefaultPaymentMethod')
            .mockImplementation(() => {});
          self.controller.loadPaymentMethods();

          expect(self.controller.paymentMethods).toBeUndefined();
          expect(
            self.controller.selectDefaultPaymentMethod,
          ).not.toHaveBeenCalled();
          expect(self.controller.onLoad).toHaveBeenCalledWith({
            success: false,
            error: 'some error',
          });
          expect(self.controller.$log.error.logs[0]).toEqual([
            'Error loading paymentMethods',
            'some error',
          ]);
        });
      });

      describe('selectDefaultPaymentMethod', () => {
        beforeEach(() => {
          jest
            .spyOn(self.controller, 'validPaymentMethod')
            .mockReturnValue(true);
        });

        it('should choose the payment method that is marked chosen in cortex', () => {
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri',
            },
            {
              selectAction: 'second uri',
              chosen: true,
            },
          ];
          self.controller.selectDefaultPaymentMethod();

          expect(self.controller.selectedPaymentMethod).toEqual({
            selectAction: 'second uri',
            chosen: true,
          });
        });

        it('should choose the first payment method if none are marked chosen in cortex', () => {
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri',
            },
            {
              selectAction: 'second uri',
            },
          ];
          self.controller.selectDefaultPaymentMethod();

          expect(self.controller.selectedPaymentMethod).toEqual({
            selectAction: 'first uri',
          });
        });

        it('should choose the first payment method if the one marked chosen in cortex is invalid', () => {
          jest
            .spyOn(self.controller, 'validPaymentMethod')
            .mockImplementation(
              (paymentMethod) => paymentMethod.selectAction === 'first uri',
            );
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri',
            },
            {
              selectAction: 'second uri',
              chosen: true,
            },
          ];
          self.controller.selectDefaultPaymentMethod();

          expect(self.controller.selectedPaymentMethod).toEqual({
            selectAction: 'first uri',
          });
        });

        it('should set selectedPaymentMethod to undefined if none are valid', () => {
          jest
            .spyOn(self.controller, 'validPaymentMethod')
            .mockReturnValue(undefined);
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri',
            },
            {
              selectAction: 'second uri',
              chosen: true,
            },
          ];
          self.controller.selectDefaultPaymentMethod();

          expect(self.controller.selectedPaymentMethod).toBeUndefined();
        });

        it('should check whether or not the fee coverage should be altered based on selected payment type', () => {
          jest
            .spyOn(self.controller, 'switchPayment')
            .mockImplementation(() => {});
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri',
            },
            {
              selectAction: 'second uri',
              chosen: true,
            },
          ];

          self.controller.selectDefaultPaymentMethod();
          expect(self.controller.switchPayment).toHaveBeenCalled();
        });
      });

      describe('openPaymentMethodFormModal', () => {
        it('should open the paymentMethodForm modal', () => {
          jest.spyOn(self.controller.$uibModal, 'open');
          self.controller.openPaymentMethodFormModal();

          expect(self.controller.$uibModal.open).toHaveBeenCalled();
          expect(self.controller.paymentMethodFormModal).toBeDefined();

          // Test calling onSubmit
          self.controller.$uibModal.open.mock.calls[0][0].resolve.onPaymentFormStateChange()(
            { $event: { state: 'loading', payload: 'some data' } },
          );

          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith(
            {
              $event: {
                state: 'loading',
                payload: 'some data',
                stayOnStep: true,
                update: false,
                paymentMethodToUpdate: undefined,
              },
            },
          );
        });

        it('should call onPaymentFormStateChange to clear submissionErrors when the modal closes', () => {
          jest
            .spyOn(self.controller.$uibModal, 'open')
            .mockReturnValue({ result: Observable.throw('').toPromise() });
          self.controller.openPaymentMethodFormModal();
          self.$timeout(() => {
            expect(
              self.controller.onPaymentFormStateChange,
            ).toHaveBeenCalledWith({ $event: { state: 'unsubmitted' } });
            expect(self.controller.paymentMethodFormModal).toBeUndefined();
          }, 0);
        });
      });

      describe('selectPayment', () => {
        beforeEach(() => {
          jest
            .spyOn(self.controller.orderService, 'selectPaymentMethod')
            .mockImplementation(() => {});
          jest
            .spyOn(self.controller.orderService, 'storeCardSecurityCode')
            .mockImplementation(() => {});
        });

        it('should save the selected bank account', () => {
          self.controller.selectedPaymentMethod = {
            'account-type': 'Checking',
            self: {
              type: 'elasticpath.bankaccounts.bank-account',
              uri: 'selected uri',
            },
            selectAction: 'some uri',
          };
          self.controller.orderService.selectPaymentMethod.mockReturnValue(
            Observable.of('success'),
          );
          self.controller.selectPayment();

          expect(
            self.controller.orderService.selectPaymentMethod,
          ).toHaveBeenCalledWith('some uri');
          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith(
            { $event: { state: 'loading' } },
          );
          expect(
            self.controller.orderService.storeCardSecurityCode,
          ).toHaveBeenCalledWith(null, 'selected uri');
        });

        it('should save the selected credit card', () => {
          self.controller.selectedPaymentMethod = {
            'card-type': 'Visa',
            self: {
              type: 'cru.creditcards.named-credit-card',
              uri: 'selected uri',
            },
            selectAction: 'some uri',
          };
          self.controller.orderService.selectPaymentMethod.mockReturnValue(
            Observable.of('success'),
          );
          self.controller.selectPayment();

          expect(
            self.controller.orderService.selectPaymentMethod,
          ).toHaveBeenCalledWith('some uri');
          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith(
            { $event: { state: 'loading' } },
          );
          expect(
            self.controller.orderService.storeCardSecurityCode,
          ).toHaveBeenCalledWith(null, 'selected uri');
        });

        it('should handle a failed request to save the selected payment', () => {
          self.controller.selectedPaymentMethod = {
            self: { type: 'elasticpath.bankaccounts.bank-account' },
          };
          self.controller.orderService.selectPaymentMethod.mockReturnValue(
            Observable.throw('some error'),
          );
          self.controller.selectPayment();

          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith(
            { $event: { state: 'error', error: 'some error' } },
          );
          expect(
            self.controller.orderService.storeCardSecurityCode,
          ).not.toHaveBeenCalled();
          expect(self.controller.$log.error.logs[0]).toEqual([
            'Error selecting payment method',
            'some error',
          ]);
        });

        it('should not send a request if the payment is already selected', () => {
          self.controller.selectedPaymentMethod = {
            self: {
              type: 'elasticpath.bankaccounts.bank-account',
              uri: 'chosen uri',
            },
            chosen: true,
          };
          self.controller.selectPayment();

          expect(
            self.controller.orderService.selectPaymentMethod,
          ).not.toHaveBeenCalled();
          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith(
            { $event: { state: 'loading' } },
          );
          expect(
            self.controller.orderService.storeCardSecurityCode,
          ).toHaveBeenCalledWith(null, 'chosen uri');
        });
      });

      describe('switchPayment', () => {
        beforeEach(() => {
          jest
            .spyOn(self.controller.orderService, 'retrieveCoverFeeDecision')
            .mockImplementation(() => true);
          jest
            .spyOn(self.controller.orderService, 'storeCoverFeeDecision')
            .mockImplementation(() => {});
        });

        it('should remove fees if the newly selected payment method is EFT', () => {
          self.controller.selectedPaymentMethod = { 'bank-name': 'My Bank' };

          self.controller.switchPayment();
          expect(self.controller.onPaymentChange).toHaveBeenCalledWith({
            selectedPaymentMethod: self.controller.selectedPaymentMethod,
          });
          expect(
            self.controller.orderService.storeCoverFeeDecision,
          ).toHaveBeenCalledWith(false);
        });

        it('should handle undefined payment methods', () => {
          self.controller.selectedPaymentMethod = undefined;

          self.controller.switchPayment();
          expect(self.controller.onPaymentChange).toHaveBeenCalledWith({
            selectedPaymentMethod: undefined,
          });
          expect(
            self.controller.orderService.storeCoverFeeDecision,
          ).not.toHaveBeenCalled();
        });

        it('should reset securityCode viewValue', () => {
          self.controller.switchPayment();

          expect(
            self.controller.creditCardPaymentForm.securityCode.$setViewValue,
          ).toHaveBeenCalledWith('');
          expect(
            self.controller.creditCardPaymentForm.securityCode.$render,
          ).toHaveBeenCalled();
        });

        it('should not add securityCode viewValue from sessionStorage', () => {
          self.$window.sessionStorage.setItem('cvv', '456');
          self.controller.shouldRecoverCvv = true;
          self.controller.switchPayment();

          expect(
            self.controller.creditCardPaymentForm.securityCode.$setViewValue,
          ).toHaveBeenCalledWith('');
          expect(
            self.controller.creditCardPaymentForm.securityCode.$render,
          ).toHaveBeenCalled();
        });
      });

      describe('addCvvValidators', () => {
        it('should add a watch on the security code value', () => {
          self.controller.creditCardPaymentForm = {
            $valid: true,
            $dirty: false,
            securityCode: {
              $viewValue: '123',
              $validators: {},
            },
          };
          self.controller.addCvvValidators();
          expect(self.controller.$scope.$$watchers.length).toEqual(1);
          expect(self.controller.$scope.$$watchers[0].exp).toEqual(
            '$ctrl.creditCardPaymentForm.securityCode.$viewValue',
          );
        });

        it('should add validator functions to creditCardPaymentForm.securityCode', () => {
          jest.spyOn(self.controller, 'addCvvValidators');
          self.controller.selectedPaymentMethod.self = {
            type: 'cru.creditcards.named-credit-card',
            uri: 'selected uri',
          };
          self.controller.waitForFormInitialization();
          self.controller.$scope.$digest();

          expect(self.controller.addCvvValidators).toHaveBeenCalled();
          expect(
            Object.keys(
              self.controller.creditCardPaymentForm.securityCode.$validators,
            ).length,
          ).toEqual(2);
          expect(
            typeof self.controller.creditCardPaymentForm.securityCode
              .$validators.minLength,
          ).toBe('function');
          expect(
            typeof self.controller.creditCardPaymentForm.securityCode
              .$validators.maxLength,
          ).toBe('function');
        });

        it('should call enableContinue when cvv is valid', () => {
          self.controller.creditCardPaymentForm.securityCode.$viewValue = '123';
          self.controller.addCvvValidators();
          self.controller.$scope.$apply();

          expect(self.controller.enableContinue).toHaveBeenCalledWith({
            $event: true,
          });
        });

        it('should call enableContinue when cvv is too long', () => {
          self.controller.creditCardPaymentForm.securityCode.$viewValue =
            '12345';
          self.controller.addCvvValidators();
          self.controller.$scope.$apply();

          expect(self.controller.enableContinue).toHaveBeenCalledWith({
            $event: false,
          });
        });

        it('should call enableContinue when cvv is too short', () => {
          self.controller.creditCardPaymentForm.securityCode.$viewValue = '1';
          self.controller.addCvvValidators();
          self.controller.$scope.$apply();

          expect(self.controller.enableContinue).toHaveBeenCalledWith({
            $event: false,
          });
        });
      });
    });
  });
});
