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
          jest.spyOn(self.controller, 'editGifts').mockImplementation(() => {})
        })
        it('should call selectPayment and editGifts when called with a mock change object', () => {
          self.controller.$onChanges({
            paymentFormState: {
              currentValue: 'submitted'
            }
          })

          expect(self.controller.selectPayment).toHaveBeenCalled()
          expect(self.controller.editGifts).toHaveBeenCalled()
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

        it('should call calculatePricesWithFees if the calculation has not yet been done', () => {
          jest.spyOn(self.controller, 'calculatePricesWithFees').mockImplementation(() => {})
          self.controller.cartData.items = [
            {
              price: '$2.00',
              amount: 2,
              config: {
                amount: 2
              }
            }
          ]
          self.controller.$onChanges({})
          expect(self.controller.calculatePricesWithFees).toHaveBeenCalled()
        })

        it('should not call calculatePricesWithFees if the calculation has already been done', () => {
          jest.spyOn(self.controller, 'calculatePricesWithFees').mockImplementation(() => {})
          self.controller.feesCalculated = true
          self.controller.cartData.items = [
            {
              price: '$2.00',
              amount: 2,
              config: {
                amount: 2
              }
            }
          ]
          self.controller.$onChanges({})
          expect(self.controller.calculatePricesWithFees).not.toHaveBeenCalled()
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
          expect(self.controller.onLoad).toHaveBeenCalledWith({ success: true, hasExistingPaymentMethods: true })
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

        it('should save the selected payment', () => {
          self.controller.selectedPaymentMethod = { self: { type: 'elasticpath.bankaccounts.bank-account', uri: 'selected uri' }, selectAction: 'some uri' }
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

      describe('calculatePricesWithFees', () => {
        it('Should calculate each amount', () => {
          self.controller.cartData.items = [
            { amount: 2 },
            { amount: 1 },
            { amount: 3 }
          ]

          jest.spyOn(self.controller, 'calculatePriceWithFees').mockImplementation(input => input)

          expect(self.controller.cartData.items[0].amountWithFee).not.toBeDefined()
          expect(self.controller.cartData.items[1].amountWithFee).not.toBeDefined()
          expect(self.controller.cartData.items[2].amountWithFee).not.toBeDefined()
          self.controller.calculatePricesWithFees()

          expect(self.controller.cartData.items[0].amountWithFee).toBeDefined()
          expect(self.controller.cartData.items[1].amountWithFee).toBeDefined()
          expect(self.controller.cartData.items[2].amountWithFee).toBeDefined()

          expect(self.controller.calculatePriceWithFees).toHaveBeenCalledWith(2)
          expect(self.controller.calculatePriceWithFees).toHaveBeenCalledWith(1)
          expect(self.controller.calculatePriceWithFees).toHaveBeenCalledWith(3)
        })
      })

      describe('calculatePriceWithFees', () => {
        it('Should calculate the proper amount', () => {
          const priceWithFees = self.controller.calculatePriceWithFees(2)
          expect(priceWithFees).toEqual('2.05')
        })
      })

      describe('calculatePriceWithoutFees', () => {
        it('Should calculate the proper amount', () => {
          const priceWithoutFees = self.controller.calculatePriceWithoutFees(2.05)
          expect(priceWithoutFees).toEqual('2.00')
        })
      })

      describe('updatePrices', () => {
        it('Should update the item amounts when the user opts to cover fees', () => {
          self.controller.cartData.items = [
            {
              price: '$2.00',
              amount: 2,
              config: { amount: 2 },
              amountWithFee: '2.05'
            },
            {
              price: '$1.00',
              amount: 1,
              config: { amount: 1 },
              amountWithFee: '1.02'
            },
            {
              price: '$3.00',
              amount: 3,
              config: { amount: 3 },
              amountWithFee: '3.07'
            }
          ]

          self.controller.cartData.coverFees = true
          jest.spyOn(self.controller, 'recalculateFrequencyTotals').mockImplementation(() => {})
          self.controller.updatePrices()

          expect(self.controller.cartData.items[0].price).toEqual('$2.05')
          expect(self.controller.cartData.items[0].amount).toEqual(2.05)
          expect(self.controller.cartData.items[0].config.amount).toEqual(2.05)

          expect(self.controller.cartData.items[1].price).toEqual('$1.02')
          expect(self.controller.cartData.items[1].amount).toEqual(1.02)
          expect(self.controller.cartData.items[1].config.amount).toEqual(1.02)

          expect(self.controller.cartData.items[2].price).toEqual('$3.07')
          expect(self.controller.cartData.items[2].amount).toEqual(3.07)
          expect(self.controller.cartData.items[2].config.amount).toEqual(3.07)

          expect(self.controller.recalculateFrequencyTotals).toHaveBeenCalled()
        })

        it('Should revert the item amounts when the user opts not to cover fees', () => {
          self.controller.cartData.items = [
            {
              price: '$2.05',
              amount: 2.05,
              config: { amount: 2.05 },
              amountWithFee: '2.05'
            },
            {
              price: '$1.02',
              amount: 1.02,
              config: { amount: 1.02 },
              amountWithFee: '1.02'
            },
            {
              price: '$3.07',
              amount: 3.07,
              config: { amount: 3.07 },
              amountWithFee: '3.07'
            }
          ]

          self.controller.cartData.coverFees = false
          jest.spyOn(self.controller, 'recalculateFrequencyTotals').mockImplementation(() => {})
          self.controller.updatePrices()

          expect(self.controller.cartData.items[0].price).toEqual('$2.00')
          expect(self.controller.cartData.items[0].amount).toEqual(2)
          expect(self.controller.cartData.items[0].config.amount).toEqual(2)

          expect(self.controller.cartData.items[1].price).toEqual('$1.00')
          expect(self.controller.cartData.items[1].amount).toEqual(1)
          expect(self.controller.cartData.items[1].config.amount).toEqual(1)

          expect(self.controller.cartData.items[2].price).toEqual('$3.00')
          expect(self.controller.cartData.items[2].amount).toEqual(3)
          expect(self.controller.cartData.items[2].config.amount).toEqual(3)

          expect(self.controller.recalculateFrequencyTotals).toHaveBeenCalled()
        })
      })

      describe('recalculateFrequencyTotals', () => {
        it('Should recalculate the frequency totals with added fees', () => {
          self.controller.cartData.frequencyTotals = [
            {
              frequency: 'Single',
              amount: 2,
              total: '$2.00'
            },
            {
              frequency: 'Monthly',
              amount: 1,
              total: '$1.00'
            },
            {
              frequency: 'Quarterly',
              amount: 3,
              total: '$3.00'
            },
            {
              frequency: 'Annually',
              amount: 4,
              total: '$4.00'
            }
          ]
          self.controller.cartData.items = [
            {
              frequency: 'Single',
              amount: 2.05
            },
            {
              frequency: 'Monthly',
              amount: 1.02
            },
            {
              frequency: 'Quarterly',
              amount: 3.07
            },
            {
              frequency: 'Annually',
              amount: 4.09
            }
          ]

          self.controller.recalculateFrequencyTotals()

          expect(self.controller.cartData.frequencyTotals).toEqual([
            {
              frequency: 'Single',
              amount: 2.05,
              total: '$2.05'
            },
            {
              frequency: 'Monthly',
              amount: 1.02,
              total: '$1.02'
            },
            {
              frequency: 'Quarterly',
              amount: 3.07,
              total: '$3.07'
            },
            {
              frequency: 'Annually',
              amount: 4.09,
              total: '$4.09'
            }
          ])
        })

        it('Should recalculate the frequency totals without added fees', () => {
          self.controller.cartData.frequencyTotals = [
            {
              frequency: 'Single',
              amount: 2.05,
              total: '$2.05'
            },
            {
              frequency: 'Monthly',
              amount: 1.02,
              total: '$1.02'
            },
            {
              frequency: 'Quarterly',
              amount: 3.07,
              total: '$3.07'
            },
            {
              frequency: 'Annually',
              amount: 4.09,
              total: '$4.09'
            }
          ]
          self.controller.cartData.items = [
            {
              frequency: 'Single',
              amount: 2
            },
            {
              frequency: 'Monthly',
              amount: 1
            },
            {
              frequency: 'Quarterly',
              amount: 3
            },
            {
              frequency: 'Annually',
              amount: 4
            }
          ]

          self.controller.recalculateFrequencyTotals()

          expect(self.controller.cartData.frequencyTotals).toEqual([
            {
              frequency: 'Single',
              amount: 2,
              total: '$2.00'
            },
            {
              frequency: 'Monthly',
              amount: 1,
              total: '$1.00'
            },
            {
              frequency: 'Quarterly',
              amount: 3,
              total: '$3.00'
            },
            {
              frequency: 'Annually',
              amount: 4,
              total: '$4.00'
            }
          ])
        })
      })
    })
  })
})
