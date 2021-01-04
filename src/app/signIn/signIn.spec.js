import angular from 'angular'
import 'angular-mocks'
import module from './signIn.component'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

describe('signIn', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl

  beforeEach(inject(function (_$componentController_) {
    $ctrl = _$componentController_(module.name,
      { $window: { location: '/sign-in.html' } }
    )
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('as \'GUEST\'', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue('GUEST')
      jest.spyOn($ctrl, 'sessionChanged')
      jest.spyOn($ctrl.orderService, 'storeCartData')
      $ctrl.$onInit()
    })

    afterEach(() => {
      $ctrl.$onDestroy()
    })

    it('has does not change location', () => {
      expect($ctrl.sessionChanged).toHaveBeenCalled()
      expect($ctrl.$window.location).toEqual('/sign-in.html')
    })

    it('clears the locally stored cart', () => {
      expect($ctrl.orderService.storeCartData).toHaveBeenCalledWith(null)
    })
  })

  describe('as \'IDENTIFIED\'', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue('IDENTIFIED')
      jest.spyOn($ctrl, 'sessionChanged')
      jest.spyOn($ctrl.orderService, 'storeCartData')
      $ctrl.$onInit()
    })

    afterEach(() => {
      $ctrl.$onDestroy()
    })

    it('has does not change location', () => {
      expect($ctrl.sessionChanged).toHaveBeenCalled()
      expect($ctrl.$window.location).toEqual('/sign-in.html')
    })

    it('clears the locally stored cart', () => {
      expect($ctrl.orderService.storeCartData).toHaveBeenCalledWith(null)
    })
  })

  describe('as \'REGISTERED\'', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue('REGISTERED')
      jest.spyOn($ctrl, 'sessionChanged')
      jest.spyOn($ctrl.orderService, 'storeCartData')
      $ctrl.$onInit()
    })

    afterEach(() => {
      $ctrl.$onDestroy()
    })

    it('navigates to checkout', () => {
      expect($ctrl.sessionChanged).toHaveBeenCalled()
      expect($ctrl.$window.location).toEqual('/checkout.html')
    })

    it('clears the locally stored cart', () => {
      expect($ctrl.orderService.storeCartData).toHaveBeenCalledWith(null)
    })
  })

  describe('checkoutAsGuest()', () => {
    describe('downgradeToGuest success', () => {
      it('navigates to checkout', () => {
        jest.spyOn($ctrl.sessionService, 'downgradeToGuest').mockReturnValue(Observable.of({}))
        $ctrl.checkoutAsGuest()

        expect($ctrl.$window.location).toEqual('/checkout.html')
      })
    })

    describe('downgradeToGuest failure', () => {
      it('navigates to checkout', () => {
        jest.spyOn($ctrl.sessionService, 'downgradeToGuest').mockReturnValue(Observable.throw({}))
        $ctrl.checkoutAsGuest()

        expect($ctrl.$window.location).toEqual('/checkout.html')
      })
    })
  })

  describe('resetPassword()', () => {
    let deferred
    beforeEach(inject(function (_$q_) {
      deferred = _$q_.defer()
      jest.spyOn($ctrl.sessionModalService, 'forgotPassword').mockImplementation(() => deferred.promise)
      $ctrl.resetPassword()
    }))

    it('opens reset password modal', () => {
      expect($ctrl.sessionModalService.forgotPassword).toHaveBeenCalled()
    })
  })
})
