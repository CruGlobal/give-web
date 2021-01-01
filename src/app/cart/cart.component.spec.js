import angular from 'angular'
import 'angular-mocks'
import module from './cart.component'

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

import { cartUpdatedEvent } from 'common/components/nav/navCart/navCart.component'

describe('cart', () => {
  beforeEach(angular.mock.module(module.name))
  const self = {}

  beforeEach(inject(function ($componentController) {
    self.controller = $componentController(module.name, {
      cartService: {
        get: jest.fn(),
        loadCart: jest.fn(),
        deleteItem: jest.fn()
      },
      productModalService: {
        configureProduct: () => {}
      },
      sessionService: {
        getRole: () => 'REGISTERED'
      },
      $window: {
        location: '/cart.html'
      },
      $document: [{
        referrer: ''
      }]
    })
  }))

  it('to be defined', () => {
    expect(self.controller).toBeDefined()
  })

  describe('$onInit()', () => {
    it('should call loadCart()', () => {
      jest.spyOn(self.controller, 'loadCart').mockImplementation(() => {})
      jest.spyOn(self.controller.analyticsFactory, 'cartView').mockImplementation(() => {})
      self.controller.$onInit()

      expect(self.controller.loadCart).toHaveBeenCalledWith()
      expect(self.controller.analyticsFactory.cartView).toHaveBeenCalled()
    })
  })

  describe('loadCart()', () => {
    it('should load cart data', () => {
      self.controller.cartService.get.mockReturnValue(Observable.of('data'))
      self.controller.loadCart()

      expect(self.controller.cartService.get).toHaveBeenCalled()
      expect(self.controller.cartData).toEqual('data')
      expect(self.controller.loading).toEqual(false)
      expect(self.controller.updating).toEqual(false)
    })

    it('should reload cart data', () => {
      self.controller.cartService.get.mockReturnValue(Observable.of('data'))
      self.controller.loadCart(true)

      expect(self.controller.cartService.get).toHaveBeenCalled()
      expect(self.controller.cartData).toEqual('data')
      expect(self.controller.loading).toEqual(false)
      expect(self.controller.updating).toEqual(false)
    })

    it('should handle an error loading cart data', () => {
      self.controller.cartData = 'previous data'
      self.controller.cartService.get.mockReturnValue(Observable.throw('error'))
      self.controller.loadCart()

      expect(self.controller.cartService.get).toHaveBeenCalled()
      expect(self.controller.cartData).toEqual('previous data')
      expect(self.controller.loading).toEqual(false)
      expect(self.controller.updating).toEqual(false)
      expect(self.controller.error).toEqual({
        loading: true,
        updating: false
      })

      expect(self.controller.$log.error.logs[0]).toEqual(['Error loading cart', 'error'])
    })

    it('should handle an error reloading cart data', () => {
      self.controller.cartData = 'previous data'
      self.controller.cartService.get.mockReturnValue(Observable.throw('error'))
      self.controller.loadCart(true)

      expect(self.controller.cartService.get).toHaveBeenCalled()
      expect(self.controller.cartData).toEqual('previous data')
      expect(self.controller.loading).toEqual(false)
      expect(self.controller.updating).toEqual(false)
      expect(self.controller.error).toEqual({
        loading: false,
        updating: true
      })

      expect(self.controller.$log.error.logs[0]).toEqual(['Error loading cart', 'error'])
    })

    xit('should load cart from local storage if it is there', () => {
      const cartData = { items: [] }
      jest.spyOn(self.controller.orderService, 'retrieveCartData').mockReturnValue(cartData)
      jest.spyOn(self.controller.cartService, 'get')
      jest.spyOn(self.controller.analyticsFactory, 'buildProductVar')
      jest.spyOn(self.controller.analyticsFactory, 'pageLoaded')
      self.controller.loadCart()

      expect(self.controller.loading).toEqual(false)
      expect(self.controller.updating).toEqual(false)
      expect(self.controller.cartData).toEqual(cartData)
      expect(self.controller.cartService.get).not.toHaveBeenCalled()
      expect(self.controller.analyticsFactory.buildProductVar).toHaveBeenCalledWith(cartData)
      expect(self.controller.analyticsFactory.pageLoaded).toHaveBeenCalled()
    })

    xit('should reload cart from local storage if it is there', () => {
      const cartData = { items: [] }
      jest.spyOn(self.controller.orderService, 'retrieveCartData').mockReturnValue(cartData)
      jest.spyOn(self.controller.cartService, 'get')
      jest.spyOn(self.controller.analyticsFactory, 'buildProductVar')
      jest.spyOn(self.controller.analyticsFactory, 'pageLoaded')
      self.controller.loadCart(true)

      expect(self.controller.loading).toEqual(false)
      expect(self.controller.updating).toEqual(false)
      expect(self.controller.cartData).toEqual(cartData)
      expect(self.controller.cartService.get).not.toHaveBeenCalled()
      expect(self.controller.analyticsFactory.buildProductVar).toHaveBeenCalledWith(cartData)
      expect(self.controller.analyticsFactory.pageLoaded).not.toHaveBeenCalled()
    })

    it('should add fee amounts to the cart if the fees have been chosen and a gift was added', () => {
      const returnedCart = {
        items: [
          {
            amount: 1,
            price: '$1.00'
          },
          {
            amount: 2,
            price: '$2.00'
          }
        ]
      }
      self.controller.cartService.get.mockReturnValue(Observable.of(returnedCart))
      jest.spyOn(self.controller.orderService, 'storeFeesApplied').mockImplementation(() => {})
      jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockReturnValue(true)
      jest.spyOn(self.controller.orderService, 'calculatePricesWithFees').mockImplementation(() => {})
      jest.spyOn(self.controller.orderService, 'updatePrices').mockImplementation(() => {})

      self.controller.loadCart()
      expect(self.controller.orderService.storeFeesApplied).toHaveBeenCalledWith(true)
      expect(self.controller.orderService.calculatePricesWithFees).toHaveBeenCalledWith(false, returnedCart.items)
      expect(self.controller.orderService.updatePrices).toHaveBeenCalledWith(returnedCart)
    })

    it('should recognize when a donor has covered fees', () => {
      self.controller.cartService.get.mockReturnValue(Observable.of({ items: [] }))
      jest.spyOn(self.controller.orderService, 'retrieveCartData').mockImplementation(() => null)
      jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockImplementation(() => true)
      self.controller.loadCart(true)

      expect(self.controller.donorCoveredFees).toEqual(true)
    })

    it('should recognize when a donor has not covered fees', () => {
      self.controller.cartService.get.mockReturnValue(Observable.of({}))
      jest.spyOn(self.controller.orderService, 'retrieveCartData').mockImplementation(() => null)
      jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockImplementation(() => false)
      self.controller.loadCart(true)

      expect(self.controller.donorCoveredFees).toEqual(false)
    })
  })

  describe('removeItem()', () => {
    beforeEach(() => {
      jest.spyOn(self.controller.$scope, '$emit').mockImplementation(() => {})
      jest.spyOn(self.controller.analyticsFactory, 'cartRemove').mockImplementation(() => {})
      self.controller.cartData = { items: [{ uri: 'uri1' }, { uri: 'uri2' }] }
    })

    it('should remove item from cart', () => {
      jest.spyOn(self.controller, 'loadCart').mockImplementation(() => {})
      jest.spyOn(self.controller.orderService, 'retrieveCartData').mockImplementation(() => null)
      self.controller.cartService.deleteItem.mockReturnValue(Observable.of('data'))
      self.controller.removeItem(self.controller.cartData.items[0])

      expect(self.controller.cartService.deleteItem).toHaveBeenCalledWith('uri1')
      expect(self.controller.loadCart).toHaveBeenCalledWith(true)
      expect(self.controller.cartData.items).toEqual([{ uri: 'uri2' }])
      expect(self.controller.$scope.$emit).toHaveBeenCalledWith(cartUpdatedEvent)
      expect(self.controller.analyticsFactory.cartRemove).toHaveBeenCalledWith({ removing: true, uri: 'uri1' })
    })

    it('should handle an error removing an item', () => {
      self.controller.cartService.deleteItem.mockReturnValue(Observable.throw('error'))
      self.controller.removeItem(self.controller.cartData.items[0])

      expect(self.controller.cartService.deleteItem).toHaveBeenCalledWith('uri1')
      expect(self.controller.cartData.items).toEqual([{ uri: 'uri1', removingError: true }, { uri: 'uri2' }])
      expect(self.controller.$log.error.logs[0]).toEqual(['Error deleting item from cart', 'error'])
      expect(self.controller.$scope.$emit).not.toHaveBeenCalled()
      expect(self.controller.analyticsFactory.cartRemove).not.toHaveBeenCalled()
    })

    xit('should remove item from locally stored cart', () => {
      jest.spyOn(self.controller, 'loadCart').mockImplementation(() => {})
      jest.spyOn(self.controller.orderService, 'retrieveCartData').mockReturnValue(self.controller.cartData)
      jest.spyOn(self.controller.orderService, 'storeCartData')
      self.controller.cartService.deleteItem.mockReturnValue(Observable.of('data'))
      self.controller.removeItem(self.controller.cartData.items[0])

      expect(self.controller.orderService.storeCartData).toHaveBeenCalledWith({ items: [{ uri: 'uri2' }] })
    })
  })

  describe('editItem()', () => {
    beforeEach(() => {
      self.controller.callback = () => {
        return {
          result: {
            then: function (callback) {
              callback({ isUpdated: true })
            }
          }
        }
      }
      jest.spyOn(self.controller, 'loadCart').mockImplementation(() => {})
      jest.spyOn(self.controller.productModalService, 'configureProduct').mockImplementation(self.controller.callback)
      self.controller.cartData = { items: [{ code: '0123456', config: 'some config', uri: 'uri1' }, { uri: 'uri2' }] }
    })

    it('should call a modal and reload cart of successful edit', () => {
      self.controller.isUpdated = true

      self.controller.editItem(self.controller.cartData.items[0])

      expect(self.controller.productModalService.configureProduct).toHaveBeenCalledWith('0123456', 'some config', true, 'uri1')
      expect(self.controller.loadCart).toHaveBeenCalledWith(true)
      expect(self.controller.cartData.items).toEqual([{ uri: 'uri2' }])
    })
  })

  describe('checkout()', () => {
    it('should return uri', () => {
      self.controller.checkout()

      expect(self.controller.$window.location).toBe('/checkout.html')
      self.controller.sessionService.getRole = () => 'foo'
      self.controller.checkout()

      expect(self.controller.$window.location).toBe('/sign-in.html')
    })
  })

  describe('setContinueBrowsingUrl()', () => {
    beforeEach(() => {
      self.controller.continueBrowsingUrl = null
    })

    it('set continue browsing url', () => {
      self.controller.$document[0].referrer = 'https://give-stage2.cru.org/page-to-give-more'
      self.controller.setContinueBrowsingUrl()

      expect(self.controller.continueBrowsingUrl).toEqual('https://give-stage2.cru.org/page-to-give-more')
    })

    it('skip if not give url', () => {
      self.controller.$document[0].referrer = 'https://www.cru.org/another-page'
      self.controller.setContinueBrowsingUrl()

      expect(self.controller.continueBrowsingUrl).toEqual(null)
    })

    it('remove giving modal params', () => {
      self.controller.$document[0].referrer = 'https://give-stage2.cru.org/page-to-give-more?modal=give-gift'
      self.controller.setContinueBrowsingUrl()

      expect(self.controller.continueBrowsingUrl).toEqual('https://give-stage2.cru.org/page-to-give-more')
    })
  })
})
