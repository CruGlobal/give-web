import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import module, { giftAddedEvent, cartUpdatedEvent } from './navCart.component'

describe('navCart', () => {
  beforeEach(angular.mock.module(module.name))
  let $ctrl

  beforeEach(inject(function ($componentController) {
    $ctrl = $componentController(module.name, {
      $window: {
        location: {
          pathname: '/cart.html'
        }
      }
    })
  }))

  beforeEach(() => {
    jest.spyOn($ctrl.orderService, 'storeCartData').mockImplementation(() => {})
  })

  describe('$onInit', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'loadCart').mockImplementation(() => {})
      $ctrl.sessionService.sessionSubject = new Subject()
    })

    it('should initialize the mobile flag', () => {
      $ctrl.$onInit()

      expect($ctrl.mobile).toEqual(false)

      $ctrl.mobile = 'true'
      $ctrl.$onInit()

      expect($ctrl.mobile).toEqual(true)
    })

    it('should not call loadCart', () => {
      // Other events will notify this component that the cart needs to be loaded for the first time
      $ctrl.$onInit()

      expect($ctrl.loadCart).not.toHaveBeenCalled()
    })

    it('should setup event listeners to reload cart', () => {
      jest.spyOn($ctrl.$rootScope, '$on').mockImplementation(() => {})
      $ctrl.$onInit()

      expect($ctrl.loadCart).not.toHaveBeenCalled()
      expect($ctrl.$rootScope.$on).toHaveBeenCalledWith(giftAddedEvent, expect.any(Function))
      $ctrl.$rootScope.$on.mock.calls[0][1]()

      expect($ctrl.loadCart).toHaveBeenCalledTimes(1)
      expect($ctrl.$rootScope.$on).toHaveBeenCalledWith(cartUpdatedEvent, expect.any(Function))
      $ctrl.$rootScope.$on.mock.calls[1][1]()

      expect($ctrl.loadCart).toHaveBeenCalledTimes(2)
    })

    it('should setup the session subject event listener but not reload cart until another event has loaded it', () => {
      $ctrl.$onInit()
      $ctrl.sessionService.sessionSubject.next()

      expect($ctrl.loadCart).not.toHaveBeenCalled()
    })

    it('should setup the session subject event listener and reload cart if it has been loaded previously', () => {
      $ctrl.firstLoad = false
      $ctrl.$onInit()

      expect($ctrl.loadCart).not.toHaveBeenCalled()
      $ctrl.sessionService.sessionSubject.next()

      expect($ctrl.loadCart).toHaveBeenCalled()
    })
  })

  describe('loadCart', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.cartService, 'get').mockImplementation(() => {})
      jest.spyOn($ctrl.analyticsFactory, 'setEvent').mockImplementation(() => {})
    })

    it('should load the cart data', () => {
      $ctrl.cartService.get.mockReturnValue(Observable.of({ items: ['first item'] }))

      expect($ctrl.firstLoad).toEqual(true)
      $ctrl.loadCart(true)

      expect($ctrl.cartData).toEqual({ items: ['first item'] })
      expect($ctrl.loading).toEqual(false)
      expect($ctrl.hasItems).toEqual(true)
      expect($ctrl.error).toEqual(false)
      expect($ctrl.firstLoad).toEqual(false)
      expect($ctrl.analyticsFactory.setEvent).toHaveBeenCalled()
    })

    it('should handling loading a cart that has no items', () => {
      $ctrl.cartService.get.mockReturnValue(Observable.of({}))
      $ctrl.loadCart()

      expect($ctrl.cartData).toEqual({})
      expect($ctrl.loading).toEqual(false)
      expect($ctrl.hasItems).toEqual(false)
      expect($ctrl.error).toEqual(false)
    })

    it('should handling an error loading the cart', () => {
      $ctrl.cartService.get.mockReturnValue(Observable.throw('some error'))
      $ctrl.loadCart()

      expect($ctrl.loading).toEqual(false)
      expect($ctrl.hasItems).toEqual(false)
      expect($ctrl.error).toEqual(true)
      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading nav cart items', 'some error'])
    })

    it('should load cart from local storage if it is there', () => {
      const cartData = { items: [ {} ] }
      jest.spyOn($ctrl.orderService, 'retrieveCartData').mockReturnValue(cartData)
      jest.spyOn($ctrl.cartService, 'get')
      jest.spyOn($ctrl.analyticsFactory, 'buildProductVar')
      jest.spyOn($ctrl.analyticsFactory, 'setEvent')
      $ctrl.loadCart(true)

      expect($ctrl.loading).toEqual(false)
      expect($ctrl.hasItems).toEqual(true)
      expect($ctrl.cartData).toEqual(cartData)
      expect($ctrl.cartService.get).not.toHaveBeenCalled()
      expect($ctrl.analyticsFactory.buildProductVar).toHaveBeenCalledWith(cartData)
      expect($ctrl.analyticsFactory.setEvent).toHaveBeenCalledWith('cart open')
    })

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

    it('should add fee amounts to the cart if the fees have been chosen and a gift was added', () => {
      $ctrl.cartService.get.mockReturnValue(Observable.of(returnedCart))
      jest.spyOn($ctrl.orderService, 'storeFeesApplied').mockImplementation(() => {})
      jest.spyOn($ctrl.orderService, 'retrieveCoverFeeDecision').mockReturnValue(true)
      jest.spyOn($ctrl.orderService, 'calculatePricesWithFees').mockImplementation(() => {})
      jest.spyOn($ctrl.orderService, 'updatePrices').mockImplementation(() => {})

      $ctrl.loadCart()
      expect($ctrl.orderService.storeFeesApplied).toHaveBeenCalledWith(true)
      expect($ctrl.orderService.calculatePricesWithFees).toHaveBeenCalledWith(false, returnedCart.items)
      expect($ctrl.orderService.updatePrices).toHaveBeenCalledWith(returnedCart)
    })

    it('should save the loaded gift cart into local storage', () => {
      jest.spyOn($ctrl.cartService, 'get').mockReturnValue(Observable.of(returnedCart))
      jest.spyOn($ctrl.orderService, 'storeFeesApplied').mockImplementation(() => {})
      jest.spyOn($ctrl.orderService, 'retrieveCoverFeeDecision').mockReturnValue(true)
      jest.spyOn($ctrl.orderService, 'calculatePricesWithFees').mockImplementation(() => {})
      jest.spyOn($ctrl.orderService, 'updatePrices').mockImplementation(() => {})

      $ctrl.loadCart()
      expect($ctrl.orderService.storeCartData).toHaveBeenCalledWith(returnedCart);
    })
  })

  describe('checkout', () => {
    it('should redirect to sign-in', () => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue('GUEST')
      $ctrl.checkout()

      expect($ctrl.$window.location).toBe('https://give-stage2.cru.org/sign-in.html')
    })

    it('should redirect to checkout', () => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue('REGISTERED')
      $ctrl.checkout()

      expect($ctrl.$window.location).toBe('https://give-stage2.cru.org/checkout.html')
    })
  })
})
