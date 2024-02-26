import angular from 'angular'
import 'angular-mocks'
import module from './signIn.component'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import { LoginOktaOnlyEvent } from '../../common/services/session/session.service'

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
    $ctrl.$rootScope.$broadcast = jest.spyOn($ctrl.$rootScope, '$broadcast')
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
      jest.spyOn($ctrl.sessionService, 'hasLocationOnLogin').mockReturnValue('https://give-stage2.cru.org/search-results.html')
      jest.spyOn($ctrl.sessionService, 'removeLocationOnLogin')
      jest.spyOn($ctrl.sessionService, 'updateCurrentProfile')
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
      expect($ctrl.sessionService.updateCurrentProfile).not.toHaveBeenCalled()
      expect($ctrl.sessionService.hasLocationOnLogin).toHaveBeenCalledTimes(1)
    })
  })

  describe('as \'REGISTERED\'', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue('REGISTERED')
      jest.spyOn($ctrl.sessionService, 'removeLocationOnLogin')
      jest.spyOn($ctrl.sessionService, 'updateCurrentProfile')
      jest.spyOn($ctrl, 'sessionChanged')
    })

    afterEach(() => {
      $ctrl.$onDestroy()
    })

    describe('Without Siebel account', () => {
      it('shows register to Siebel modal upon initial Okta sign in', () => {
        jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'registration-state': 'NEW' }))
        jest.spyOn($ctrl.sessionService, 'hasLocationOnLogin').mockReturnValue('https://give-stage2.cru.org/search-results.html')
        $ctrl.$onInit()
        expect($ctrl.sessionChanged).toHaveBeenCalled()
        expect($ctrl.sessionService.removeLocationOnLogin).not.toHaveBeenCalled()
        expect($ctrl.sessionService.updateCurrentProfile).toHaveBeenCalled()
        expect($ctrl.sessionService.hasLocationOnLogin).toHaveBeenCalledTimes(1)
        expect($ctrl.$window.location).toEqual('/sign-in.html')
        expect ($ctrl.$rootScope.$broadcast).toHaveBeenCalledWith(LoginOktaOnlyEvent, 'register-account')
      })
    })

    describe('With Siebel account', () => {
      beforeEach(() => {
        jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'registration-state': 'REGISTERED' }))
      })

      afterEach(() => {
        expect($ctrl.sessionService.updateCurrentProfile).not.toHaveBeenCalled()
        expect ($ctrl.$rootScope.$broadcast).not.toHaveBeenCalled()
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

    describe('getOktaUrl()', () => {
      it('should call sessionService getOktaUrl and return Okta URL', () => {
        jest.spyOn($ctrl.sessionService, 'getOktaUrl').mockReturnValue('URL')
        const response = $ctrl.getOktaUrl()

        expect($ctrl.sessionService.getOktaUrl).toHaveBeenCalled();
        expect(response).toEqual('URL')
      })
    })

    describe('onSignUpWithOkta()', () => {
      it('should call createAccount()', () => {
        jest.spyOn($ctrl.sessionModalService, 'createAccount').mockReturnValue(Observable.throw({}))
        $ctrl.onSignUpWithOkta()

        expect($ctrl.sessionModalService.createAccount).toHaveBeenCalled()
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
