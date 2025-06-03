import angular from 'angular'
import 'angular-mocks'
import module from './cart.component'

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

import { cartUpdatedEvent } from 'common/lib/cartEvents'

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
        location: {
          href: '/cart.html',
          search: ''
        }
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

    it('should preserve the order', () => {
      self.controller.cartService.get.mockReturnValue(Observable.of({ items: [{ code: '1' }, { code: '2' }, { code: '3' }] }))
      self.controller.loadCart(true)

      self.controller.cartService.get.mockReturnValue(Observable.of({ items: [{ code: '3' }, { code: '2' }, { code: '1' }, { code: '4' }] }))
      self.controller.loadCart(true)

      expect(self.controller.cartData).toEqual({ items: [{ code: '4' }, { code: '1' }, { code: '2' }, { code: '3' }] })
    })

    it('should handle empty data', () => {
      self.controller.cartService.get.mockReturnValue(Observable.of({}))
      self.controller.loadCart(true)

      expect(self.controller.cartData).toEqual({})
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

    it('should recognize when a donor has covered fees', () => {
      self.controller.cartService.get.mockReturnValue(Observable.of({ items: [] }))
      jest.spyOn(self.controller.orderService, 'retrieveCoverFeeDecision').mockImplementation(() => true)
      self.controller.loadCart(true)

      expect(self.controller.donorCoveredFees).toEqual(true)
    })

    it('should recognize when a donor has not covered fees', () => {
      self.controller.cartService.get.mockReturnValue(Observable.of({}))
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
    })
  })

  describe('checkout()', () => {
    it('should return uri', () => {
      self.controller.checkout()

      expect(self.controller.$window.location.href).toBe('/checkout.html')
      self.controller.sessionService.getRole = () => 'foo'
      self.controller.checkout()

      expect(self.controller.$window.location.href).toBe('/sign-in.html')
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
