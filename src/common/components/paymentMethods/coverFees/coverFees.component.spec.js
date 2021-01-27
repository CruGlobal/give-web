import angular from 'angular'
import 'angular-mocks'
import module, { brandedCheckoutAmountUpdatedEvent } from './coverFees.component'

describe('coverFees', () => {
  beforeEach(angular.mock.module(module.name))
  const self = {}

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(module.name, {}, {
      cartData: { items: [] }
    })
  }))

  describe('$onInit', () => {
    beforeEach(() => {
      jest.spyOn(self.controller, 'updatePriceWithFees').mockImplementation(() => {})
    })

    it('should do nothing if cart data and brandedCheckoutItem is not defined', () => {
      jest.spyOn(self.controller.orderService, 'storeCoverFeeDecision').mockImplementation(() => {})
      self.controller.cartData = undefined
      self.controller.brandedCheckoutItem = undefined

      self.controller.$onInit()

      expect(self.controller.orderService.storeCoverFeeDecision).not.toHaveBeenCalled()
      expect(self.controller.updatePriceWithFees).not.toHaveBeenCalled()
    })

    it('should handle large incoming numbers properly', () => {
      self.controller.cartData = {
        items: [
          {
            amount: 25000,
            price: '$25,000.00',
            config: {
              amount: 25000
            }
          }
        ],
        cartTotal: 25000
      }

      self.controller.$onInit()
      expect(self.controller.cartData.cartTotal).toEqual(25000)
    })

    it('should reload the cover fees component if gift amount changed in branded checkout', () => {
      jest.spyOn(self.controller, '$onInit')
      self.controller.cartData = undefined
      self.controller.$rootScope.$emit(brandedCheckoutAmountUpdatedEvent)

      expect(self.controller.$onInit).toHaveBeenCalled()
    })

    it('should configure a common "item" object for the template if the cart has one item', () => {
      const cartItem = {}
      self.controller.cartData = { items: [cartItem] }
      const expectedItem = cartItem

      self.controller.$onInit()
      expect(self.controller.item).toEqual(expectedItem)
    })

    it('should configure a common "item" object for the template if we are in branded checkout', () => {
      const brandedCheckoutItem = { amount: 1.02 }
      self.controller.brandedCheckoutItem = brandedCheckoutItem
      self.controller.cartData = undefined

      self.controller.$onInit()
      expect(self.controller.item).toEqual(brandedCheckoutItem)
    })

    it('should not configure a common "item" object if the cart has multiple items', () => {
      self.controller.cartData = { items: [{}, {}] }
      self.controller.$onInit()
      expect(self.controller.item).not.toBeDefined()
    })

    it('should not call updatePriceWithFees on standard checkout', () => {
      self.controller.cartData = { items: [{ amount: 50 }] }
      expect(self.controller.updatePriceWithFees).not.toHaveBeenCalled()
    })

    it('should call updatePriceWithFees on branded checkout', () => {
      self.controller.cartData = undefined
      self.controller.brandedCheckoutItem = { amount: 50 }
      self.controller.$onInit()
      expect(self.controller.updatePriceWithFees).toHaveBeenCalled()
    })
  })

  describe('updatePriceWithFees', () => {
    it('should calculate the price to show the user', () => {
      self.controller.item = { amount: 50 }
      self.controller.updatePriceWithFees()
      expect(self.controller.item.priceWithFees).toEqual('$51.20')
    })
  })

  describe('storeCoverFeeDecision', () => {
    beforeEach(() => {
      jest.spyOn(self.controller.orderService, 'storeCoverFeeDecision').mockImplementation(() => {})
    })

    it('should store true for the cover fee decision', () => {
      self.controller.coverFees = true
      self.controller.storeCoverFeeDecision()
      expect(self.controller.orderService.storeCoverFeeDecision).toHaveBeenCalledWith(true)
    })

    it('should store false for the cover fee decision', () => {
      self.controller.coverFees = false
      self.controller.storeCoverFeeDecision()
      expect(self.controller.orderService.storeCoverFeeDecision).toHaveBeenCalledWith(false)
    })
  })
})
