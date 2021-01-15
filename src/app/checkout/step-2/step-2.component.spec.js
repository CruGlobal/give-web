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

    beforeEach(inject(function ($componentController) {
      self.controller = $componentController(module.name, {},
        {
          changeStep: jest.fn(),
          onStateChange: jest.fn()
        })
    }))

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
      it('should change default payment type', () => {
        jest.spyOn(self.controller, 'handlePaymentChange')
        self.controller.handlePaymentChange({'account-type': 'checking'})

        expect(self.controller.handlePaymentChange).toHaveBeenCalledWith({'account-type': 'checking'})
        expect(self.controller.defaultPaymentType).toEqual('checking')
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
        self.controller.onPaymentFormStateChange({ state: 'loading', payload: { bankAccount: {} } })

        expect(self.controller.orderService.addPaymentMethod).toHaveBeenCalledWith({ bankAccount: {} })
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
  })
})
