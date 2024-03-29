import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/toPromise'

import { SignInEvent } from 'common/services/session/session.service'

import module from './existingPaymentMethods.component'

describe('checkout', () => {
  describe('step 2', () => {
    describe('existing payment methods', () => {
      beforeEach(angular.mock.module(module.name))
      const self = {}

      beforeEach(inject(($componentController, $timeout) => {
        self.$timeout = $timeout

        self.controller = $componentController(module.name, {}, {
          onLoad: jest.fn(),
          onPaymentChange: jest.fn(),
          onPaymentFormStateChange: jest.fn(),
          cartData: { items: [] }
        })
      }))


      describe('$onInit', () => {
        it('should call loadPaymentMethods', () => {
          jest.spyOn(self.controller, 'loadPaymentMethods').mockImplementation(() => {})
          self.controller.$onInit()

          expect(self.controller.loadPaymentMethods).toHaveBeenCalled()
        })

        it('should be called on sign in', () => {
          jest.spyOn(self.controller, '$onInit').mockImplementation(() => {})
          self.controller.$scope.$broadcast(SignInEvent)

          expect(self.controller.$onInit).toHaveBeenCalled()
        })
      })

      describe('$onChanges', () => {
        beforeEach(() => {
          jest.spyOn(self.controller, 'selectPayment').mockImplementation(() => {})
        })
        it('should call selectPayment when called with a mock change object', () => {
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'submitted'
            }
          })

          expect(self.controller.selectPayment).toHaveBeenCalled()
        })

        it('should not call selectPayment when form is unsubmitted', () => {
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'unsubmitted'
            }
          })

          expect(self.controller.selectPayment).not.toHaveBeenCalled()
        })

        it('should not call selectPayment when paymentMethodFormModal is open', () => {
          self.controller.paymentMethodFormModal = {}
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'submitted'
            }
          })

          expect(self.controller.selectPayment).not.toHaveBeenCalled()
        })

        it('should call loadPaymentMethods when called with a mock change object', () => {
          jest.spyOn(self.controller, 'loadPaymentMethods').mockImplementation(() => {})
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'success'
            }
          })

          expect(self.controller.loadPaymentMethods).toHaveBeenCalled()
        })

        it('should not call loadPaymentMethods when submitSuccess hasn\'t changed to true', () => {
          jest.spyOn(self.controller, 'loadPaymentMethods').mockImplementation(() => {})
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'loading'
            }
          })

          expect(self.controller.loadPaymentMethods).not.toHaveBeenCalled()
        })

        it('should pass the form error through when paymentFormError changes', () => {
          self.controller.$onChanges({
            paymentFormError: {
              currentValue: 'some error'
            }
          })

          expect(self.controller.paymentFormResolve.error).toEqual('some error')
        })
      })

      describe('loadPaymentMethods', () => {
        beforeEach(() => {
          self.controller.paymentMethodFormModal = {
            close: jest.fn()
          }
          self.controller.submissionError = {}
        })

        afterEach(() => {
          expect(self.controller.paymentMethodFormModal.close).toHaveBeenCalled()
        })

        it('should load existing payment methods successfully if any exist', () => {
          jest.spyOn(self.controller.orderService, 'getExistingPaymentMethods').mockImplementation(() => Observable.of(['first payment method']))
          jest.spyOn(self.controller, 'selectDefaultPaymentMethod').mockImplementation(() => {})
          self.controller.loadPaymentMethods()

          expect(self.controller.paymentMethods).toEqual(['first payment method'])
          expect(self.controller.selectDefaultPaymentMethod).toHaveBeenCalled()
          expect(self.controller.onLoad).toHaveBeenCalledWith({ success: true, hasExistingPaymentMethods: true, selectedPaymentMethod: self.controller.selectedPaymentMethod })
        })

        it('should try load existing payment methods even if none exist', () => {
          jest.spyOn(self.controller.orderService, 'getExistingPaymentMethods').mockImplementation(() => Observable.of([]))
          jest.spyOn(self.controller, 'selectDefaultPaymentMethod').mockImplementation(() => {})
          self.controller.loadPaymentMethods()

          expect(self.controller.paymentMethods).toBeUndefined()
          expect(self.controller.selectDefaultPaymentMethod).not.toHaveBeenCalled()
          expect(self.controller.onLoad).toHaveBeenCalledWith({ success: true, hasExistingPaymentMethods: false })
        })

        it('should handle a failure loading payment methods', () => {
          jest.spyOn(self.controller.orderService, 'getExistingPaymentMethods').mockImplementation(() => Observable.throw('some error'))
          jest.spyOn(self.controller, 'selectDefaultPaymentMethod').mockImplementation(() => {})
          self.controller.loadPaymentMethods()

          expect(self.controller.paymentMethods).toBeUndefined()
          expect(self.controller.selectDefaultPaymentMethod).not.toHaveBeenCalled()
          expect(self.controller.onLoad).toHaveBeenCalledWith({ success: false, error: 'some error' })
          expect(self.controller.$log.error.logs[0]).toEqual(['Error loading paymentMethods', 'some error'])
        })
      })

      describe('selectDefaultPaymentMethod', () => {
        beforeEach(() => {
          jest.spyOn(self.controller, 'validPaymentMethod').mockReturnValue(true)
        })

        it('should choose the payment method that is marked chosen in cortex', () => {
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri'
            },
            {
              selectAction: 'second uri',
              chosen: true
            }
          ]
          self.controller.selectDefaultPaymentMethod()

          expect(self.controller.selectedPaymentMethod).toEqual({ selectAction: 'second uri', chosen: true })
        })

        it('should choose the first payment method if none are marked chosen in cortex', () => {
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri'
            },
            {
              selectAction: 'second uri'
            }
          ]
          self.controller.selectDefaultPaymentMethod()

          expect(self.controller.selectedPaymentMethod).toEqual({ selectAction: 'first uri' })
        })

        it('should choose the first payment method if the one marked chosen in cortex is invalid', () => {
          jest.spyOn(self.controller, 'validPaymentMethod').mockImplementation(paymentMethod => paymentMethod.selectAction === 'first uri')
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri'
            },
            {
              selectAction: 'second uri',
              chosen: true
            }
          ]
          self.controller.selectDefaultPaymentMethod()

          expect(self.controller.selectedPaymentMethod).toEqual({ selectAction: 'first uri' })
        })

        it('should set selectedPaymentMethod to undefined if none are valid', () => {
          jest.spyOn(self.controller, 'validPaymentMethod').mockReturnValue(undefined)
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri'
            },
            {
              selectAction: 'second uri',
              chosen: true
            }
          ]
          self.controller.selectDefaultPaymentMethod()

          expect(self.controller.selectedPaymentMethod).toBeUndefined()
        })

        it('should check whether or not the fee coverage should be altered based on selected payment type', () => {
          jest.spyOn(self.controller, 'switchPayment').mockImplementation(() => {})
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri'
            },
            {
              selectAction: 'second uri',
              chosen: true
            }
          ]

          self.controller.selectDefaultPaymentMethod()
          expect(self.controller.switchPayment).toHaveBeenCalled()
        })
      })

      describe('openPaymentMethodFormModal', () => {
        it('should open the paymentMethodForm modal', () => {
          jest.spyOn(self.controller.$uibModal, 'open')
          self.controller.openPaymentMethodFormModal()

          expect(self.controller.$uibModal.open).toHaveBeenCalled()
          expect(self.controller.paymentMethodFormModal).toBeDefined()

          // Test calling onSubmit
          self.controller.$uibModal.open.mock.calls[0][0].resolve.onPaymentFormStateChange()({ $event: { state: 'loading', payload: 'some data' } })

          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'loading', payload: 'some data', stayOnStep: true, update: false, paymentMethodToUpdate: undefined } })
        })

        it('should call onPaymentFormStateChange to clear submissionErrors when the modal closes', () => {
          jest.spyOn(self.controller.$uibModal, 'open').mockReturnValue({ result: Observable.throw('').toPromise() })
          self.controller.openPaymentMethodFormModal()
          self.$timeout(() => {
            expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'unsubmitted' } })
            expect(self.controller.paymentMethodFormModal).toBeUndefined()
          }, 0)
        })
      })

      describe('selectPayment', () => {
        beforeEach(() => {
          jest.spyOn(self.controller.orderService, 'selectPaymentMethod').mockImplementation(() => {})
          jest.spyOn(self.controller.orderService, 'storeCardSecurityCode').mockImplementation(() => {})
        })

        it('should save the selected bank account', () => {
          self.controller.selectedPaymentMethod = { 'account-type': 'Checking', self: { type: 'elasticpath.bankaccounts.bank-account', uri: 'selected uri' }, selectAction: 'some uri' }
          self.controller.orderService.selectPaymentMethod.mockReturnValue(Observable.of('success'))
          self.controller.selectPayment()

          expect(self.controller.orderService.selectPaymentMethod).toHaveBeenCalledWith('some uri')
          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'loading' } })
          expect(self.controller.orderService.storeCardSecurityCode).toHaveBeenCalledWith(null, 'selected uri')
        })

        it('should save the selected credit card', () => {
          self.controller.selectedPaymentMethod = { 'card-type': 'Visa', self: { type: 'cru.creditcards.named-credit-card', uri: 'selected uri' }, selectAction: 'some uri' }
          self.controller.orderService.selectPaymentMethod.mockReturnValue(Observable.of('success'))
          self.controller.selectPayment()

          expect(self.controller.orderService.selectPaymentMethod).toHaveBeenCalledWith('some uri')
          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'loading' } })
          expect(self.controller.orderService.storeCardSecurityCode).toHaveBeenCalledWith(null, 'selected uri')
        })

        it('should handle a failed request to save the selected payment', () => {
          self.controller.selectedPaymentMethod = { self: { type: 'elasticpath.bankaccounts.bank-account' } }
          self.controller.orderService.selectPaymentMethod.mockReturnValue(Observable.throw('some error'))
          self.controller.selectPayment()

          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'error', error: 'some error' } })
          expect(self.controller.orderService.storeCardSecurityCode).not.toHaveBeenCalled()
          expect(self.controller.$log.error.logs[0]).toEqual(['Error selecting payment method', 'some error'])
        })

        it('should not send a request if the payment is already selected', () => {
          self.controller.selectedPaymentMethod = { self: { type: 'elasticpath.bankaccounts.bank-account', uri: 'chosen uri' }, chosen: true }
          self.controller.selectPayment()

          expect(self.controller.orderService.selectPaymentMethod).not.toHaveBeenCalled()
          expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'loading' } })
          expect(self.controller.orderService.storeCardSecurityCode).toHaveBeenCalledWith(null, 'chosen uri')
        })
      })

      describe('switchPayment', () => {
        beforeEach(() => {
          jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockImplementation(() => true)
          jest.spyOn(self.controller.orderService, 'storeCoverFeeDecision').mockImplementation(() => {})
        })

        it('should remove fees if the newly selected payment method is EFT', () => {
          self.controller.selectedPaymentMethod = { 'bank-name': 'My Bank' }

          self.controller.switchPayment()
          expect(self.controller.onPaymentChange).toHaveBeenCalledWith({ selectedPaymentMethod: self.controller.selectedPaymentMethod })
          expect(self.controller.orderService.storeCoverFeeDecision).toHaveBeenCalledWith(false)
        })

        it('should handle undefined payment methods', () => {
          self.controller.selectedPaymentMethod = undefined

          self.controller.switchPayment()
          expect(self.controller.onPaymentChange).toHaveBeenCalledWith({ selectedPaymentMethod: undefined })
          expect(self.controller.orderService.storeCoverFeeDecision).not.toHaveBeenCalled()
        })
      })
    })
  })
})
