import angular from 'angular'
import 'angular-mocks'
import module, { Roles, Sessions, SignOutEvent, SignInEvent, redirectingIndicator, checkoutSavedDataCookieName, locationOnLogin, locationSearchOnLogin, createAccountDataCookieName, forcedUserToLogout } from './session.service'
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
      spy.location = {
        search: '?ga=111111&query=test&anotherQuery=00000',
        href: 'https://URL.org?utm_source=text'
      }
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

  describe('oktaIsUserAuthenticated()', () => {
    it('returns false', () => {
      jest.spyOn(sessionService.authClient, 'isAuthenticated').mockImplementationOnce(() => Promise.resolve(false))
      sessionService.oktaIsUserAuthenticated().subscribe((data) => {
        expect(data).toEqual(false)
      })
    })
    it('returns true', () => {
      jest.spyOn(sessionService.authClient, 'isAuthenticated').mockImplementationOnce(() => Promise.resolve(true))
      sessionService.oktaIsUserAuthenticated().subscribe((data) => {
        expect(data).toEqual(true)
      })
    })
  })

  describe('signOut()', () => {
    beforeEach(() => {
      jest.spyOn(sessionService.authClient, 'revokeAccessToken')
      jest.spyOn(sessionService.authClient, 'revokeRefreshToken')
      jest.spyOn(sessionService.authClient, 'signOut')
     
      $window.sessionStorage.removeItem(forcedUserToLogout)
    })

    describe('Successful cortex logout', () => {
      beforeEach(() => {
        $httpBackend.expectDELETE('https://give-stage2.cru.org/okta/logout')
        .respond(200, {})
      })

      it('makes a DELETE request to Cortex & sets postLogoutRedirectUri', () => {
        jest.spyOn(sessionService.authClient, 'signOut').mockImplementationOnce(() => Promise.resolve({
          data: {}
        }))
        sessionService
          .signOut(false)
          .subscribe((response) => {
            expect(response.data).toEqual({})
            expect(sessionService.authClient.signOut).toHaveBeenCalledWith({
              postLogoutRedirectUri: `https://localhost.cru.org:9000/sign-out.html`
            })
          })
      })

      it('should revoke all tokens & run signOut returning the user home', () => {
        sessionService
          .signOut(true)
          .subscribe(() => {
            expect(sessionService.authClient.revokeAccessToken).toHaveBeenCalled()
            expect(sessionService.authClient.revokeRefreshToken).toHaveBeenCalled()
            expect(sessionService.authClient.signOut).toHaveBeenCalledWith({
              postLogoutRedirectUri: null
            })
          })
      })

      it('should still sign user out if error during signout', () => {
        jest.spyOn(sessionService.authClient, 'signOut').mockRejectedValueOnce()
        sessionService
        .signOut()
        .subscribe(() => {
          expect(sessionService.authClient.revokeAccessToken).toHaveBeenCalled()
          expect(sessionService.authClient.revokeRefreshToken).toHaveBeenCalled()
          expect(sessionService.authClient.signOut).toHaveBeenCalled()
        })
      })

      it('should add forcedUserToLogout session data', () => {
        sessionService
        .signOut(false)
        .subscribe(() => {
          expect($window.sessionStorage.getItem(forcedUserToLogout)).toEqual('true')
        })
      })
    })

    describe('Failed cortex logout', () => {
      beforeEach(() => {
        $httpBackend.expectDELETE('https://give-stage2.cru.org/okta/logout')
        .respond(200, {})
      })

      it('should add forcedUserToLogout if error', () => {
        sessionService
        .signOut(false)
        .subscribe(() => {
          expect($window.sessionStorage.getItem(forcedUserToLogout)).toEqual('true')
        })
      })

      it('should redirect the user to okta if all else fails', () => {
        jest.spyOn(sessionService.authClient, 'signOut').mockRejectedValue()
        sessionService
        .signOut()
        .subscribe(() => {
          expect($window.location.href).toEqual(`${envService.read('oktaUrl')}/login/signout?fromURI=${envService.read('oktaReferrer')}`)
        })
      })
    })    

    afterEach(() => {
      $httpBackend.flush()
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()
    })
  })

  describe('signIn() & handleOktaRedirect()', () => {
    beforeEach(() => {
      $window.sessionStorage.removeItem(locationSearchOnLogin)
      $window.sessionStorage.removeItem(locationOnLogin)
    })

    it('should return SignInEvent broadcast', done => {
      jest.spyOn($rootScope, '$broadcast')
      jest.spyOn(sessionService.authClient, 'isAuthenticated').mockResolvedValueOnce(false)
      jest.spyOn(sessionService.authClient.tokenManager, 'getTokens').mockResolvedValueOnce({
        accessToken: {
          accessToken: 'accessToken'
        }
      })
      jest.spyOn(sessionService.authClient.token, 'getWithRedirect').mockResolvedValue(true)

      sessionService.signIn('lastPurchaseId-SignInEvent').subscribe();

      // Observable.finally is fired after the test, this defers until it's called.
      // eslint-disable-next-line angular/timeout-service
      setTimeout(() => {
        expect($rootScope.$broadcast).toHaveBeenCalledWith(SignInEvent)
        done()
      })
    })

    it('should handle a failed login', done => {
      jest.spyOn(sessionService.authClient, 'isAuthenticated').mockResolvedValueOnce(false)
      jest.spyOn(sessionService.authClient, 'isLoginRedirect').mockResolvedValueOnce(true)
      jest.spyOn(sessionService.authClient.token, 'parseFromUrl').mockResolvedValue({})

      sessionService.handleOktaRedirect().subscribe(() => {
        fail()
      }, error => {
        expect(error).toBeDefined()
        done()
      })
    })


    it('should ignore a non-login attempt', done => {
      jest.spyOn(sessionService.authClient, 'isAuthenticated').mockResolvedValueOnce(false)
      jest.spyOn(sessionService.authClient.token, 'parseFromUrl').mockResolvedValue({})
      sessionService.handleOktaRedirect().subscribe((data) => {
        expect(sessionService.authClient.token.parseFromUrl).not.toHaveBeenCalled()
        expect(data).toEqual(false)
        done()
      })
    })

    describe('successful handleOktaRedirect()', () => {
      const accessToken = 'accessToken'
      let isAuthenticatedSpy
      beforeEach(() => {
        isAuthenticatedSpy = jest.spyOn(sessionService.authClient, 'isAuthenticated')
        isAuthenticatedSpy.mockResolvedValue(true)
        jest.spyOn(sessionService.authClient, 'isLoginRedirect').mockResolvedValueOnce(true)
        jest.spyOn(sessionService.authClient.token, 'parseFromUrl').mockResolvedValue({
          tokens: {
            idToken: 'mock-id-token',
            accessToken,
          }
        })
        jest.spyOn(sessionService.authClient.tokenManager, 'setTokens').mockResolvedValue(true)
        jest.spyOn(sessionService.authClient.tokenManager, 'getTokens').mockResolvedValueOnce({
          accessToken: {
            accessToken
          }
        })
        jest.spyOn(sessionService.authClient.token, 'getWithRedirect').mockResolvedValue(true)
      });


      it('should handle a successful login', done => {
        $httpBackend.expectPOST('https://give-stage2.cru.org/okta/login', {
          access_token: accessToken
        }).respond(200, 'success')
  
        sessionService.handleOktaRedirect().subscribe();
  
        setTimeout(() => {
          $httpBackend.flush()
          done()
        })
      })

      it('should remove locationSearchOnLogin when returning from Okta a successful login', done => {
        jest.spyOn($location, 'search')
        
        $window.sessionStorage.setItem('locationSearchOnLogin', '?ga=111111&query=test&anotherQuery=00000')
  
        $httpBackend.expectPOST('https://give-stage2.cru.org/okta/login', {
          access_token: accessToken
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
        $httpBackend.expectPOST('https://give-stage2.cru.org/okta/login', {
          access_token: accessToken,
          lastPurchaseId: 'gxbcdviu='
        }).respond(200, 'success')
  
        sessionService.handleOktaRedirect('gxbcdviu=').toPromise().then(() => {
          $httpBackend.flush()
          done()
        })
      })

      it('should redirect to Okta from the login screen if the login has not yet happened', done => {
        jest.spyOn($location, 'path').mockReturnValue('/sign-in.html')
        isAuthenticatedSpy.mockResolvedValue(false)
  
        sessionService.handleOktaRedirect().subscribe(() => {
          expect(sessionService.authClient.token.getWithRedirect).toHaveBeenCalled()
          expect($window.sessionStorage.getItem(locationSearchOnLogin)).toEqual('?ga=111111&query=test&anotherQuery=00000')
          expect($window.sessionStorage.getItem(locationOnLogin)).toEqual(null)
          done()
        })
      })

      it('should redirect to Okta from page other than login if the login has not yet happened', done => {
        jest.spyOn($location, 'path').mockReturnValue('/search-results.html')
        isAuthenticatedSpy.mockResolvedValueOnce(false)
  
        sessionService.handleOktaRedirect().subscribe(() => {
          expect(sessionService.authClient.token.getWithRedirect).toHaveBeenCalled()
          expect($window.sessionStorage.getItem(locationSearchOnLogin)).toEqual(null)
          expect($window.sessionStorage.getItem(locationOnLogin)).toEqual('https://URL.org?utm_source=text')
          done()
        })
      })
    });
  })

  describe('getOktaUrl', () => {
    it('should return the oktaUrl from the environment', () => {
      expect(sessionService.getOktaUrl()).toEqual(envService.read('oktaUrl'))
    })
  })

  describe('removeOktaRedirectIndicator', () => {
    it('should remove the Okta redirect session storage variable', () => {
      sessionService.session.isOktaRedirecting = true
      sessionService.removeOktaRedirectIndicator()
      expect(sessionService.session.isOktaRedirecting).toEqual(false)
    })
  })

  describe('isOktaRedirecting', () => {
    it('should be true if the session variable is set', () => {
      sessionService.session.isOktaRedirecting = true
      expect(sessionService.isOktaRedirecting()).toBeTruthy()
    })

    it('should be false if the session variable is not set', () => {
      delete sessionService.session.isOktaRedirecting
      expect(sessionService.isOktaRedirecting()).toBeFalsy()
    })
  })

  describe('signOutWithoutRedirectToOkta()', () => {
    beforeEach(() => {
      jest.spyOn($rootScope, '$broadcast')
      jest.spyOn(sessionService.authClient, 'revokeAccessToken')
      jest.spyOn(sessionService.authClient, 'revokeRefreshToken')
    })
    it('make http request to signout user without redirect', (done) => {
      $httpBackend.expectDELETE('https://give-stage2.cru.org/okta/logout').respond(200, {})
      sessionService.signOutWithoutRedirectToOkta().subscribe((data) => {
        expect(data).toEqual({})
        expect(sessionService.authClient.revokeAccessToken).toHaveBeenCalled()
        expect(sessionService.authClient.revokeRefreshToken).toHaveBeenCalled()
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

    describe('Is authenicated', () => {
      it('returns user is already authenicated by Okta error', () => {
        jest.spyOn(sessionService.authClient, 'isAuthenticated').mockReturnValue(true)
        sessionService.createAccount('test@test@test.com', 'FirstName', 'LastName').then((data) => {
          expect(getUser).toHaveBeenCalled();
          expect(data).toEqual({
            data: [
              "Already logged in to Okta with email: email@cru.org. You will be redirected to the Sign In page in a few seconds."
            ],
            redirectToSignIn: true,
            status: "error"
          })
        })
      })
      it('returns user is already authenicated by Cortex error', () => {
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
              "Already logged in to Okta. You will be redirected to the Sign In page in a few seconds."
            ],
            redirectToSignIn: true,
            status: "error"
          })
        })
      })
    })

    describe('Not authenicated', () => {

      it('should return formatted errors', () => {
        $httpBackend.expectPOST('https://give-stage2.cru.org/okta/create', {
          email: 'test@test@test.com',
          first_name: 'FirstName',
          last_name: 'LastName'
        }).respond(500, {
            "error": "Okta user creation failed: [{:errorCode=>\"E0000001\",\n :errorSummary=>\"Api validation failed: login\",\n :errorLink=>\"E0000001\",\n :errorId=>\"oaeTHQQui71RxKf-kpCQHRr4Q\",\n :errorCauses=>\n  [{:errorSummary=>\"login: Username must be in the form of an email address\"},\n  {:errorSummary=>\"Something went wrong. Please try again\"},\n {:errorSummary=>\"email: Does not match required pattern\"}]}\n, 400]"
        })
        sessionService.createAccount('test@test@test.com', 'FirstName', 'LastName').then((data) => {
          expect(data.data).toBeDefined()
          expect(data.data[0]).toEqual('login: Username must be in the form of an email address')
          expect(data.data[1]).toEqual('OKTA_ERROR_WHILE_SAVING_DATA')
          expect(data.data[2]).toEqual('OKTA_ERROR_WHILE_SAVING_EMAIL')
        })
      })

      it('handles a 401 error', () => {
        $httpBackend.expectPOST('https://give-stage2.cru.org/okta/create', {
          email: 'test@test@test.com',
          first_name: 'FirstName',
          last_name: 'LastName'
        }).respond(401, {
            "error": "Authenication error"
        })
        sessionService.createAccount('test@test@test.com', 'FirstName', 'LastName').then((data) => {
          expect(data.status).toEqual('error')
          expect(data.data[0]).toEqual('SOMETHING_WENT_WRONG')
        })
      })

      it('handles an unknown error', () => {
        $httpBackend.expectPOST('https://give-stage2.cru.org/okta/create', {
          email: 'test@test@test123.com',
          first_name: 'FirstName',
          last_name: 'LastName'
        }).respond(500, {
            "message": "Authenication error"
        })
        sessionService.createAccount('test@test@test123.com', 'FirstName', 'LastName').then((data) => {
          expect(data.status).toEqual('error')
          expect(data.data[0]).toEqual('SOMETHING_WENT_WRONG')
        })
      })

      it('returns a successful response', () => {
        $httpBackend.expectPOST('https://give-stage2.cru.org/okta/create', {
          email: 'test@test@test.com',
          first_name: 'FirstName',
          last_name: 'LastName'
        }).respond(200, {
          email: 'test@test@test.com',
        })
        sessionService.createAccount('test@test@test.com', 'FirstName', 'LastName').then((data) => {
          expect(data.status).toEqual('success')
          expect(data.data.data).toEqual({ email: 'test@test@test.com' })
        })
      })

      describe('catchCreateAccountErrors()', () => {
        const email = 'test@test.com';
        const dataAsString = JSON.stringify({data: 'data'})
        beforeEach(() => {
          jest.spyOn(sessionService.authClient, 'isAuthenticated')
          $cookies.remove(createAccountDataCookieName)
        })

        it('returns errors for account already registered and checks account status.', () => {
          $httpBackend.expectGET(`https://give-stage2.cru.org/okta/status?email=${encodeURIComponent(email)}`).respond(200, {
            activated: '2023-08-28T14:35:00.000Z',
            password_changed: null,
            status: 'PROVISIONED'
          })
          const errorObject = {
            data: {
              error: "Okta user creation failed: [{:errorCode=>\"E0000001\",\n :errorSummary=>\"Api validation failed: login\",\n :errorLink=>\"E0000001\",\n :errorId=>\"oaeTHQQui71RxKf-kpCQHRr4Q\",\n :errorCauses=>\n  [{:errorSummary=>\"login: An object with this field already exists in the current organization\"}\n, 400]"
            },
            status: 500
          }     

          sessionService.catchCreateAccountErrors(errorObject, dataAsString, email, true).then((data) => {
            expect(data.status).toEqual('error')
            expect(data.data[0]).toEqual('OKTA_EMAIL_ALREADY_EXISTS')
            expect(data.accountPending).toEqual(true)
            expect($cookies.get(createAccountDataCookieName)).toEqual(dataAsString)
          })
        })

        it('returns error for PROVISIONED account', () => {
          $httpBackend.expectGET(`https://give-stage2.cru.org/okta/status?email=${encodeURIComponent(email)}`).respond(200, {
            activated: '2023-08-28T14:35:00.000Z',
            password_changed: null,
            status: 'AWAITING_APPROVAL'
          })
          const errorObject = {
            data: {
              error: "Okta user creation failed: [{:errorCode=>\"E0000001\",\n :errorSummary=>\"Api validation failed: login\",\n :errorLink=>\"E0000001\",\n :errorId=>\"oaeTHQQui71RxKf-kpCQHRr4Q\",\n :errorCauses=>\n  [{:errorSummary=>\"login: An object with this field already exists in the current organization\"}\n, 400]"
            },
            status: 500
          }     

          sessionService.catchCreateAccountErrors(errorObject, dataAsString, email, true).then((data) => {
            expect(data.status).toEqual('error')
            expect(data.data[0]).toEqual('OKTA_EMAIL_ALREADY_EXISTS')
            expect(data.accountPending).toEqual(false)
          })
        })
      })

      afterEach(() => {
        $httpBackend.flush()
        $httpBackend.verifyNoOutstandingExpectation()
        $httpBackend.verifyNoOutstandingRequest()
      })
    })
  });

  describe('checkCreateAccountStatus()', () => {
    const email = 'test@test.com'
    it('should return "Already logged in." if logged in.', () => {
      $cookies.put(Sessions.role, cortexRole.identified)
      $cookies.put(Sessions.profile, cruProfile)
      $rootScope.$digest()
      sessionService.checkCreateAccountStatus(email).then((data) => {
        expect(data).toEqual('Already logged in.')
      })
    })

    describe('Includes create account status request', () => {
      it('returns as OKTA user status', () => {
        $httpBackend.expectGET(`https://give-stage2.cru.org/okta/status?email=${encodeURIComponent(email)}`).respond(200, {
          activated: '2023-08-28T14:35:00.000Z',
          password_changed: null,
          status: 'PROVISIONED'
        })
        
        sessionService.checkCreateAccountStatus(email).then((data) => {
          expect(data.status).toEqual('success')
          expect(data.data.status).toEqual('PROVISIONED')
        })
      })

      it('returns as error when fetching OKTA user status', () => {
        $httpBackend.expectGET(`https://give-stage2.cru.org/okta/status?email=${encodeURIComponent(email)}`).respond(404, {
          error: 'Email is not an Okta user'
        })
        
        sessionService.checkCreateAccountStatus(email).then((data) => {
          expect(data.status).toEqual('error')
          expect(data.data).toEqual('Email is not an Okta user')
        })
      })

      it('should return 401 error message', () => {
        $httpBackend.expectGET(`https://give-stage2.cru.org/okta/status?email=${encodeURIComponent(email)}`).respond(401, {
          error: 'Email is not an Okta user'
        })
        sessionService.checkCreateAccountStatus(email).then((data) => {
          expect(data.status).toEqual('error')
          expect(data.data[0]).toEqual('SOMETHING_WENT_WRONG')
        })
      })

      afterEach(() => {
        $httpBackend.flush()
        $httpBackend.verifyNoOutstandingExpectation()
        $httpBackend.verifyNoOutstandingRequest()
      })
    });
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
        const dataStoredInLocalStorage = $cookies.get(checkoutSavedDataCookieName)
        expect(dataStoredInLocalStorage).toEqual(JSON.stringify(checkoutData))
      })
      it('copies checkout data cookie and stores it on session', () => {
        delete sessionService.session.checkoutSavedData
        expect(sessionService.session.checkoutSavedData).not.toBeDefined()
        sessionService.updateCheckoutSavedData()
        expect(sessionService.session.checkoutSavedData).toBeDefined()
      })
    })

    describe('clearCheckoutSavedData', () => {
      it('removes the cookie and data on session', () => {
        const dataStoredInLocalStorage = $cookies.get(checkoutSavedDataCookieName)
        expect(dataStoredInLocalStorage).toEqual(JSON.stringify(checkoutData))
        // isTest set to TRUE
        sessionService.clearCheckoutSavedData(true)
        const dataAfterClear = $cookies.get(checkoutSavedDataCookieName)
        expect(dataAfterClear).toEqual(undefined)
      })
    })
  })
})
