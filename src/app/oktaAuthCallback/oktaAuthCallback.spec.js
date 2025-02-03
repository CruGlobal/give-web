import angular from 'angular'
import 'angular-mocks'
import module, { unknownErrorMessage } from './oktaAuthCallback.component'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

describe('oktaAuthCallback', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, $rootScope, $log, orderService

  beforeEach(inject(function (_$componentController_, _$rootScope_, _$log_, _orderService_) {
    $rootScope = _$rootScope_
    $log = _$log_
    orderService = _orderService_
    $ctrl = _$componentController_(module.name,
      { 
        $log,
        $window: {
          location: '/okta-auth-callback.html',
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

  describe('$onInit', () => {
    it('should call onSignInSuccess when handleOktaRedirect returns successfully', () => {
      jest.spyOn($ctrl, 'onSignInSuccess').mockImplementation(() => {})
      jest.spyOn($ctrl.sessionService, 'handleOktaRedirect').mockReturnValue(Observable.of('data'))

      $ctrl.$onInit()
      $rootScope.$digest()

      expect($ctrl.onSignInSuccess).toHaveBeenCalledWith('data')
    })

    it('should call onSignInFailure when handleOktaRedirect returns an error', () => {
      jest.spyOn($ctrl, 'onSignInFailure').mockImplementation(() => {})
      jest.spyOn($ctrl.sessionService, 'handleOktaRedirect').mockReturnValue(Observable.throw('error'))

      $ctrl.$onInit()
      $rootScope.$digest()

      expect($ctrl.onSignInFailure).toHaveBeenCalledWith('error')
    })
  })

  
  describe('onSignInFailure()', () => {
    it('should log error message', () => {
      jest.spyOn($log, 'error').mockImplementation(() => {})
      $ctrl.onSignInFailure('error')
      expect($log.error).toHaveBeenCalledWith('error')
    })

    it('should call removeLocationOnLogin()', () => {
      jest.spyOn($ctrl.sessionService, 'removeLocationOnLogin')
      $ctrl.onSignInFailure('error')
      expect($ctrl.sessionService.removeLocationOnLogin).toHaveBeenCalled()
    })

    it('should call removeLocationOnLogin()', () => {
      $ctrl.onSignInFailure('error')
      expect($ctrl.errorMessage).toEqual('error')
    })

    it('should call removeLocationOnLogin()', () => {
      $ctrl.onSignInFailure(undefined)
      expect($ctrl.errorMessage).toEqual(unknownErrorMessage)
    })
  })

  describe('redirectToLocationPriorToLogin()', () => {
    it('should update the message to the user', () => {
      $ctrl.$onInit()
      expect($ctrl.noticeToUser).toEqual('Authenticating...')
      $ctrl.redirectToLocationPriorToLogin()
      expect($ctrl.noticeToUser).toEqual('Redirecting to prior location...')
    })

    it('should redirect the user to prior page', () => {
      jest.spyOn($ctrl.sessionService, 'removeLocationOnLogin')
      jest.spyOn($ctrl.sessionService, 'getLocationOnLogin').mockReturnValue('https://give-stage2.cru.org/search-results.html')
      expect($ctrl.$window.location).toEqual('/okta-auth-callback.html')
      $ctrl.redirectToLocationPriorToLogin()
      expect($ctrl.$window.location).toEqual('https://give-stage2.cru.org/search-results.html')
      expect($ctrl.sessionService.removeLocationOnLogin).toHaveBeenCalled()
    })

    it('should redirect the user to checkout by default', () => {
      jest.spyOn($ctrl.sessionService, 'removeLocationOnLogin')
      jest.spyOn($ctrl.sessionService, 'getLocationOnLogin').mockReturnValue(undefined)
      expect($ctrl.$window.location).toEqual('/okta-auth-callback.html')
      $ctrl.redirectToLocationPriorToLogin()
      expect($ctrl.$window.location).toEqual('/checkout.html')
      expect($ctrl.sessionService.removeLocationOnLogin).not.toHaveBeenCalled()
    })
  })

  describe('onSignInSuccess', () => {
    let deferred, $rootScope
    beforeEach(inject((_$q_, _$rootScope_) => {
      deferred = _$q_.defer()
      $rootScope = _$rootScope_
      jest.spyOn($ctrl.sessionModalService, 'nonDismissibleRegisterAccount').mockReturnValue(deferred.promise)
      jest.spyOn($ctrl.sessionModalService, 'userMatch').mockReturnValue(deferred.promise)
      jest.spyOn($ctrl, 'redirectToLocationPriorToLogin')
    }))

    it('should error if no data', () => {
      jest.spyOn($ctrl, 'onSignInFailure')
      $ctrl.onSignInSuccess(undefined)
      expect($ctrl.onSignInFailure).toHaveBeenCalledWith(undefined)
      expect($ctrl.redirectToLocationPriorToLogin).not.toHaveBeenCalled()
    })

    it('should not fail if has data', () => {
      jest.spyOn($ctrl, 'onSignInFailure')
      jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({}))
      $ctrl.onSignInSuccess('data')
      expect($ctrl.onSignInFailure).not.toHaveBeenCalled()

      deferred.resolve()
      $rootScope.$digest()
      expect($ctrl.redirectToLocationPriorToLogin).toHaveBeenCalled()
    })

    it('opens the register account modal when the user is NEW', () => {
      jest.spyOn($ctrl, 'onSignInFailure')
      jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'registration-state': 'NEW' }))
      $ctrl.onSignInSuccess('data')
      expect($ctrl.sessionModalService.nonDismissibleRegisterAccount).toHaveBeenCalled()
      expect($ctrl.sessionModalService.userMatch).not.toHaveBeenCalled()

      deferred.resolve()
      $rootScope.$digest()
      expect($ctrl.redirectToLocationPriorToLogin).toHaveBeenCalled()
    })

    it('opens the user match modal when the user is MATCHED', () => {
      jest.spyOn($ctrl, 'onSignInFailure')
      jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'registration-state': 'MATCHED' }))
      $ctrl.onSignInSuccess('data')
      expect($ctrl.sessionModalService.nonDismissibleRegisterAccount).not.toHaveBeenCalled()
      expect($ctrl.sessionModalService.userMatch).toHaveBeenCalled()

        deferred.resolve()
      $rootScope.$digest()
      expect($ctrl.redirectToLocationPriorToLogin).toHaveBeenCalled()
    })

    it('does not open a modal and redirects user to prior page when the user is REGISTERED', () => {
      jest.spyOn($ctrl, 'onSignInFailure')
      jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'registration-state': 'REGISTERED' }))
      $ctrl.onSignInSuccess('data')
      expect($ctrl.sessionModalService.nonDismissibleRegisterAccount).not.toHaveBeenCalled()
      expect($ctrl.sessionModalService.userMatch).not.toHaveBeenCalled()

      deferred.resolve()
      $rootScope.$digest()
      expect($ctrl.redirectToLocationPriorToLogin).toHaveBeenCalled()
    })
  })
})
