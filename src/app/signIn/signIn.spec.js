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
      { $window: {
          location: '/sign-in.html',
          sessionStorage: {
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
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue('GUEST')
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
  })

  describe('as \'IDENTIFIED\'', () => {
    beforeEach(() => {
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

    it('navigates to checkout', () => {
      jest.spyOn($ctrl.sessionService, 'hasLocationOnLogin').mockReturnValue(null)
      $ctrl.$onInit()
      expect($ctrl.sessionChanged).toHaveBeenCalled()
      expect($ctrl.sessionService.hasLocationOnLogin).toHaveBeenCalledTimes(2)
      expect($ctrl.sessionService.removeLocationOnLogin).not.toHaveBeenCalled()
      expect($ctrl.$window.location).toEqual('/checkout.html')
    })

    it('navigates to location which user initial came from before logging in', () => {
      jest.spyOn($ctrl.sessionService, 'hasLocationOnLogin').mockReturnValue('https://give-stage2.cru.org/search-results.html')
      $ctrl.$onInit()
      expect($ctrl.sessionChanged).toHaveBeenCalled()
      expect($ctrl.sessionService.hasLocationOnLogin).toHaveBeenCalledTimes(2)
      expect($ctrl.sessionService.removeLocationOnLogin).toHaveBeenCalled()
      expect($ctrl.$window.location).toEqual('https://give-stage2.cru.org/search-results.html')
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

    describe('getOktaUrl()', () => {
      it('On sign up with Okta', () => {
        jest.spyOn($ctrl.sessionService, 'getOktaUrl').mockReturnValue('URL')
        const response = $ctrl.getOktaUrl()

        expect($ctrl.sessionService.getOktaUrl).toHaveBeenCalled();
        expect(response).toEqual('URL')
      })
    })

    describe('onSignUpWithOkta()', () => {
      it('On sign up with Okta', () => {
        jest.spyOn($ctrl.sessionModalService, 'createAccount').mockReturnValue(Observable.throw({}))
        $ctrl.onSignUpWithOkta()

        expect($ctrl.sessionModalService.createAccount).toHaveBeenCalled()
      })
    })
  })
})
