import angular from 'angular'
import 'angular-mocks'
import module from './sessionHandleOktaRedirect.service'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import { LoginOktaOnlyEvent, Sessions } from 'common/services/session/session.service'
import { cortexRole } from 'common/services/session/fixtures/cortex-role'
import { giveSession } from 'common/services/session/fixtures/give-session'
import { cruProfile } from 'common/services/session/fixtures/cru-profile'


fdescribe('sessionHandleOktaRedirectService', function () {
  beforeEach(angular.mock.module(module.name))
  let sessionHandleOktaRedirectService,
    sessionEnforcerService,
    sessionService,
    orderService,
    deferred,
    $log,
    $rootScope,
    $cookies

  beforeEach(inject(function (_sessionHandleOktaRedirectService_, _sessionEnforcerService_, _sessionService_, _orderService_, _$q_, _$log_, _$rootScope_, _$cookies_) {
    sessionHandleOktaRedirectService = _sessionHandleOktaRedirectService_
    sessionEnforcerService = _sessionEnforcerService_
    sessionService = _sessionService_
    orderService = _orderService_
    $log = _$log_
    $rootScope = _$rootScope_
    $cookies = _$cookies_
    
    jest.spyOn(sessionService, 'updateCurrentProfile')
    jest.spyOn(sessionService, 'removeOktaRedirectIndicator')
    jest.spyOn($log, 'error')

    deferred = _$q_.defer()
  }))

  it('should be defined', () => {
    expect(sessionHandleOktaRedirectService).toBeDefined()
    expect(sessionEnforcerService).toBeDefined()
    expect(sessionService).toBeDefined()
  })

  describe('onHandleOktaRedirect()', () => {
    beforeEach(() => {
      $cookies.put(Sessions.role, cortexRole.registered)
      $cookies.put(Sessions.give, giveSession)
      $cookies.put(Sessions.profile, cruProfile)
      // Force digest so scope session watchers pick up changes.
      $rootScope.$digest()
      sessionService.removeOktaRedirectIndicator.mockClear()
      jest.spyOn($rootScope, '$broadcast')
    })

    it('should emit and log error when handleOktaRedirect errors', () => {
      jest.spyOn(sessionService, 'handleOktaRedirect').mockImplementation(() => Observable.throw('ERROR_MESSAGE'))
      
      try {
        sessionHandleOktaRedirectService.onHandleOktaRedirect()
      } catch {}

      expect($log.error).toHaveBeenCalledWith('Failed to redirect from Okta', 'ERROR_MESSAGE')
      sessionHandleOktaRedirectService.errorMessageSubject.subscribe((errorMessage) => {
        expect(errorMessage).toEqual('generic')
      })
    })

    it('should do nothing if no data is returned handleOktaRedirect', () => {
      jest.spyOn(sessionService, 'handleOktaRedirect').mockImplementation(() => Observable.of(Observable.of('')))

      sessionHandleOktaRedirectService.onHandleOktaRedirect()

      expect(sessionService.handleOktaRedirect).toHaveBeenCalled()
      expect($log.error).not.toHaveBeenCalled()
      expect(sessionService.removeOktaRedirectIndicator).not.toHaveBeenCalled()
      expect($rootScope.$broadcast).not.toHaveBeenCalled()
    })
    
    it('should not broadcast an event as the user already has an account', () => {
      jest.spyOn(sessionService, 'handleOktaRedirect').mockImplementation(() => Observable.of(Observable.of('success')))
      jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'registration-state': 'COMPLETED' }))

      sessionHandleOktaRedirectService.onHandleOktaRedirect()

      expect(sessionService.removeOktaRedirectIndicator).toHaveBeenCalled()
      expect($rootScope.$broadcast).not.toHaveBeenCalled()
    })
    
    it('should broadcast event to register when new user', () => {
      jest.spyOn(sessionService, 'handleOktaRedirect').mockImplementation(() => Observable.of(Observable.of('success')))
      jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'registration-state': 'NEW' }))

      sessionHandleOktaRedirectService.onHandleOktaRedirect()

      expect(sessionService.removeOktaRedirectIndicator).toHaveBeenCalled()
      expect(sessionService.updateCurrentProfile).toHaveBeenCalled()
      expect($rootScope.$broadcast).toHaveBeenCalledWith(LoginOktaOnlyEvent, 'register-account')
    })
  });
})
