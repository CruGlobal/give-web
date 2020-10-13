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
    beforeEach(() => {
      jest.spyOn(self.controller.orderService, 'calculatePricesWithFees').mockImplementation(() => {})
      jest.spyOn(self.controller.orderService, 'retrieveFeesApplied').mockImplementation(() => false)
    })

    it('should do nothing if cart data and brandedCheckoutItem is not defined', () => {
      jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockImplementation(() => true)
      jest.spyOn(self.controller, 'updatePrices').mockImplementation(() => {})
      self.controller.cartData = undefined
      self.controller.brandedCheckoutItem = undefined

      self.controller.$onInit()

      expect(self.controller.orderService.calculatePricesWithFees).not.toHaveBeenCalled()
      expect(self.controller.orderService.retrieveCoverFeeDecision).not.toHaveBeenCalled()
      expect(self.controller.orderService.retrieveFeesApplied).not.toHaveBeenCalled()
      expect(self.controller.updatePrices).not.toHaveBeenCalled()
    })

    it('should calculate prices if the calculation has not yet been done', () => {
      self.controller.$onInit()
      expect(self.controller.orderService.calculatePricesWithFees).toHaveBeenCalled()
    })

    it('should take prior fee application into account when doing calculation when covering fees', () => {
      jest.spyOn(self.controller.orderService, 'retrieveFeesApplied').mockImplementation(() => true)
      self.controller.cartData.coverFees = true
      self.controller.$onInit()
      expect(self.controller.orderService.calculatePricesWithFees)
        .toHaveBeenCalledWith(true, self.controller.cartData.items)
    })

    it('should take prior fee application into account when doing calculation when covering fees - BC', () => {
      jest.spyOn(self.controller.orderService, 'retrieveFeesApplied').mockImplementation(() => true)
      self.controller.brandedCheckoutItem = { coverFees: true }
      self.controller.cartData = undefined
      self.controller.$onInit()
      expect(self.controller.orderService.calculatePricesWithFees)
        .toHaveBeenCalledWith(true, [self.controller.brandedCheckoutItem])
    })

    it('should take prior fee application into account when doing calculation when session covering fees', () => {
      jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockImplementation(() => true)
      jest.spyOn(self.controller.orderService, 'retrieveFeesApplied').mockImplementation(() => true)

      self.controller.cartData.coverFees = false
      self.controller.$onInit()
      expect(self.controller.orderService.calculatePricesWithFees)
        .toHaveBeenCalledWith(true, self.controller.cartData.items)
    })

    it('should take prior fee application into account when doing calculation when session covering fees - BC', () => {
      jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockImplementation(() => true)
      jest.spyOn(self.controller.orderService, 'retrieveFeesApplied').mockImplementation(() => true)

      self.controller.brandedCheckoutItem = { coverFees: false }
      self.controller.cartData = undefined
      self.controller.$onInit()
      expect(self.controller.orderService.calculatePricesWithFees)
        .toHaveBeenCalledWith(true, [self.controller.brandedCheckoutItem])
    })

    it('should not calculate prices if the calculation has already been done', () => {
      self.controller.feesCalculated = true
      self.controller.$onInit()
      expect(self.controller.orderService.calculatePricesWithFees).not.toHaveBeenCalled()
    })

    it('should synchronize the cartData when there is a fee decision in the session', () => {
      jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockImplementation(() => true)
      jest.spyOn(self.controller, 'updatePrices').mockImplementation(() => {})
      self.controller.cartData.coverFees = null

      self.controller.$onInit()

      expect(self.controller.cartData.coverFees).toEqual(true)
      expect(self.controller.updatePrices).toHaveBeenCalled()
    })

    it('should synchronize the brandedCheckoutItem when there is a fee decision in the session', () => {
      jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockImplementation(() => true)
      jest.spyOn(self.controller, 'updatePrice').mockImplementation(() => {})
      self.controller.cartData = undefined
      self.controller.brandedCheckoutItem = { coverFees: null }

      self.controller.$onInit()

      expect(self.controller.brandedCheckoutItem.coverFees).toEqual(true)
      expect(self.controller.updatePrice).toHaveBeenCalled()
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

    it('should store the cart data on page load', () => {
      jest.spyOn(self.controller.orderService, 'storeCartData').mockImplementation(() => {})
      self.controller.cartData = { items: [] }

      self.controller.$onInit()
      expect(self.controller.orderService.storeCartData).toHaveBeenCalledWith(self.controller.cartData)
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
      self.controller.feesCalculated = true
      self.controller.cartData = undefined
      self.controller.$rootScope.$emit(brandedCheckoutAmountUpdatedEvent)

      expect(self.controller.$onInit).toHaveBeenCalled()
      expect(self.controller.feesCalculated).toEqual(false)
    })
  })

  describe('updatePrices', () => {
    it('should should update the prices', () => {
      jest.spyOn(self.controller.orderService, 'updatePrices').mockImplementation(() => {})
      self.controller.updatePrices()
      expect(self.controller.orderService.updatePrices).toHaveBeenCalledWith(self.controller.cartData)
    })

    it('should notify listeners that the cart was updated', () => {
      jest.spyOn(self.controller.orderService, 'updatePrices').mockImplementation(() => {})
      jest.spyOn(self.controller.$scope, '$emit').mockImplementation(() => {})
      self.controller.updatePrices()
      expect(self.controller.$scope.$emit).toHaveBeenCalledWith(cartUpdatedEvent)
    })
  })

  describe('updatePrice', () => {
    beforeEach(() => {
      self.controller.brandedCheckoutItem = { coverFees: true }
    })
    it('should update the price', () => {
      jest.spyOn(self.controller.orderService, 'updatePrice').mockImplementation(() => {})
      self.controller.updatePrice()
      expect(self.controller.orderService.updatePrice)
        .toHaveBeenCalledWith(self.controller.brandedCheckoutItem, self.controller.brandedCheckoutItem.coverFees)
    })

    it('should store cover fee decision', () => {
      jest.spyOn(self.controller.orderService, 'updatePrice').mockImplementation(() => {})
      jest.spyOn(self.controller.orderService, 'storeCoverFeeDecision').mockImplementation(() => {})
      self.controller.updatePrice()
      expect(self.controller.orderService.storeCoverFeeDecision).toHaveBeenCalledWith(true)
    })

    it('should notify listeners that the checkbox was checked', () => {
      jest.spyOn(self.controller.orderService, 'updatePrice').mockImplementation(() => {})
      jest.spyOn(self.controller.$scope, '$emit').mockImplementation(() => {})
      self.controller.updatePrice()
      expect(self.controller.$scope.$emit).toHaveBeenCalledWith(brandedCoverFeeCheckedEvent)
    })
  })
})
