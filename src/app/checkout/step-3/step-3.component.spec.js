import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

import { cartUpdatedEvent } from 'common/components/nav/navCart/navCart.component'
import { SignInEvent } from 'common/services/session/session.service'

import module from './step-3.component'

describe('checkout', () => {
  describe('step 3', () => {
    beforeEach(angular.mock.module(module.name))
    var self = {}

    beforeEach(inject(function ($componentController) {
      self.loadedPayment = {
        self: {
          type: null
        }
      }
      self.storedCvv = null
      self.coverFeeDecision = false

      self.controller = $componentController(module.name, {
        // Mock services
        cartService: {
          editItem: jest.fn(() => Observable.of(''))
        },
        commonService: {
          getNextDrawDate: () => Observable.of('2018-09-07')
        },
        orderService: {
          getDonorDetails: () => Observable.of('donor details'),
          getCurrentPayment: () => Observable.of(self.loadedPayment),
          checkErrors: () => Observable.of(['email-info']),
          submit: () => Observable.of('called submit'),
          retrieveCardSecurityCode: () => self.storedCvv,
          retrieveLastPurchaseLink: () => Observable.of('purchaseLink'),
          retrieveCoverFeeDecision: () => self.coverFeeDecision,
          clearCardSecurityCodes: jest.fn(),
          clearCoverFees: jest.fn()
        },
        profileService: {
          getPurchase: () => Observable.of('purchaseData')
        },
        $window: {
          scrollTo: jest.fn()
        }
      },
      {
        loadCart: jest.fn(),
        changeStep: jest.fn(),
        onSubmitBtnChangeState: jest.fn(),
        onSubmitted: jest.fn(),
        onSubmittingOrder: jest.fn(),
        submittingOrder: false
      })
    }))

    describe('$onInit', () => {
      it('should load needed info', () => {
        jest.spyOn(self.controller, 'loadDonorDetails').mockImplementation(() => {})
        jest.spyOn(self.controller, 'loadCurrentPayment').mockImplementation(() => {})
        jest.spyOn(self.controller, 'checkErrors').mockImplementation(() => {})
        self.controller.$onInit()

        expect(self.controller.loadDonorDetails).toHaveBeenCalled()
        expect(self.controller.loadCurrentPayment).toHaveBeenCalled()
        expect(self.controller.checkErrors).toHaveBeenCalled()
      })

      it('should be called on sign in', () => {
        jest.spyOn(self.controller, '$onInit').mockImplementation(() => {})
        self.controller.$scope.$broadcast(SignInEvent)

        expect(self.controller.$onInit).toHaveBeenCalled()
      })
    })

    describe('$onChanges', () => {
      beforeEach(() => {
        jest.spyOn(self.controller, 'submitOrder').mockImplementation(() => {})
      })

      it('should submit order if the submit binding is true', () => {
        self.controller.$onChanges({ submit: {
          currentValue: true
        } })

        expect(self.controller.submitOrder).toHaveBeenCalled()
      })

      it('should not submit order if the submit binding is false', () => {
        self.controller.$onChanges({ submit: {
          currentValue: false
        } })

        expect(self.controller.submitOrder).not.toHaveBeenCalled()
      })

      it('should not submit order if the submit binding was not changed', () => {
        self.controller.$onChanges({})

        expect(self.controller.submitOrder).not.toHaveBeenCalled()
      })
    })

    describe('loadDonorDetails', () => {
      it('should load donor details', () => {
        self.controller.loadDonorDetails()

        expect(self.controller.donorDetails).toEqual('donor details')
        self.controller.$log.assertEmpty()
      })

      it('should log error on failure', () => {
        jest.spyOn(self.controller.orderService, 'getDonorDetails').mockReturnValue(Observable.throw('some error'))
        self.controller.loadDonorDetails()

        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading donorDetails', 'some error'])
      })
    })

    describe('getNextDrawDate', () => {
      it('should load next draw date', () => {
        self.controller.getNextDrawDate()

        expect(self.controller.nextDrawDate).toEqual('2018-09-07')
        self.controller.$log.assertEmpty()
      })
    })

    describe('updateGiftStartMonth', () => {
      it('should save item edits', () => {
        const item = {
          uri: '/uri',
          productUri: '/uri',
          config: {
            'recurring-start-month': '07'
          }
        }
        self.controller.updateGiftStartMonth(item, '05')

        item.config['recurring-start-month'] = '05'

        expect(self.controller.cartService.editItem).toHaveBeenCalledWith(item.uri, item.productUri, item.config)

        expect(self.controller.loadCart).toHaveBeenCalled()
      })
    })

    describe('loadCurrentPayment', () => {
      it('should load bank account payment details', () => {
        self.loadedPayment.self.type = 'elasticpath.bankaccounts.bank-account'
        self.controller.loadCurrentPayment()

        expect(self.controller.bankAccountPaymentDetails).toEqual(self.loadedPayment)
        expect(self.controller.creditCardPaymentDetails).toBeUndefined()
        self.controller.$log.assertEmpty()

        expect(self.controller.loadingCurrentPayment).toEqual(false)
      })

      it('should load credit card payment details', () => {
        self.loadedPayment.self.type = 'cru.creditcards.named-credit-card'
        self.controller.loadCurrentPayment()

        expect(self.controller.bankAccountPaymentDetails).toBeUndefined()
        expect(self.controller.creditCardPaymentDetails).toEqual(self.loadedPayment)
        self.controller.$log.assertEmpty()

        expect(self.controller.loadingCurrentPayment).toEqual(false)
      })

      it('should throw an error if the payments aren\'t loaded', () => {
        self.loadedPayment = undefined
        self.controller.loadCurrentPayment()

        expect(self.controller.bankAccountPaymentDetails).toBeUndefined()
        expect(self.controller.creditCardPaymentDetails).toBeUndefined()
        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading current payment info: current payment doesn\'t seem to exist'])
        expect(self.controller.loadingCurrentPayment).toEqual(false)
      })

      it('should throw an error if the type is unknown', () => {
        self.loadedPayment.self.type = 'some other type'
        self.controller.loadCurrentPayment()

        expect(self.controller.bankAccountPaymentDetails).toBeUndefined()
        expect(self.controller.creditCardPaymentDetails).toBeUndefined()
        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading current payment info: current payment type is unknown'])
        expect(self.controller.loadingCurrentPayment).toEqual(false)
      })

      it('should log an error on failure', () => {
        jest.spyOn(self.controller.orderService, 'getCurrentPayment').mockReturnValue(Observable.throw('some error'))
        self.controller.loadCurrentPayment()

        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading current payment info', 'some error'])
        expect(self.controller.loadingCurrentPayment).toEqual(false)
      })
    })

    describe('checkErrors', () => {
      it('should load any needinfo errors', () => {
        self.controller.checkErrors()

        expect(self.controller.needinfoErrors).toEqual(['email-info'])
        self.controller.$log.assertEmpty()
      })

      it('should log and error on failure', () => {
        jest.spyOn(self.controller.orderService, 'checkErrors').mockReturnValue(Observable.throw('some error'))
        self.controller.checkErrors()

        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading checkErrors', 'some error'])
      })
    })

    describe('canSubmitOrder', () => {
      function runCanSubmitOrder (config) {
        self.controller.cartData = config.cartData
        self.controller.donorDetails = config.donorDetails
        self.controller.bankAccountPaymentDetails = config.bankAccountPaymentDetails
        self.controller.creditCardPaymentDetails = config.creditCardPaymentDetails
        self.controller.needinfoErrors = config.needinfoErrors
        self.controller.submittingOrder = config.submittingOrder

        expect(self.controller.canSubmitOrder()).toEqual(config.outcome)
        expect(self.controller.onSubmitBtnChangeState).toHaveBeenCalledWith({
          $event: {
            enabled: config.outcome
          }
        })
      }

      it('should let you submit the order with a bank account if everything is loaded and there are no errors', () => {
        runCanSubmitOrder({
          cartData: {},
          donorDetails: {},
          bankAccountPaymentDetails: {},
          creditCardPaymentDetails: undefined,
          needinfoErrors: undefined,
          outcome: true,
          submittingOrder: false
        })
      })

      it('should let you submit the order with a credit card if everything is loaded and there are no errors', () => {
        runCanSubmitOrder({
          cartData: {},
          donorDetails: {},
          bankAccountPaymentDetails: undefined,
          creditCardPaymentDetails: {},
          needinfoErrors: undefined,
          outcome: true,
          submittingOrder: false
        })
      })

      it('should not let you submit the order if there are errors', () => {
        runCanSubmitOrder({
          cartData: {},
          donorDetails: {},
          bankAccountPaymentDetails: {},
          creditCardPaymentDetails: undefined,
          needinfoErrors: [],
          outcome: false,
          submittingOrder: false
        })
      })

      it('should not let you submit the order if both payment methods aren\'t loaded', () => {
        runCanSubmitOrder({
          cartData: {},
          donorDetails: {},
          bankAccountPaymentDetails: undefined,
          creditCardPaymentDetails: undefined,
          needinfoErrors: undefined,
          outcome: false,
          submittingOrder: false
        })
      })

      it('should not let you submit the order if cart data isn\'t loaded', () => {
        runCanSubmitOrder({
          cartData: undefined,
          donorDetails: {},
          bankAccountPaymentDetails: {},
          creditCardPaymentDetails: undefined,
          needinfoErrors: undefined,
          outcome: false,
          submittingOrder: false
        })
      })

      it('should not let you submit the order if donorDetails isn\'t loaded', () => {
        runCanSubmitOrder({
          cartData: {},
          donorDetails: undefined,
          bankAccountPaymentDetails: {},
          creditCardPaymentDetails: undefined,
          needinfoErrors: undefined,
          outcome: false,
          submittingOrder: false
        })
      })

      it('should not let you submit the order if the order is currently submitting', () => {
        runCanSubmitOrder({
          cartData: {},
          donorDetails: {},
          bankAccountPaymentDetails: {},
          creditCardPaymentDetails: undefined,
          needinfoErrors: undefined,
          outcome: false,
          submittingOrder: true
        })
      })
    })

    describe('submitOrder', () => {
      beforeEach(() => {
        jest.spyOn(self.controller.orderService, 'submit')
        jest.spyOn(self.controller.profileService, 'getPurchase')
        jest.spyOn(self.controller.analyticsFactory, 'purchase')
      })

      describe('another order submission in progress', () => {
        it('should not submit the order twice', () => {
          self.controller.submittingOrder = true
          self.controller.submitOrder()

          expect(self.controller.onSubmittingOrder).not.toHaveBeenCalled()
          expect(self.controller.onSubmitted).not.toHaveBeenCalled()
        })
      })

      describe('submit single order', () => {
        beforeEach(() => {
          jest.spyOn(self.controller.$scope, '$emit').mockImplementation(() => {})
        })

        afterEach(() => {
          expect(self.controller.onSubmittingOrder).toHaveBeenCalledWith({ value: true })
          expect(self.controller.onSubmittingOrder).toHaveBeenCalledWith({ value: false })
          expect(self.controller.onSubmitted).toHaveBeenCalled()
        })

        it('should submit the order normally if paying with a bank account', () => {
          self.controller.bankAccountPaymentDetails = {}
          self.controller.submitOrder()

          expect(self.controller.orderService.submit).toHaveBeenCalled()
          expect(self.controller.analyticsFactory.purchase).toHaveBeenCalledWith(self.controller.donorDetails, self.controller.cartData, self.coverFeeDecision)
          expect(self.controller.orderService.clearCardSecurityCodes).toHaveBeenCalled()
          expect(self.controller.changeStep).toHaveBeenCalledWith({ newStep: 'thankYou' })
          expect(self.controller.$scope.$emit).toHaveBeenCalledWith(cartUpdatedEvent)
        })

        it('should handle an error submitting an order with a bank account', () => {
          self.controller.orderService.submit.mockImplementation(() => Observable.throw({ data: 'error saving bank account' }))
          self.controller.bankAccountPaymentDetails = {}
          self.controller.submitOrder()

          expect(self.controller.orderService.submit).toHaveBeenCalled()
          expect(self.controller.loadCart).toHaveBeenCalled()
          expect(self.controller.analyticsFactory.purchase).not.toHaveBeenCalled()
          expect(self.controller.orderService.clearCardSecurityCodes).not.toHaveBeenCalled()
          expect(self.controller.$log.error.logs[0]).toEqual(['Error submitting purchase:', { data: 'error saving bank account' }])
          expect(self.controller.changeStep).not.toHaveBeenCalled()
          expect(self.controller.submissionError).toEqual('error saving bank account')
          expect(self.controller.$window.scrollTo).toHaveBeenCalledWith(0, 0)
        })

        it('should submit the order with a CVV if paying with a credit card', () => {
          self.controller.creditCardPaymentDetails = {}
          self.storedCvv = '1234'
          self.coverFeeDecision = true
          self.controller.submitOrder()

          expect(self.controller.orderService.submit).toHaveBeenCalledWith('1234')
          expect(self.controller.analyticsFactory.purchase).toHaveBeenCalledWith(self.controller.donorDetails, self.controller.cartData, self.coverFeeDecision)
          expect(self.controller.orderService.clearCardSecurityCodes).toHaveBeenCalled()
          expect(self.controller.changeStep).toHaveBeenCalledWith({ newStep: 'thankYou' })
          expect(self.controller.$scope.$emit).toHaveBeenCalledWith(cartUpdatedEvent)
        })

        it('should submit the order without a CVV if paying with an existing credit card or the cvv in session storage is missing', () => {
          self.controller.creditCardPaymentDetails = {}
          self.storedCvv = undefined
          self.coverFeeDecision = true
          self.controller.submitOrder()

          expect(self.controller.orderService.submit).toHaveBeenCalledWith(undefined)
          expect(self.controller.analyticsFactory.purchase).toHaveBeenCalledWith(self.controller.donorDetails, self.controller.cartData, self.coverFeeDecision)
          expect(self.controller.orderService.clearCardSecurityCodes).toHaveBeenCalled()
          expect(self.controller.changeStep).toHaveBeenCalledWith({ newStep: 'thankYou' })
          expect(self.controller.$scope.$emit).toHaveBeenCalledWith(cartUpdatedEvent)
        })

        it('should handle an error submitting an order with a credit card', () => {
          self.controller.orderService.submit.mockImplementation(() => Observable.throw({ data: 'CardErrorException: Invalid Card Number: some details' }))
          self.controller.creditCardPaymentDetails = {}
          self.storedCvv = '1234'
          self.controller.submitOrder()

          expect(self.controller.orderService.submit).toHaveBeenCalledWith('1234')
          expect(self.controller.analyticsFactory.purchase).not.toHaveBeenCalled()
          expect(self.controller.orderService.clearCardSecurityCodes).not.toHaveBeenCalled()
          expect(self.controller.$log.error.logs[0]).toEqual(['Error submitting purchase:', { data: 'CardErrorException: Invalid Card Number: some details' }])
          expect(self.controller.changeStep).not.toHaveBeenCalled()
          expect(self.controller.submissionError).toEqual('CardErrorException')
          expect(self.controller.$window.scrollTo).toHaveBeenCalledWith(0, 0)
        })

        it('should mask the security code on a credit card error', () => {
          self.controller.orderService.submit.mockReturnValue(Observable.throw({ data: 'some error', config: { data: { 'security-code': '1234' } } }))
          self.controller.creditCardPaymentDetails = {}
          self.storedCvv = '1234'
          self.controller.submitOrder()

          expect(self.controller.orderService.submit).toHaveBeenCalledWith('1234')
          expect(self.controller.$log.error.logs[0]).toEqual(['Error submitting purchase:', { data: 'some error', config: { data: { 'security-code': 'XXXX' } } }])
        })

        it('should throw an error if neither bank account or credit card details are loaded', () => {
          self.controller.submitOrder()

          expect(self.controller.orderService.submit).not.toHaveBeenCalled()
          expect(self.controller.orderService.clearCardSecurityCodes).not.toHaveBeenCalled()
          expect(self.controller.$log.error.logs[0]).toEqual(['Error submitting purchase:', { data: 'Current payment type is unknown' }])
          expect(self.controller.changeStep).not.toHaveBeenCalled()
          expect(self.controller.submissionError).toEqual('Current payment type is unknown')
          expect(self.controller.$window.scrollTo).toHaveBeenCalledWith(0, 0)
        })

        it('should clear out cover fee data', () => {
          self.controller.creditCardPaymentDetails = {}
          self.controller.submitOrder()

          expect(self.controller.orderService.clearCoverFees).toHaveBeenCalled()
        })
      })
    })
  })
})
