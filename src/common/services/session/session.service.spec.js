import angular from 'angular'
import 'angular-mocks'
import module, { OktaStorage, Roles, Sessions, SignOutEvent, redirectingIndicator } from './session.service'
import { cortexRole } from 'common/services/session/fixtures/cortex-role'
import { giveSession } from 'common/services/session/fixtures/give-session'
import { cruProfile } from 'common/services/session/fixtures/cru-profile'
import { advanceBy, advanceTo, clear } from 'jest-date-mock'
import 'rxjs/add/observable/of'

/* global inject */

describe('session service', function () {
  beforeEach(angular.mock.module(function ($provide) {
    $provide.decorator('$timeout', function ($delegate) {
      const spy = jest.fn($delegate)
      spy.cancel = $delegate.cancel
      spy.flush = $delegate.flush
      spy.verifyNoPendingTasks = $delegate.verifyNoPendingTasks
      return spy
    })

    $provide.decorator('$window', function ($delegate) {
      const spy = jest.fn($delegate)
      spy.localStorage = { clear: jest.fn() }
      spy.sessionStorage = $delegate.sessionStorage
      spy.document = $delegate.document
      return spy
    })
  }))

  beforeEach(angular.mock.module(module.name))
  let sessionService, $httpBackend, $cookies, $rootScope, $verifyNoPendingTasks, $window, envService

  beforeEach(inject(function (_sessionService_, _$httpBackend_, _$cookies_, _$rootScope_, _$verifyNoPendingTasks_, _$window_, _envService_) {
    sessionService = _sessionService_
    $httpBackend = _$httpBackend_
    $cookies = _$cookies_
    $rootScope = _$rootScope_
    $verifyNoPendingTasks = _$verifyNoPendingTasks_
    $window = _$window_
    envService = _envService_
  }))

  afterEach(() => {
    [Sessions.role, Sessions.give, Sessions.profile].forEach((name) => {
      $cookies.remove(name)
    })
  })

  it('to be defined', () => {
    expect(sessionService).toBeDefined()
  })

  describe('session', () => {
    it('to be defined', () => {
      expect(sessionService.session).toBeDefined()
    })

    describe('session with \'REGISTERED\' cortex-session', () => {
      beforeEach(() => {
        $cookies.put(Sessions.role, cortexRole.registered)
        $cookies.put(Sessions.profile, cruProfile)
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest()
      })

      it('have properties', () => {
        expect(sessionService.session).toEqual({
          sub: 'cas|873f88fa-327b-b95d-7d7a-7add211a9b64',
          role: 'REGISTERED',
          first_name: 'Charles',
          last_name: 'Xavier',
          email: 'professorx@xavier.edu'
        })
      })

      describe('change to \'IDENTIFIED\' cortex-session', () => {
        beforeEach(() => {
          $cookies.put(Sessions.role, cortexRole.identified)
          // Force digest so scope session watchers pick up changes.
          $rootScope.$digest()
        })

        it('reflects changes', () => {
          expect(sessionService.session).toEqual({
            sub: 'cas|873f88fa-327b-b95d-7d7a-7add211a9b64',
            role: 'IDENTIFIED',
            first_name: 'Charles',
            last_name: 'Xavier',
            email: 'professorx@xavier.edu'
          })
        })
      })
    })
  })

  describe('sessionSubject', () => {
    it('to be defined', () => {
      expect(sessionService.sessionSubject).toBeDefined()
    })
  })

  describe('getRole', () => {
    it('to be defined', () => {
      expect(sessionService.getRole).toBeDefined()
    })

    it('returns \'PUBLIC\' if no session exists', () => {
      expect(sessionService.getRole()).toEqual(Roles.public)
    })

    describe('with \'PUBLIC\' cortex-session', () => {
      beforeEach(() => {
        $cookies.put(Sessions.role, cortexRole.public)
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest()
      })

      it('returns \'PUBLIC\'', () => {
        expect(sessionService.getRole()).toEqual(Roles.public)
      })
    })

    describe('with \'IDENTIFIED\' cortex-session', () => {
      beforeEach(() => {
        $cookies.put(Sessions.role, cortexRole.identified)
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest()
      })

      it('returns \'IDENTIFIED\'', () => {
        expect(sessionService.getRole()).toEqual(Roles.identified)
      })
    })

    describe('getRole with \'REGISTERED\' cortex-session', () => {
      beforeEach(() => {
        $cookies.put(Sessions.role, cortexRole.registered)
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest()
      })

      it('returns \'IDENTIFIED\' with expired give-session', () => {
        expect(sessionService.getRole()).toEqual(Roles.identified)
      })

      describe('with \'REGISTERED\' give-session', () => {
        beforeEach(() => {
          $cookies.put(Sessions.give, giveSession)
          // Force digest so scope session watchers pick up changes.
          $rootScope.$digest()
        })

        it('returns \'REGISTERED\'', () => {
          expect(sessionService.getRole()).toEqual(Roles.registered)
        })
      })
    })
  })

  describe('signIn', () => {
    it('makes http request to cas/login without mfa', () => {
      $httpBackend.expectPOST('https://give-stage2.cru.org/cas/login', {
        username: 'user@example.com',
        password: 'hello123'
      }).respond(200, 'success')
      sessionService
        .signIn('user@example.com', 'hello123')
        .subscribe((data) => {
          expect(data).toEqual('success')
        })
      $httpBackend.flush()
    })

    it('makes http request to cas/login with mfa', () => {
      $httpBackend.expectPOST('https://give-stage2.cru.org/cas/login', {
        username: 'user@example.com',
        password: 'hello123',
        mfa_token: '123456'
      }).respond(200, 'success')
      sessionService
        .signIn('user@example.com', 'hello123', '123456')
        .subscribe((data) => {
          expect(data).toEqual('success')
        })
      $httpBackend.flush()
    })

    it('makes http request to cas/login with mfa and trust_device', () => {
      $httpBackend.expectPOST('https://give-stage2.cru.org/cas/login', {
        username: 'user@example.com',
        password: 'hello123',
        mfa_token: '123456',
        trust_device: '1'
      }).respond(200, 'success')
      sessionService
        .signIn('user@example.com', 'hello123', '123456', true)
        .subscribe((data) => {
          expect(data).toEqual('success')
        })
      $httpBackend.flush()
    })

    it('includes lastPurchaseId when present and PUBLIC', () => {
      jest.spyOn(sessionService, 'getRole').mockReturnValue(Roles.public)
      $httpBackend.expectPOST('https://give-stage2.cru.org/cas/login', {
        username: 'user@example.com',
        password: 'hello123',
        lastPurchaseId: 'gxbcdviu='
      }).respond(200, 'success')
      sessionService
        .signIn('user@example.com', 'hello123', undefined, undefined, 'gxbcdviu=')
        .subscribe((data) => {
          expect(data).toEqual('success')
        })
      $httpBackend.flush()
    })
  })

  describe('signUp', () => {
    it('makes http request to cas/register', () => {
      $httpBackend.expectPOST('https://give-stage2.cru.org/cas/register', {
        email: 'professorx@xavier.edu',
        password: 'Cerebro123',
        firstName: 'Charles',
        lastName: 'Xavier'
      }).respond(200, {})
      sessionService
        .signUp('professorx@xavier.edu', 'Cerebro123', 'Charles', 'Xavier')
        .subscribe((data) => {
          expect(data).toEqual({})
        })
      $httpBackend.flush()
    })
  })

  describe('signOut', () => {
    it('makes http request to cas/logout', () => {
      $httpBackend.expectDELETE('https://give-stage2.cru.org/cas/logout')
        .respond(200, {})
      sessionService
        .signOut()
        .subscribe((response) => {
          expect(response.data).toEqual({})
        })
      $httpBackend.flush()
    })
  })

  describe('oktaSignOut', () => {
    it('makes an http request to okta/logout', () => {
      $httpBackend.expectDELETE('https://give-stage2.cru.org/okta/logout')
        .respond(200, {})
      sessionService
        .oktaSignOut()
        .subscribe((response) => {
          expect(response.data).toEqual({})
        })
      $httpBackend.flush()
    })

    it('should clear extra storage', () => {
      $cookies.put(OktaStorage.state, 'a')
      $cookies.put(OktaStorage.nonce, 'b')
      $cookies.put(OktaStorage.redirectParams, 'c')
      expect($cookies.get(OktaStorage.state)).toEqual('a')
      expect($cookies.get(OktaStorage.nonce)).toEqual('b')
      expect($cookies.get(OktaStorage.redirectParams)).toEqual('c')
      sessionService
        .oktaSignOut()
        .subscribe(() => {
          expect($window.localStorage.clear).toHaveBeenCalled()
          expect($cookies.get(OktaStorage.state)).not.toBeDefined()
          expect($cookies.get(OktaStorage.nonce)).not.toBeDefined()
          expect($cookies.get(OktaStorage.redirectParams)).not.toBeDefined()
        })
    })
  })

  describe('handleOktaRedirect', () => {
    it('should handle a successful login', done => {
      sessionService.authClient.shouldSucceed()
      sessionService.authClient.setupForRedirect()

      $httpBackend.expectPOST('https://give-stage2.cru.org/okta/login', {
        access_token: 'wee'
      }).respond(200, 'success')
      sessionService.handleOktaRedirect().toPromise().then(() => {
        $httpBackend.flush()
        done()
      })
    })

    it('should pass along lastPurchaseId', done => {
      sessionService.authClient.shouldSucceed()
      sessionService.authClient.setupForRedirect()

      $httpBackend.expectPOST('https://give-stage2.cru.org/okta/login', {
        access_token: 'wee',
        lastPurchaseId: 'gxbcdviu='
      }).respond(200, 'success')

      sessionService.handleOktaRedirect('gxbcdviu=').toPromise().then(() => {
        $httpBackend.flush()
        done()
      })
    })

    it('should handle a failed login', done => {
      sessionService.authClient.shouldFail()
      sessionService.authClient.setupForRedirect()
      sessionService.handleOktaRedirect().subscribe(() => {
        fail()
      }, error => {
        expect(error).toBeDefined()
        done()
      })
    })

    it('should redirect to Okta if the login has not yet happened', done => {
      sessionService.authClient.setLoginRedirect(true)
      sessionService.authClient.setAuthenticated(false)
      sessionService.authClient.shouldSucceed()
      sessionService.handleOktaRedirect().subscribe(() => {
        expect(sessionService.authClient.token.getWithRedirect).toHaveBeenCalled()
        done()
      })
    })

    it('should ignore a non-login attempt', done => {
      sessionService.authClient.setLoginRedirect(false)
      sessionService.handleOktaRedirect().subscribe((data) => {
        expect(sessionService.authClient.token.parseFromUrl).not.toHaveBeenCalled()
        expect(data).toEqual(false)
        done()
      })

    })
  })

  describe('getOktaUrl', () => {
    it('should return the oktaUrl from the environment', () => {
      expect(sessionService.getOktaUrl()).toEqual(envService.read('oktaUrl'))
    })
  })

  describe('removeOktaRedirectIndicator', () => {
    it('should remove the Okta redirect session storage variable', () => {
      $window.sessionStorage.setItem(redirectingIndicator, 'true')
      sessionService.removeOktaRedirectIndicator()
      expect($window.sessionStorage.getItem(redirectingIndicator)).toEqual(null)
    })
  })

  describe('isOktaRedirecting', () => {
    it('should be true if the session storage variable is set', () => {
      $window.sessionStorage.setItem(redirectingIndicator, 'true')
      expect(sessionService.isOktaRedirecting()).toBeTruthy()
    })

    it('should be false if the session storage variable is not set', () => {
      $window.sessionStorage.removeItem(redirectingIndicator)
      expect(sessionService.isOktaRedirecting()).toBeFalsy()
    })
  })

  describe('downgradeToGuest( skipEvent )', () => {
    beforeEach(() => {
      jest.spyOn($rootScope, '$broadcast').mockImplementation(() => {})
    })

    describe('with \'PUBLIC\' role', () => {
      it('throws error', () => {
        sessionService.downgradeToGuest().subscribe(angular.noop, (error) => {
          expect(error).toBeDefined()
        })

        expect($rootScope.$broadcast).toHaveBeenCalledWith(SignOutEvent)
      })
    })

    describe('with \'IDENTIFIED\' role', () => {
      beforeEach(() => {
        $cookies.put(Sessions.role, cortexRole.identified)
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest()
      })

      it('make http request to cas/downgrade', (done) => {
        $httpBackend.expectPOST('https://give-stage2.cru.org/okta/downgrade', {}).respond(204, {})
        sessionService.downgradeToGuest().subscribe((data) => {
          expect(data).toEqual({})
        })
        $rootScope.$digest()
        // Observable.finally is fired after the test, this defers until it's called.
        // eslint-disable-next-line angular/timeout-service
        setTimeout(() => {
          expect($rootScope.$broadcast).toHaveBeenCalledWith(SignOutEvent)
          done()
        })
        $httpBackend.flush()
      })
    })

    describe('with skipEvent = true', () => {
      beforeEach(() => {
        $cookies.put(Sessions.role, cortexRole.identified)
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest()
      })

      it('make http request to cas/downgrade', (done) => {
        $httpBackend.expectPOST('https://give-stage2.cru.org/okta/downgrade', {}).respond(204, {})
        sessionService.downgradeToGuest(true).subscribe((data) => {
          expect(data).toEqual({})
        })
        $rootScope.$digest()
        // Observable.finally is fired after the test, this defers until it's called.
        // eslint-disable-next-line angular/timeout-service
        setTimeout(() => {
          expect($rootScope.$broadcast).not.toHaveBeenCalled()
          done()
        })
        $httpBackend.flush()
      })
    })
  })

  describe('session expiration', () => {
    let $timeout
    beforeEach(inject((_$timeout_) => {
      $timeout = _$timeout_
      $timeout.mockClear()
      advanceTo(new Date(2016, 1, 1))
    }))

    afterEach(() => {
      clear()
      $verifyNoPendingTasks('$timeout)')
    })

    describe('undefined \'give-session\'', () => {
      beforeEach(() => {
        $cookies.put(Sessions.role, cortexRole.registered)
        $rootScope.$digest()
      })

      it('does not set sessionTimeout', () => {
        expect($timeout).not.toHaveBeenCalled()
      })
    })

    describe('\'give-session\' with 10 seconds until expiration', () => {
      beforeEach(() => {
        // Encode cookie as JWT
        $cookies.put(Sessions.give, '.' + btoa(angular.toJson({
          exp: Math.round(Date.now() / 1000) + 10
        })) + '.')
        $cookies.put(Sessions.role, cortexRole.registered)
        $rootScope.$digest()
      })

      it('sets sessionTimeout', () => {
        expect($timeout).toHaveBeenCalledWith(10000)
        advanceBy(10001)
        $timeout.flush(10001)

        expect($timeout).toHaveBeenCalledTimes(1)
      })
    })

    describe('\'give-session\' with 45 seconds until expiration', () => {
      beforeEach(() => {
        // Encode cookie as JWT
        $cookies.put(Sessions.give, '.' + btoa(angular.toJson({
          exp: Math.round(Date.now() / 1000) + 45
        })) + '.')
        $cookies.put(Sessions.role, cortexRole.registered)
        $rootScope.$digest()
      })

      it('sets sessionTimeout twice', () => {
        expect($timeout).toHaveBeenCalledWith(30000)
        advanceBy(30001)
        $timeout.flush(30001)

        expect($timeout).toHaveBeenCalledWith(14999)
        advanceBy(15000)
        $timeout.flush(15000)

        expect($timeout).toHaveBeenCalledTimes(2)
      })

      describe('\'cortex-session\' updated', () => {
        beforeEach(() => {
          jest.spyOn($timeout, 'cancel')
          $timeout.flush(10000)
          $cookies.put(Sessions.role, cortexRole.identified)
          $rootScope.$digest()
        })

        it('cancels existing sessionTimeout', () => {
          expect($timeout.cancel).toHaveBeenCalled()
          advanceBy(90000)
          $timeout.flush(90000)

          expect($timeout).toHaveBeenCalledTimes(2)
        })
      })
    })
  })
})
