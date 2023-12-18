import angular from 'angular'
import 'angular-mocks'
import module, { Roles, Sessions, SignOutEvent, redirectingIndicator, checkoutSavedDataCookieName } from './session.service'
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
      spy.localStorage = $delegate.localStorage
      spy.sessionStorage = $delegate.sessionStorage
      spy.document = $delegate.document
      spy.location = {search: '?ga=111111&query=test&anotherQuery=00000'}
      return spy
    })
  }))

  beforeEach(angular.mock.module(module.name))
  let sessionService, $httpBackend, $cookies, $rootScope, $verifyNoPendingTasks, $window, $location, envService

  beforeEach(inject(function (_sessionService_, _$httpBackend_, _$cookies_, _$rootScope_, _$verifyNoPendingTasks_, _$window_, _$location_, _envService_) {
    sessionService = _sessionService_
    $httpBackend = _$httpBackend_
    $cookies = _$cookies_
    $rootScope = _$rootScope_
    $verifyNoPendingTasks = _$verifyNoPendingTasks_
    $window = _$window_
    $location = _$location_
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
        $cookies.put(Sessions.profile, cruProfile)
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest()
      })

      it('returns \'IDENTIFIED\'', () => {
        expect(sessionService.getRole()).toEqual(Roles.identified)
      })
    })

    describe('with \'REGISTERED\' cortex-session', () => {
      beforeEach(() => {
        $cookies.put(Sessions.role, cortexRole.registered)
        $cookies.put(Sessions.profile, cruProfile)
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest()
      })

      it('returns \'IDENTIFIED\' with expired give-session', () => {
        expect(sessionService.getRole()).toEqual(Roles.identified)
      })

      it('returns \'PUBLIC\' with expired cru-profile', () => {
        $cookies.remove(Sessions.profile)
        expect(sessionService.getRole()).toEqual(Roles.public)
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


  describe('oktaSignOut', () => {
    beforeEach(() => {
      jest.spyOn(sessionService.authClient, 'revokeAccessToken')
      jest.spyOn(sessionService.authClient, 'revokeRefreshToken')
      jest.spyOn(sessionService.authClient, 'closeSession')
      jest.spyOn(sessionService.authClient, 'signOut')
    })

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

    it('should revoke tokens & log user out of Okta', () => {
      sessionService
        .oktaSignOut()
        .subscribe(() => {
          expect(sessionService.authClient.revokeAccessToken).toHaveBeenCalled()
          expect(sessionService.authClient.revokeRefreshToken).toHaveBeenCalled()
          expect(sessionService.authClient.closeSession).toHaveBeenCalled()
          expect(sessionService.authClient.signOut).toHaveBeenCalled()
          expect($window.location).toEqual(`cart.html`)
        })
    });

    it('should revoke tokens log user out of Okta', () => {
      jest.spyOn(sessionService.authClient, 'revokeAccessToken').mockImplementationOnce(() => Promise.reject())
      try {
        sessionService
        .oktaSignOut()
        .subscribe(() => {
          expect(sessionService.authClient.revokeAccessToken).toHaveBeenCalled()
          expect(sessionService.authClient.revokeRefreshToken).not.toHaveBeenCalled()
          expect(sessionService.authClient.closeSession).not.toHaveBeenCalled()
          expect(sessionService.authClient.signOut).not.toHaveBeenCalled()
        })
      } catch {
        expect($window.location).toEqual(`https://signon.okta.com/login/signout?fromURI=${envService.read('oktaReferrer')}`)
      }
    });
  })

  describe('oktaSignIn & handleOktaRedirect', () => {
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

    it('should remove locationSearchOnLogin when returning from Okta a successful login', done => {
      sessionService.authClient.shouldSucceed()
      sessionService.authClient.setupForRedirect()
      jest.spyOn($location, 'search')
      
      $window.sessionStorage.setItem('locationSearchOnLogin', '?ga=111111&query=test&anotherQuery=00000')

      $httpBackend.expectPOST('https://give-stage2.cru.org/okta/login', {
        access_token: 'wee'
      }).respond(200, 'success')
      sessionService.handleOktaRedirect().toPromise().then(() => {
        expect($window.sessionStorage.getItem('locationSearchOnLogin')).toEqual(null)
        expect($location.search).toHaveBeenCalledTimes(3)
        expect($location.search).toHaveBeenNthCalledWith(1, 'ga', '111111')
        expect($location.search).toHaveBeenNthCalledWith(2, 'query', 'test')
        expect($location.search).toHaveBeenNthCalledWith(3, 'anotherQuery', '00000')
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
        expect($window.sessionStorage.getItem('locationSearchOnLogin')).toEqual('?ga=111111&query=test&anotherQuery=00000')
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
      jest.spyOn($rootScope, '$broadcast')
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
        $cookies.put(Sessions.profile, cruProfile)
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
        $cookies.put(Sessions.profile, cruProfile)
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
          expect($rootScope.$broadcast).not.toHaveBeenCalledWith(SignOutEvent)
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
  describe('createAccount()', () => {
    const getUser = jest.fn(() => ({
      email: 'email@cru.org',
    }));

    beforeEach(() => {
      sessionService.authClient.getUser = getUser;
      getUser.mockClear();
    })

    describe('Already Logged in', () => {

      it('returns as user is already authenicated by Okta', () => {
        jest.spyOn(sessionService.authClient, 'isAuthenticated').mockReturnValue(true)
        sessionService.createAccount('test@test@test.com', 'FirstName', 'LastName').then((data) => {
          expect(getUser).toHaveBeenCalled();
          expect(data).toEqual({
            data: [
              "Already logged in to Okta with email: email@cru.org. You will be redirected to the Sign In page in a few seconds.",
              "Another Error"
            ],
            redirectToSignIn: true,
            status: "error"
          })
        })
      })
      it('returns as user is already authenicated by Cortex', () => {
        jest.spyOn(sessionService.authClient, 'isAuthenticated').mockReturnValue(false)
        sessionService.authClient.getUser = undefined;
        $cookies.put(Sessions.role, cortexRole.registered)
        $cookies.put(Sessions.profile, cruProfile)
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest()
        expect(sessionService.getRole()).toEqual(Roles.identified)

        sessionService.createAccount('test@test@test.com', 'FirstName', 'LastName').then((data) => {
          expect(data).toEqual({
            data: [
              "Already logged in to Okta. You will be redirected to the Sign In page in a few seconds.",
              "Another Error"
            ],
            redirectToSignIn: true,
            status: "error"
          })
        })
      })
    })
    describe('User is logged out', () => {

      it('returns as user is already authenticated by Cortex', () => {
        $httpBackend.expectPOST('https://give-stage2.cru.org/okta/create', {
          email: 'test@test@test.com',
          first_name: 'FirstName',
          last_name: 'LastName'
        }).respond(500, {
            "error": "Okta user creation failed: [{:errorCode=>\"E0000001\",\n :errorSummary=>\"Api validation failed: login\",\n :errorLink=>\"E0000001\",\n :errorId=>\"oaeTHQQui71RxKf-kpCQHRr4Q\",\n :errorCauses=>\n  [{:errorSummary=>\"login: Username must be in the form of an email address\"},\n   {:errorSummary=>\"email: Does not match required pattern\"}]}\n, 400]"
        })
        sessionService.createAccount('test@test@test.com', 'FirstName', 'LastName').then((data) => {
          expect(data.data).toBeDefined()
          expect(data.data[0]).toEqual('login: Username must be in the form of an email address')
          expect(data.data[1]).toEqual('There was an error saving your email address. Make sure it was entered correctly.')
        })
      })

      it('returns as user is already authenticated by Cortex', () => {
        $httpBackend.expectPOST('https://give-stage2.cru.org/okta/create', {
          email: 'test@test@test.com',
          first_name: 'FirstName',
          last_name: 'LastName'
        }).respond(200, {
          data: {
            error: 'Error ajdjsdjl'
          }
        })
        sessionService.createAccount('test@test@test.com', 'FirstName', 'LastName').then((data) => {
          expect(data).toBeDefined()
        })
      })

      

      afterEach(() => {
        $httpBackend.flush()
        $httpBackend.verifyNoOutstandingExpectation()
        $httpBackend.verifyNoOutstandingRequest()
      })
    })
  });

  describe('checkCreateAccountStatus() with correct data', () => {
    it('returns as OKTA user status', () => {

      $httpBackend.expectGET('https://give-stage2.cru.org/okta/status?email=test-test%40test.com').respond(200, {
        activated: '2023-08-28T14:35:00.000Z',
        password_changed: null,
        status: 'PROVISIONED'
      })
      
      sessionService.checkCreateAccountStatus('test-test@test.com').then((data) => {
        expect(data.status).toEqual('success')
        expect(data.data.status).toEqual('PROVISIONED')
      })
    })

    it('returns as error when fetching OKTA user status', () => {

      $httpBackend.expectGET('https://give-stage2.cru.org/okta/status?email=test-test%40test.com').respond(404, {
        error: 'Email is not an Okta user'
      })
      
      sessionService.checkCreateAccountStatus('test-test@test.com').then((data) => {
        expect(data.status).toEqual('error')
        expect(data.data).toEqual('Email is not an Okta user')
      })
    })

    afterEach(() => {
      $httpBackend.flush()
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()
    })
  })

  describe('updateCurrentProfile', () => {
    it('updates the first and last name if the cookie is defined', () => {
      const cruProfileCookie = {
        first_name: 'Test',
        last_name: 'Tester'
      }
      expect(sessionService.session.first_name).not.toBeDefined()
      expect(sessionService.session.last_name).not.toBeDefined()

      // Encode as JWT
      $cookies.put(Sessions.profile, `.${btoa(angular.toJson(cruProfileCookie))}.`)
      sessionService.updateCurrentProfile()
      expect(sessionService.session.first_name).toEqual(cruProfileCookie.first_name)
      expect(sessionService.session.last_name).toEqual(cruProfileCookie.last_name)
    })

    it('does not set profile values if the cookie is not defined', () => {
      expect(sessionService.session.first_name).not.toBeDefined()
      expect(sessionService.session.last_name).not.toBeDefined()

      const cruProfile = sessionService.updateCurrentProfile()
      expect(cruProfile).toEqual({})
      expect(sessionService.session.first_name).not.toBeDefined()
      expect(sessionService.session.last_name).not.toBeDefined()
    })
  })

  const checkoutData = {
    phone: '(111) 111-1111',
    name: {
      firstName: 'Tester',
      lastName: 'Last name',
    },
    'spouse-name': {
      firstName: 'Spouse',
      lastName: 'Last name',
    }
  }



  describe('CheckoutSavedData', () => {
    describe('updateCheckoutSavedData', () => {
      it('saves the checkout data to a cookie', () => {
        // isTest set to TRUE
        sessionService.updateCheckoutSavedData(checkoutData, true)
        expect(sessionService.session.checkoutSavedData).toBeDefined()
        const dataStoredInLocalStoarage = $cookies.get(checkoutSavedDataCookieName)
        expect(dataStoredInLocalStoarage).toEqual(JSON.stringify(checkoutData))
      })
      it('copies checkout data cookie and stores it on session', () => {
        delete sessionService.session.checkoutSavedData;
        expect(sessionService.session.checkoutSavedData).not.toBeDefined()
        sessionService.updateCheckoutSavedData()
        expect(sessionService.session.checkoutSavedData).toBeDefined()
      })
    })

    describe('clearCheckoutSavedData', () => {
      it('removes the cookie and data on session', () => {
        const dataStoredInLocalStoarage = $cookies.get(checkoutSavedDataCookieName)
        expect(dataStoredInLocalStoarage).toEqual(JSON.stringify(checkoutData))
        // isTest set to TRUE
        sessionService.clearCheckoutSavedData(true)
        const dataAfterClear = $cookies.get(checkoutSavedDataCookieName)
        expect(dataAfterClear).toEqual(undefined)
      })
    })
  })
})
