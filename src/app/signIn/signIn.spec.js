import angular from 'angular'
import 'angular-mocks'
import module from './signIn.component'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

describe('signIn', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, orderService

  beforeEach(inject(function (_$componentController_, _orderService_) {
    orderService = _orderService_
    $ctrl = _$componentController_(module.name,
      { $window: {
          location: '/sign-in.html',
          localStorage: {
            getItem: jest.fn(),
            removeItem: jest.fn(),
          }
        }
      }
    )
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('as \'GUEST\'', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.sessionService, 'hasLocationOnLogin').mockReturnValue('https://give-stage2.cru.org/search-results.html')
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue('GUEST')
      jest.spyOn($ctrl.sessionService, 'removeLocationOnLogin')
      jest.spyOn($ctrl, 'sessionChanged')
      $ctrl.$onInit()
    })

    afterEach(() => {
      $ctrl.$onDestroy()
    })

    it('has does not change location', () => {
      expect($ctrl.sessionChanged).toHaveBeenCalled()
      expect($ctrl.$window.location).toEqual('/sign-in.html')
    })

    it('does not show redirecting loading sign when not fully registered', () => {
      expect($ctrl.sessionChanged).toHaveBeenCalled()
      expect($ctrl.showRedirectingLoadingIcon).toEqual(false)
      expect($ctrl.sessionService.removeLocationOnLogin).not.toHaveBeenCalled()
    })
  })

  describe('as \'IDENTIFIED\'', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.sessionService, 'hasLocationOnLogin').mockReturnValue('https://give-stage2.cru.org/search-results.html')
      jest.spyOn($ctrl.sessionService, 'removeLocationOnLogin')
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue('IDENTIFIED')
      jest.spyOn($ctrl, 'sessionChanged')
      $ctrl.$onInit()
    })

    afterEach(() => {
      $ctrl.$onDestroy()
    })

    it('has does not change location', () => {
      expect($ctrl.sessionChanged).toHaveBeenCalled()
      expect($ctrl.$window.location).toEqual('/sign-in.html')
      expect($ctrl.sessionService.removeLocationOnLogin).not.toHaveBeenCalled()
      expect($ctrl.sessionService.hasLocationOnLogin).toHaveBeenCalledTimes(1)
    })

    it('does not show redirecting loading sign when not fully registered', () => {
      jest.spyOn($ctrl.sessionService, 'hasLocationOnLogin').mockReturnValue('https://give-stage2.cru.org/search-results.html')
      $ctrl.$onInit()
      expect($ctrl.sessionChanged).toHaveBeenCalled()
      expect($ctrl.showRedirectingLoadingIcon).toEqual(false)
      expect($ctrl.sessionService.removeLocationOnLogin).not.toHaveBeenCalled()
    })
  })

  describe('as \'REGISTERED\'', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue('REGISTERED')
      jest.spyOn($ctrl.sessionService, 'removeLocationOnLogin')
      jest.spyOn($ctrl, 'sessionChanged')
    })

    afterEach(() => {
      $ctrl.$onDestroy()
    })

    describe('Without a donor account account', () => {
      let deferred, $rootScope
      beforeEach(inject((_$q_, _$rootScope_) => {
        deferred = _$q_.defer()
        $rootScope = _$rootScope_
        jest.spyOn($ctrl.sessionModalService, 'registerAccount').mockReturnValue(deferred.promise)
        jest.spyOn($ctrl.sessionModalService, 'userMatch').mockReturnValue(deferred.promise)
      }))

      it('shows register for a donor account modal upon initial Okta sign in', () => {
        jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'registration-state': 'NEW' }))
        jest.spyOn($ctrl.sessionService, 'hasLocationOnLogin').mockReturnValue('https://give-stage2.cru.org/search-results.html')
        $ctrl.$onInit()
        expect($ctrl.sessionChanged).toHaveBeenCalled()
        expect($ctrl.showRedirectingLoadingIcon).toEqual(true)
        expect($ctrl.sessionModalService.registerAccount).toHaveBeenCalled()
        expect($ctrl.$window.location).toEqual('/sign-in.html')
        expect($ctrl.sessionModalService.userMatch).not.toHaveBeenCalled()
        expect($ctrl.sessionService.removeLocationOnLogin).not.toHaveBeenCalled()

        deferred.resolve()
        $rootScope.$digest()
        expect($ctrl.sessionService.removeLocationOnLogin).toHaveBeenCalled()
      })

      it('shows register a donor account modal upon matched account', () => {
        jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'registration-state': 'MATCHED' }))
        jest.spyOn($ctrl.sessionService, 'hasLocationOnLogin').mockReturnValue('https://give-stage2.cru.org/search-results.html')
        $ctrl.$onInit()
        expect($ctrl.sessionChanged).toHaveBeenCalled()
        expect($ctrl.sessionModalService.userMatch).toHaveBeenCalled()
        expect($ctrl.$window.location).toEqual('/sign-in.html')
        expect($ctrl.sessionModalService.registerAccount).not.toHaveBeenCalled()
        expect($ctrl.sessionService.removeLocationOnLogin).not.toHaveBeenCalled()

        deferred.resolve()
        $rootScope.$digest()
        expect($ctrl.sessionService.removeLocationOnLogin).toHaveBeenCalled()
      })
    })

    describe('With a donor account account', () => {
      beforeEach(() => {
        jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'registration-state': 'REGISTERED' }))
      })

      it('navigates to checkout if location prior to login wasn\'t saved', () => {
        jest.spyOn($ctrl.sessionService, 'hasLocationOnLogin').mockReturnValue(null)
        $ctrl.$onInit()
        expect($ctrl.sessionChanged).toHaveBeenCalled()
        expect($ctrl.sessionService.hasLocationOnLogin).toHaveBeenCalledTimes(2)
        expect($ctrl.sessionService.removeLocationOnLogin).not.toHaveBeenCalled()
        expect($ctrl.$window.location).toEqual('/checkout.html')
      })

      it('navigates to location prior to login', () => {
        jest.spyOn($ctrl.sessionService, 'hasLocationOnLogin').mockReturnValue('https://give-stage2.cru.org/search-results.html')
        $ctrl.$onInit()
        expect($ctrl.sessionChanged).toHaveBeenCalled()
        expect($ctrl.sessionService.hasLocationOnLogin).toHaveBeenCalledTimes(2)
        expect($ctrl.sessionService.removeLocationOnLogin).toHaveBeenCalled()
        expect($ctrl.$window.location).toEqual('https://give-stage2.cru.org/search-results.html')
      })
    });
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

  describe('closeRedirectingLoading()', () => {
    it('should remove the Redirecting loading icon', () => {
      $ctrl.showRedirectingLoadingIcon = true
      $ctrl.closeRedirectingLoading()
      expect($ctrl.showRedirectingLoadingIcon).toEqual(false)
    });
  });
})
