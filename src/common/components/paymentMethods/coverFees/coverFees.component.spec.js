import angular from 'angular'
import 'angular-mocks'
import module, { brandedCheckoutAmountUpdatedEvent } from './coverFees.component'

import { cartUpdatedEvent } from 'common/components/nav/navCart/navCart.component'
import { brandedCoverFeeCheckedEvent } from '../../../../app/productConfig/productConfigForm/productConfigForm.component'

describe('coverFees', () => {
  beforeEach(angular.mock.module(module.name))
  const self = {}

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(module.name, {}, {
      cartData: { items: [] }
    })
  }))

  describe('$onInit', () => {
    it('should do nothing if cart data and brandedCheckoutItem is not defined', () => {
      jest.spyOn(self.controller.orderService, 'storeCoverFeeDecision').mockImplementation(() => {})
      self.controller.cartData = undefined
      self.controller.brandedCheckoutItem = undefined

      self.controller.$onInit()

      expect(self.controller.orderService.storeCoverFeeDecision).not.toHaveBeenCalled()
    })

    it('should synchronize the cartData when there is a fee decision in the session', () => {
      jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockImplementation(() => true)
      self.controller.cartData.coverFees = null

      self.controller.$onInit()

      expect(self.controller.cartData.coverFees).toEqual(true)
    })

    it('should synchronize the brandedCheckoutItem when there is a fee decision in the session', () => {
      jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockImplementation(() => true)
      self.controller.cartData = undefined
      self.controller.brandedCheckoutItem = { coverFees: null }

      self.controller.$onInit()

      expect(self.controller.brandedCheckoutItem.coverFees).toEqual(true)
    })

    it('should synchronize the session if there is a fee decision in the cart data', () => {
      jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockImplementation(() => undefined)
      jest.spyOn(self.controller.orderService, 'storeCoverFeeDecision').mockImplementation(() => {})
      self.controller.cartData.coverFees = true

      self.controller.$onInit()

      expect(self.controller.orderService.storeCoverFeeDecision).toHaveBeenCalledWith(true)
    })

    it('should synchronize the session if there is a fee decision in the brandedCheckoutItem', () => {
      jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockImplementation(() => undefined)
      jest.spyOn(self.controller.orderService, 'storeCoverFeeDecision').mockImplementation(() => {})
      self.controller.brandedCheckoutItem = { coverFees: true }
      self.controller.cartData = undefined

      self.controller.$onInit()

      expect(self.controller.orderService.storeCoverFeeDecision).toHaveBeenCalledWith(true)
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
      self.controller.cartData = { items: [cartItem], coverFees: true }
      const expectedItem = cartItem
      expectedItem.coverFees = true

      self.controller.$onInit()
      expect(self.controller.item).toEqual(expectedItem)
    })

    it('should configure a common "item" object for the template if we are in branded checkout', () => {
      const brandedCheckoutItem = { coverFees: true }
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
  })
})
