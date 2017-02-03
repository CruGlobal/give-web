import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/toPromise';

import {existingPaymentMethodFlag} from 'common/services/api/order.service';

import module from './existingPaymentMethods.component';

describe('checkout', () => {
  describe('step 2', () => {
    describe('existing payment methods', () => {
      beforeEach(angular.mock.module(module.name));
      let self = {};

      beforeEach(inject(($componentController, $timeout) => {
        self.$timeout = $timeout;

        self.controller = $componentController(module.name, {}, {
          onLoad: jasmine.createSpy('onLoad'),
          onPaymentFormStateChange: jasmine.createSpy('onPaymentFormStateChange')
        });
      }));

      describe('$onInit', () => {
        it('should call loadPaymentMethods', () => {
          spyOn(self.controller, 'loadPaymentMethods');
          self.controller.$onInit();
          expect(self.controller.loadPaymentMethods).toHaveBeenCalled();
        });
      });

      describe('$onChanges', () => {
        it('should call selectPayment when called with a mock change object', () => {
          spyOn(self.controller, 'selectPayment');
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'submitted'
            }
          });
          expect(self.controller.selectPayment).toHaveBeenCalled();
        });
        it('should not call selectPayment when form is unsubmitted', () => {
          spyOn(self.controller, 'selectPayment');
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'unsubmitted'
            }
          });
          expect(self.controller.selectPayment).not.toHaveBeenCalled();
        });
        it('should not call selectPayment when paymentMethodFormModal is open', () => {
          self.controller.paymentMethodFormModal = {};
          spyOn(self.controller, 'selectPayment');
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'submitted'
            }
          });
          expect(self.controller.selectPayment).not.toHaveBeenCalled();
        });
        it('should call loadPaymentMethods when called with a mock change object', () => {
          spyOn(self.controller, 'loadPaymentMethods');
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'success'
            }
          });
          expect(self.controller.loadPaymentMethods).toHaveBeenCalled();
        });
        it('should not call loadPaymentMethods when submitSuccess hasn\'t changed to true', () => {
          spyOn(self.controller, 'loadPaymentMethods');
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'loading'
            }
          });
          expect(self.controller.loadPaymentMethods).not.toHaveBeenCalled();
        });
        it('should pass the form error through when paymentFormError changes', () => {
          self.controller.$onChanges({
            paymentFormError: {
              currentValue: 'some error'
            }
          });
          expect(self.controller.paymentFormResolve.error).toEqual('some error');
        });
      });

      describe('loadPaymentMethods', () => {
        beforeEach(() => {
          self.controller.paymentMethodFormModal = {
            close: jasmine.createSpy('close')
          };
          self.controller.submissionError = {};
        });

        afterEach(() => {
          expect(self.controller.paymentMethodFormModal.close).toHaveBeenCalled();
        });

        it('should load existing payment methods successfully if any exist', () => {
          spyOn(self.controller.orderService, 'getExistingPaymentMethods').and.callFake(() => Observable.of(['first payment method']));
          spyOn(self.controller, 'selectDefaultPaymentMethod');
          self.controller.loadPaymentMethods();
          expect(self.controller.paymentMethods).toEqual(['first payment method']);
          expect(self.controller.selectDefaultPaymentMethod).toHaveBeenCalled();
          expect(self.controller.onLoad).toHaveBeenCalledWith({success: true, hasExistingPaymentMethods: true});
        });
        it('should try load existing payment methods even if none exist', () => {
          spyOn(self.controller.orderService, 'getExistingPaymentMethods').and.callFake(() => Observable.of([]));
          spyOn(self.controller, 'selectDefaultPaymentMethod');
          self.controller.loadPaymentMethods();
          expect(self.controller.paymentMethods).toBeUndefined();
          expect(self.controller.selectDefaultPaymentMethod).not.toHaveBeenCalled();
          expect(self.controller.onLoad).toHaveBeenCalledWith({success: true, hasExistingPaymentMethods: false});
        });
        it('should handle a failure loading payment methods', () => {
          spyOn(self.controller.orderService, 'getExistingPaymentMethods').and.callFake(() => Observable.throw('some error'));
          spyOn(self.controller, 'selectDefaultPaymentMethod');
          self.controller.loadPaymentMethods();
          expect(self.controller.paymentMethods).toBeUndefined();
          expect(self.controller.selectDefaultPaymentMethod).not.toHaveBeenCalled();
          expect(self.controller.onLoad).toHaveBeenCalledWith({success: false, error: 'some error'});
          expect(self.controller.$log.error.logs[0]).toEqual(['Error loading paymentMethods', 'some error']);
        });
      });

      describe('selectDefaultPaymentMethod', () => {
        it('should choose the payment method that is marked chosen in cortex', () => {
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri'
            },
            {
              selectAction: 'second uri',
              chosen: true
            }
          ];
          self.controller.selectDefaultPaymentMethod();
          expect(self.controller.selectedPaymentMethod).toEqual({ selectAction: 'second uri', chosen: true });
        });
        it('should choose the first payment method if none are marked chosen in cortex', () => {
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri'
            },
            {
              selectAction: 'second uri'
            }
          ];
          self.controller.selectDefaultPaymentMethod();
          expect(self.controller.selectedPaymentMethod).toEqual({ selectAction: 'first uri' });
        });
      });

      describe('openPaymentMethodFormModal', () => {
        it('should open the paymentMethodForm modal', () => {
          spyOn(self.controller.$uibModal, 'open').and.callThrough();
          self.controller.openPaymentMethodFormModal();
          expect(self.controller.$uibModal.open).toHaveBeenCalled();
          expect(self.controller.paymentMethodFormModal).toBeDefined();

          // Test calling onSubmit
          self.controller.$uibModal.open.calls.first().args[0].resolve.onPaymentFormStateChange()({ $event: { state: 'loading', payload: 'some data' } });
          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'loading', payload: 'some data', stayOnStep: true } });
        });
        it('should call onPaymentFormStateChange to clear submissionErrors when the modal closes', () => {
          spyOn(self.controller.$uibModal, 'open').and.returnValue({ result: Observable.throw('').toPromise() });
          self.controller.openPaymentMethodFormModal();
          self.$timeout(() => {
            expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'unsubmitted' } });
            expect(self.controller.paymentMethodFormModal).toBeUndefined();
          }, 0);
        });
      });

      describe('selectPayment', () => {
        beforeEach(() => {
          spyOn(self.controller.orderService, 'selectPaymentMethod');
          spyOn(self.controller.orderService, 'storeCardSecurityCode');
        });

        it('should save the selected payment', () => {
          self.controller.selectedPaymentMethod = { self: { type: 'elasticpath.bankaccounts.bank-account' }, selectAction: 'some uri' };
          self.controller.orderService.selectPaymentMethod.and.returnValue(Observable.of('success'));
          self.controller.selectPayment();
          expect(self.controller.orderService.selectPaymentMethod).toHaveBeenCalledWith('some uri' );
          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'loading' } });
          expect(self.controller.orderService.storeCardSecurityCode).toHaveBeenCalledWith(existingPaymentMethodFlag);
        });
        it('should handle a failed request to save the selected payment', () => {
          self.controller.selectedPaymentMethod = { self: { type: 'elasticpath.bankaccounts.bank-account' } };
          self.controller.orderService.selectPaymentMethod.and.returnValue(Observable.throw('some error'));
          self.controller.selectPayment();
          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'error', error: 'some error' } });
          expect(self.controller.orderService.storeCardSecurityCode).not.toHaveBeenCalled();
          expect(self.controller.$log.error.logs[0]).toEqual(['Error selecting payment method', 'some error']);
        });
        it('should not send a request if the payment is already selected', () => {
          self.controller.selectedPaymentMethod = { self: { type: 'elasticpath.bankaccounts.bank-account'}, chosen: true };
          self.controller.selectPayment();
          expect(self.controller.orderService.selectPaymentMethod).not.toHaveBeenCalled();
          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'loading' } });
        });
      });
    });
  });
});
