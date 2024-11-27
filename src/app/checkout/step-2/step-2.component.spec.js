import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

import { SignInEvent } from 'common/services/session/session.service'

import module from './step-2.component'

describe('checkout', () => {
  describe('step 2', () => {
    beforeEach(angular.mock.module(module.name))
    var self = {}

    beforeEach(inject(function ($componentController, $flushPendingTasks, $q) {
      self.controller = $componentController(module.name, {},
        {
          changeStep: jest.fn(),
          onStateChange: jest.fn()
        })
      self.$flushPendingTasks = $flushPendingTasks
      self.$q = $q
    }))

    describe('constructor', () => {
      it('initializes selectedPaymentMethod to undefined', () => {
        expect(self.controller.selectedPaymentMethod).toBeUndefined()
      })
    })

    describe('$onInit', () => {
      it('should call loadDonorDetails', () => {
        jest.spyOn(self.controller, 'loadDonorDetails').mockImplementation(() => {})
        self.controller.$onInit()

        expect(self.controller.loadDonorDetails).toHaveBeenCalled()
      })

      it('should skip calling loadDonorDetails when we already have a mailing address', () => {
        jest.spyOn(self.controller, 'loadDonorDetails').mockImplementation(() => {})
        self.controller.mailingAddress = {}
        self.controller.$onInit()

        expect(self.controller.loadDonorDetails).not.toHaveBeenCalled()
      })

      it('should be called on sign in', () => {
        jest.spyOn(self.controller, '$onInit').mockImplementation(() => {})
        self.controller.$scope.$broadcast(SignInEvent)

        expect(self.controller.$onInit).toHaveBeenCalled()
      })
    })

    describe('$onChanges', () => {
      it('should call submit when submitted changes to true', () => {
        jest.spyOn(self.controller, 'submit').mockImplementation(() => {})
        self.controller.$onChanges({
          submitted: {
            currentValue: true
          }
        })

        expect(self.controller.submit).toHaveBeenCalled()
      })
    })

    describe('loadDonorDetails', () => {
      it('should load mailing address', () => {
        jest.spyOn(self.controller.orderService, 'getDonorDetails').mockReturnValue(Observable.of({ mailingAddress: { streetAddress: 'Some street address' } }))
        self.controller.loadDonorDetails()

        expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled()
        expect(self.controller.mailingAddress).toEqual({ streetAddress: 'Some street address' })
      })

      it('should log on error', () => {
        jest.spyOn(self.controller.orderService, 'getDonorDetails').mockReturnValue(Observable.throw('some error'))
        self.controller.loadDonorDetails()

        expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled()
        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading donorDetails', 'some error'])
      })
    })

    describe('handleExistingPaymentLoading', () => {
      beforeEach(() => {
        self.controller.$onInit()
      })

      it('should set flags for the view if payment methods exist', () => {
        expect(self.controller.loadingPaymentMethods).toEqual(true)
        self.controller.handleExistingPaymentLoading(true, true)

        expect(self.controller.existingPaymentMethods).toEqual(true)
        expect(self.controller.loadingPaymentMethods).toEqual(false)
      })

      it('should set flags for the view if payment methods do not exist', () => {
        expect(self.controller.loadingPaymentMethods).toEqual(true)
        self.controller.handleExistingPaymentLoading(true, false)

        expect(self.controller.existingPaymentMethods).toEqual(false)
        expect(self.controller.loadingPaymentMethods).toEqual(false)
      })

      it('should set flags for the view if requesting payment methods fails', () => {
        expect(self.controller.loadingPaymentMethods).toEqual(true)
        self.controller.handleExistingPaymentLoading(false, undefined, 'some error')

        expect(self.controller.existingPaymentMethods).toEqual(false)
        expect(self.controller.loadingPaymentMethods).toEqual(false)
        expect(self.controller.$log.warn.logs[0]).toEqual(['Error loading existing payment methods', 'some error'])
        expect(self.controller.loadingExistingPaymentError).toEqual('some error')
      })
    })

    describe('submit', () => {
      it('should change form state', () => {
        jest.spyOn(self.controller, 'onPaymentFormStateChange').mockImplementation(() => {})
        jest.spyOn(self.controller.analyticsFactory, 'checkoutStepOptionEvent').mockImplementation(() => {})
        self.controller.submit()

        expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ state: 'submitted' })
        expect(self.controller.analyticsFactory.checkoutStepOptionEvent).toHaveBeenCalledWith(self.controller.defaultPaymentType ,'payment')
      })
    })

    describe('handlePaymentChange', () => {
      it('should change default payment type with bank account', () => {
        jest.spyOn(self.controller.brandedAnalyticsFactory, 'savePaymentType')
        self.controller.handlePaymentChange({'account-type': 'checking'})

        expect(self.controller.selectedPaymentMethod).toEqual({'account-type': 'checking'})
        expect(self.controller.defaultPaymentType).toEqual('checking')
        expect(self.controller.brandedAnalyticsFactory.savePaymentType).toHaveBeenCalledWith('checking', false)
      })

      it('should change default payment type with credit card', () => {
        jest.spyOn(self.controller.brandedAnalyticsFactory, 'savePaymentType')
        self.controller.handlePaymentChange({'card-type': 'visa'})

        expect(self.controller.selectedPaymentMethod).toEqual({'card-type': 'visa'})
        expect(self.controller.defaultPaymentType).toEqual('visa')
        expect(self.controller.brandedAnalyticsFactory.savePaymentType).toHaveBeenCalledWith('visa', true)
      })

      it('should clear selectedPaymentMethod and defaultPaymentType when the selected payment method is undefined', () => {
        jest.spyOn(self.controller.brandedAnalyticsFactory, 'savePaymentType')
        self.controller.handlePaymentChange(undefined)

        expect(self.controller.selectedPaymentMethod).toBeUndefined()
        expect(self.controller.defaultPaymentType).toBeUndefined()
        expect(self.controller.brandedAnalyticsFactory.savePaymentType).not.toHaveBeenCalled()
      })
    })

    describe('onPaymentFormStateChange', () => {
      beforeEach(() => {
        jest.spyOn(self.controller.$window, 'scrollTo').mockImplementation(() => {})
        jest.spyOn(self.controller, 'scrollModalToTop').mockImplementation(() => {})
      })

      it('should update paymentFormState if transitioning to a different state', () => {
        self.controller.paymentFormState = 'unsubmitted'
        self.controller.onPaymentFormStateChange({ state: 'submitted' })

        expect(self.controller.paymentFormState).toEqual('submitted')
      })

      it('should save payment data when in the loading state with a payload', () => {
        jest.spyOn(self.controller, '$onInit').mockImplementation(() => {})
        jest.spyOn(self.controller.orderService, 'addPaymentMethod').mockReturnValue(Observable.of(''))
        self.controller.onPaymentFormStateChange({ state: 'loading', payload: { bankAccount: { 'account-type': 'Checking' } } })

        expect(self.controller.orderService.addPaymentMethod).toHaveBeenCalledWith({ bankAccount: { 'account-type': 'Checking' } })
        expect(self.controller.changeStep).toHaveBeenCalledWith({ newStep: 'review' })
        expect(self.controller.onStateChange).toHaveBeenCalledWith({ state: 'submitted' })
        expect(self.controller.$onInit).toHaveBeenCalled()
        expect(self.controller.paymentFormState).toEqual('success')
      })

      it('should save payment data and not change step when in the loading state with a payload and stayOnStep is true', () => {
        jest.spyOn(self.controller, '$onInit').mockImplementation(() => {})
        jest.spyOn(self.controller.orderService, 'addPaymentMethod').mockReturnValue(Observable.of(''))
        self.controller.onPaymentFormStateChange({ state: 'loading', payload: { bankAccount: {} }, stayOnStep: true })

        expect(self.controller.orderService.addPaymentMethod).toHaveBeenCalledWith({ bankAccount: {} })
        expect(self.controller.changeStep).not.toHaveBeenCalled()
        expect(self.controller.onStateChange).not.toHaveBeenCalled()
        expect(self.controller.$onInit).not.toHaveBeenCalled()
        expect(self.controller.paymentFormState).toEqual('success')
      })

      it('should handle an error saving payment data', () => {
        self.controller.existingPaymentMethods = false
        jest.spyOn(self.controller.orderService, 'addPaymentMethod').mockReturnValue(Observable.throw({ data: 'some error' }))
        self.controller.onPaymentFormStateChange({ state: 'loading', payload: { bankAccount: {} } })

        expect(self.controller.orderService.addPaymentMethod).toHaveBeenCalledWith({ bankAccount: {} })
        expect(self.controller.paymentFormState).toEqual('error')
        expect(self.controller.$log.error.logs[0]).toEqual(['Error saving payment method', { data: 'some error' }])
        expect(self.controller.paymentFormError).toEqual('some error')
        expect(self.controller.$window.scrollTo).toHaveBeenCalled()
        expect(self.controller.scrollModalToTop).not.toHaveBeenCalled()
        expect(self.controller.onStateChange).toHaveBeenCalledWith({ state: 'errorSubmitting' })
      })

      it('should handle an error saving payment data from a modal', () => {
        self.controller.$onInit()
        jest.spyOn(self.controller.orderService, 'addPaymentMethod').mockReturnValue(Observable.throw({ data: 'some error' }))
        self.controller.onPaymentFormStateChange({ state: 'loading', payload: { bankAccount: {} } })

        expect(self.controller.orderService.addPaymentMethod).toHaveBeenCalledWith({ bankAccount: {} })
        expect(self.controller.paymentFormState).toEqual('error')
        expect(self.controller.$log.error.logs[0]).toEqual(['Error saving payment method', { data: 'some error' }])
        expect(self.controller.paymentFormError).toEqual('some error')
        expect(self.controller.$window.scrollTo).not.toHaveBeenCalled()
        expect(self.controller.scrollModalToTop).toHaveBeenCalled()
        expect(self.controller.onStateChange).toHaveBeenCalledWith({ state: 'errorSubmitting' })
      })

      it('should call changeStep if save was successful and there was no data (assumes another component saved the data)', () => {
        self.controller.onPaymentFormStateChange({ state: 'loading' })

        expect(self.controller.changeStep).toHaveBeenCalledWith({ newStep: 'review' })
        expect(self.controller.paymentFormState).toEqual('success')
      })

      it('should call onStateChange if payment form state was changed to unsubmitted', () => {
        self.controller.onPaymentFormStateChange({ state: 'unsubmitted' })

        expect(self.controller.onStateChange).toHaveBeenCalledWith({ state: 'unsubmitted' })
      })

      it('should call onStateChange if payment form state was changed to error', () => {
        self.controller.onPaymentFormStateChange({ state: 'error' })

        expect(self.controller.onStateChange).toHaveBeenCalledWith({ state: 'errorSubmitting' })
      })

      it('should update payment data', () => {
        jest.spyOn(self.controller.orderService, 'updatePaymentMethod').mockReturnValue(Observable.of(''))
        self.controller.onPaymentFormStateChange({ state: 'loading', payload: { creditCard: {} }, update: true, paymentMethodToUpdate: 'selected payment method' })

        expect(self.controller.changeStep).toHaveBeenCalledWith({ newStep: 'review' })
        expect(self.controller.orderService.updatePaymentMethod).toHaveBeenCalledWith('selected payment method', { creditCard: {} })
      })
    })

    describe('isContinueDisabled', () => {
      it('should return true when there are existing payment methods but none are valid', () => {
        self.controller.handleExistingPaymentLoading(true, true)
        self.controller.handlePaymentChange(undefined)

        expect(self.controller.existingPaymentMethods).toBe(true)
        expect(self.controller.selectedPaymentMethod).toBeUndefined()
        expect(self.controller.isContinueDisabled()).toBe(true)
      })

      it('should return false when there are existing payment methods and at least one is valid', () => {
        self.controller.handleExistingPaymentLoading(true, true)
        self.controller.handlePaymentChange({})

        expect(self.controller.existingPaymentMethods).toBe(true)
        expect(self.controller.selectedPaymentMethod).not.toBeUndefined()
        expect(self.controller.isContinueDisabled()).toBe(false)
      })

      it('should return false when there are not existing payment methods', () => {
        self.controller.handleExistingPaymentLoading(true, false)

        expect(self.controller.existingPaymentMethods).toBe(false)
        expect(self.controller.selectedPaymentMethod).toBeUndefined()
        expect(self.controller.isContinueDisabled()).toBe(false)
      })

      it('should return true while the payment methods are loading', () => {
        self.controller.$onInit()

        expect(self.controller.loadingPaymentMethods).toBe(true)
        expect(self.controller.isContinueDisabled()).toBe(true)

        self.controller.handleExistingPaymentLoading(true, false)

        expect(self.controller.loadingPaymentMethods).toBe(false)
        expect(self.controller.isContinueDisabled()).toBe(false)
      })

      it('should return true while the payment form is encrypting or loading', () => {
        let deferred = self.$q.defer()
        jest.spyOn(self.controller, '$onInit').mockImplementation(() => {})
        jest.spyOn(self.controller.orderService, 'addPaymentMethod').mockReturnValue(Observable.from(deferred.promise))
        self.controller.onPaymentFormStateChange({ state: 'encrypting' })

        expect(self.controller.paymentFormState).toBe('encrypting')
        expect(self.controller.isContinueDisabled()).toBe(true)

        self.controller.onPaymentFormStateChange({ state: 'loading', payload: {}, update: false })

        expect(self.controller.paymentFormState).toBe('loading')
        expect(self.controller.isContinueDisabled()).toBe(true)

        deferred.resolve()
        self.$flushPendingTasks()

        expect(self.controller.paymentFormState).toBe('success')
        expect(self.controller.isContinueDisabled()).toBe(false)
      })

      describe('existing credit card used', () => {
        it('should disable continue when cvv is invalid', () => {
          self.controller.handleExistingPaymentLoading(true, true)
          self.controller.isCvvValid = false
          self.controller.handlePaymentChange({'card-type': 'visa'})
          
          expect(self.controller.isContinueDisabled()).toBe(true)
        })

        it('should disable continue when cvv is valid', () => {
          self.controller.handleExistingPaymentLoading(true, true)
          self.controller.isCvvValid = true
          self.controller.handlePaymentChange({'card-type': 'visa'})
          
          expect(self.controller.isContinueDisabled()).toBe(false)
        })

        it('should not disable continue when cvv is invalid', () => {
          self.controller.handleExistingPaymentLoading(true, true)
          self.controller.isCvvValid = false
          self.controller.handlePaymentChange({'account-type': 'checking'})
          
          expect(self.controller.isContinueDisabled()).toBe(false)
        })
      })

      describe('existing EFT used', () => {
        it('should not disable continue when cvv validity is undefined', () => {
          self.controller.handleExistingPaymentLoading(true, true)
          self.controller.isCvvValid = undefined
          self.controller.handlePaymentChange({'account-type': 'checking'})
          
          expect(self.controller.isContinueDisabled()).toBe(false)
        })

        it('should not disable continue when cvv is valid', () => {
          self.controller.handleExistingPaymentLoading(true, true)
          self.controller.isCvvValid = true
          self.controller.handlePaymentChange({'account-type': 'checking'})
          
          expect(self.controller.isContinueDisabled()).toBe(false)
        })
      })

      describe('new credit card used', () => {
        it('should disable continue when cvv is invalid and new credit card payment is added', () => {
          self.controller.handlePaymentChange({'card-type': 'visa'})
          self.controller.isCvvValid = false
          expect(self.controller.isContinueDisabled()).toBe(true)
        })
      })

      describe('new EFT used', () => {
        it('should not disable continue when cvv is invalid and new EFT is added', () => {
          self.controller.handlePaymentChange({'account-type': 'checking'})
          self.controller.isCvvValid = false
          expect(self.controller.isContinueDisabled()).toBe(false)
        })
      })
    })
    
    describe('enableContinue', () => {
      it('should set isCvvValid to false', () => {
        self.controller.enableContinue(false)
        expect(self.controller.isCvvValid).toBe(false)
      })

      it('should set isCvvValid to true', () => {
        self.controller.enableContinue(true)
        expect(self.controller.isCvvValid).toBe(true)
      })
    })
  })
})
