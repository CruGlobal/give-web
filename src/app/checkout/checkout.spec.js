import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

import module from './checkout.component'
import { Roles, SignOutEvent } from 'common/services/session/session.service'

describe('checkout', function () {
  beforeEach(angular.mock.module(module.name))
  var self = {}

  beforeEach(inject(function ($componentController) {
    self.controller = $componentController(module.name, {
      $window: {
        location: {
          href: '/checkout.html',
          search: ''
        }, scrollTo: jest.fn() }
    })
    self.controller.checkoutService = {
      initializeRecaptcha: jest.fn()
    }
  }))

  it('to be defined', function () {
    expect(self.controller).toBeDefined()
    expect(self.controller.loadingCartData).toEqual(true)
    expect(self.controller.$rootScope).toBeDefined()
  })

  describe('$onInit()', () => {
    beforeEach(() => {
      jest.spyOn(self.controller, 'loadCart').mockImplementation(() => {})
      jest.spyOn(self.controller, 'initStepParam').mockImplementation(() => {})
      jest.spyOn(self.controller, 'listenForLocationChange').mockImplementation(() => {})
      jest.spyOn(self.controller, 'sessionEnforcerService').mockImplementation(() => {})
      jest.spyOn(self.controller.$rootScope, '$on').mockImplementation(() => {})
      jest.spyOn(self.controller, 'signedOut').mockImplementation(() => {})
      self.controller.$onInit()
    })

    it('initializes the component', () => {
      expect(self.controller.sessionEnforcerService).toHaveBeenCalledWith(
        [Roles.public, Roles.registered], expect.objectContaining({
          'sign-in': expect.any(Function),
          cancel: expect.any(Function)
        })
      )

      expect(self.controller.loadCart).not.toHaveBeenCalled()
      expect(self.controller.initStepParam).toHaveBeenCalled()
      expect(self.controller.listenForLocationChange).toHaveBeenCalled()
      expect(self.controller.$rootScope.$on).toHaveBeenCalledWith(SignOutEvent, expect.any(Function))
      self.controller.$rootScope.$on.mock.calls[0][1]()

      expect(self.controller.signedOut).toHaveBeenCalled()
      expect(self.controller.checkoutService.initializeRecaptcha).toHaveBeenCalled()
    })

    describe('sessionEnforcerService success', () => {
      it('executes success callback', () => {
        self.controller.sessionEnforcerService.mock.calls[0][1]['sign-in']()

        expect(self.controller.loadCart).toHaveBeenCalled()
      })
    })

    describe('sessionEnforcerService failure', () => {
      it('executes failure callback', () => {
        self.controller.sessionEnforcerService.mock.calls[0][1]['cancel']()

        expect(self.controller.$window.location).toEqual('/cart.html')
      })
    })
  })

  describe('$onDestroy()', () => {
    it('cleans up the component', () => {
      jest.spyOn(self.controller.sessionEnforcerService, 'cancel').mockImplementation(() => {})
      self.controller.enforcerId = '1234567890'
      self.controller.$onDestroy()

      expect(self.controller.sessionEnforcerService.cancel).toHaveBeenCalledWith('1234567890')
    })

    it('unsubscribes from $locationChangeSuccess', () => {
      self.controller.$locationChangeSuccessListener = jest.fn()
      self.controller.$onDestroy()

      expect(self.controller.$locationChangeSuccessListener).toHaveBeenCalled()
    })
  })

  describe('initStepParam()', () => {
    beforeEach(() => {
      jest.spyOn(self.controller, 'changeStep').mockImplementation(() => {})
    })

    it('should set the default step', () => {
      self.controller.initStepParam()

      expect(self.controller.changeStep).toHaveBeenCalledWith('contact', undefined)
    })

    it('should load the step from the query param', () => {
      self.controller.$location.search('step', 'payment')
      self.controller.initStepParam()

      expect(self.controller.changeStep).toHaveBeenCalledWith('payment', undefined)
    })

    it('should pass the replace argument along', () => {
      self.controller.initStepParam(true)

      expect(self.controller.changeStep).toHaveBeenCalledWith('contact', true)
    })
  })

  describe('listenForLocationChange', () => {
    it('should watch the url and update the state', () => {
      jest.spyOn(self.controller, 'initStepParam').mockImplementation(() => {})
      jest.spyOn(self.controller.cartService, 'get').mockReturnValue(Observable.of('cartData'))
      jest.spyOn(self.controller.analyticsFactory, 'checkoutStepEvent').mockImplementation(() => {})
      self.controller.listenForLocationChange()
      self.controller.$location.search('step', 'review')
      self.controller.$rootScope.$digest()

      expect(self.controller.initStepParam).toHaveBeenCalledWith('review')
      expect(self.controller.analyticsFactory.checkoutStepEvent).toHaveBeenCalledWith('review', 'cartData')
    })
  })

  describe('signedOut( event )', () => {
    describe('default prevented', () => {
      it('does nothing', () => {
        self.controller.signedOut({ defaultPrevented: true })

        expect(self.controller.$window.location.href).toEqual('/checkout.html')
      })
    })

    describe('default not prevented', () => {
      it('navigates to \'\/\'', () => {
        const spy = jest.fn()
        self.controller.signedOut({ defaultPrevented: false, preventDefault: spy })

        expect(spy).toHaveBeenCalled()
        expect(self.controller.$window.location).toEqual('/cart.html')
      })
    })
  })

  describe('changeStep', () => {
    it('should scroll to top and change the checkout step', () => {
      jest.spyOn(self.controller.$location, 'search').mockImplementation(() => {})
      jest.spyOn(self.controller.$location, 'replace').mockImplementation(() => {})
      self.controller.changeStep('review')

      expect(self.controller.$window.scrollTo).toHaveBeenCalledWith(0, 0)
      expect(self.controller.checkoutStep).toEqual('review')
      expect(self.controller.$location.search).toHaveBeenCalledWith('step', 'review')
      expect(self.controller.$location.replace).not.toHaveBeenCalled()
    })

    it('should replace the current item in pushState', () => {
      jest.spyOn(self.controller.$location, 'search').mockImplementation(() => {})
      jest.spyOn(self.controller.$location, 'replace').mockImplementation(() => {})
      self.controller.changeStep('payment', true)

      expect(self.controller.$window.scrollTo).toHaveBeenCalledWith(0, 0)
      expect(self.controller.checkoutStep).toEqual('payment')
      expect(self.controller.$location.search).toHaveBeenCalledWith('step', 'payment')
      expect(self.controller.$location.replace).toHaveBeenCalled()
    })

    it('should redirect to cart page', () => {
      self.controller.changeStep('cart')

      expect(self.controller.$window.location.href).toEqual('/cart.html')
    })

    it('should redirect to thank you page', () => {
      self.controller.changeStep('thankYou')

      expect(self.controller.$window.location.href).toEqual('/thank-you.html')
    })

    it('should retain query parameters on cart page', () => {
      const searchObject = {
        one: '1',
        step: 'review'
      }
      mockSearch(searchObject)
      self.controller.changeStep('cart')
      expect(self.controller.$window.location.href).toEqual('/cart.html?one=1')
    })

    it('should retain query parameters on thank you page', () => {
      const searchObject = {
        one: '1',
        two: '2',
        step: 'review'
      }
      mockSearch(searchObject)
      self.controller.changeStep('thankYou')
      expect(self.controller.$window.location.href).toEqual('/thank-you.html?one=1&two=2')
    })

    const mockSearch = (searchObject) => {
      jest.spyOn(self.controller.$location, 'search').mockImplementation((key) => {
        if (key === 'step') {
          delete searchObject.step
        } else if (!key) {
          return searchObject
        }
      })
    }
  })

  describe('loadCart', () => {
    it('should load the card data', () => {
      jest.spyOn(self.controller.cartService, 'get').mockReturnValue(Observable.of('cartData'))
      self.controller.loadCart()

      expect(self.controller.loadingCartData).toEqual(false)
      expect(self.controller.cartData).toEqual('cartData')
    })

    it('should still set loading to false on an error', () => {
      jest.spyOn(self.controller.cartService, 'get').mockReturnValue(Observable.throw('some error'))
      self.controller.loadCart()

      expect(self.controller.loadingCartData).toEqual(false)
      expect(self.controller.$log.error.logs[0]).toEqual(['Error loading cart', 'some error'])
    })
  })
})
