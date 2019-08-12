import angular from 'angular'
import 'angular-mocks'
import module from './paymentMethodForm.component.js'

describe('paymentMethodForm', () => {
  beforeEach(angular.mock.module(module.name))
  var self = {}

  beforeEach(inject(function ($componentController) {
    self.controller = $componentController(module.name, {},
      {
        onPaymentFormStateChange: () => {}
      })
  }))

  describe('$onInit', () => {
    it('should keep bankAccount as the default payment method if paymentMethod does not exists', () => {
      self.controller.paymentMethod = undefined
      self.controller.$onInit()

      expect(self.controller.paymentType).toEqual('bankAccount')
    })

    it('should choose the correct payment method type from the paymentMethod if it exists', () => {
      self.controller.paymentMethod = { self: { type: 'elasticpath.bankaccounts.bank-account' } }
      self.controller.$onInit()

      expect(self.controller.paymentType).toEqual('bankAccount')
      self.controller.paymentMethod = { self: { type: 'cru.creditcards.named-credit-card' } }
      self.controller.$onInit()

      expect(self.controller.paymentType).toEqual('creditCard')
    })

    it('should use defaultPaymentType as the default payment method if defaultPaymentType is specified', () => {
      self.controller.defaultPaymentType = 'creditCard'
      self.controller.$onInit()

      expect(self.controller.paymentType).toEqual('creditCard')
    })
  })

  describe('changePaymentType', () => {
    beforeEach(() => {
      jest.spyOn(self.controller, 'onPaymentFormStateChange').mockImplementation(() => {})
    })

    it('should set the payment type to credit card', () => {
      self.controller.changePaymentType('creditCard')

      expect(self.controller.paymentType).toBe('creditCard')
      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'unsubmitted' } })
    })

    it('should set the payment type to bank account', () => {
      self.controller.changePaymentType('bankAccount')

      expect(self.controller.paymentType).toBe('bankAccount')
      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalledWith({ $event: { state: 'unsubmitted' } })
    })
  })
})
