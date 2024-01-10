import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/of'
import module from './signInForm.component'
import { Sessions } from 'common/services/session/session.service'
import { cortexRole } from 'common/services/session/fixtures/cortex-role'
import { giveSession } from 'common/services/session/fixtures/give-session'
import { cruProfile } from 'common/services/session/fixtures/cru-profile'

describe('signInForm', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings, $rootScope

  beforeEach(inject(function (_$rootScope_, _$componentController_) {
    $rootScope = _$rootScope_
    bindings = {
      onSuccess: jest.fn(),
      onFailure: jest.fn(),
      $document: [{
        body: {
          dispatchEvent: jest.fn()
        }
      }],
      $injector: {
        has: jest.fn(),
        loadNewModules: jest.fn()
      }
    }

    const scope = { $apply: jest.fn() }
    scope.$apply.mockImplementation(() => {})
    $ctrl = _$componentController_(module.name, { $scope: scope }, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit', () => {
    it('has no username', () => {
      jest.spyOn($ctrl.sessionService, 'handleOktaRedirect').mockImplementation(() => Observable.of(false))
      $ctrl.$onInit()

      expect($ctrl.username).not.toBeDefined()
    })

    describe('with \'REGISTERED\' cortex-session', () => {
      let $cookies
      beforeEach(inject(function (_$cookies_) {
        $cookies = _$cookies_
        $cookies.put(Sessions.role, cortexRole.registered)
        $cookies.put(Sessions.give, giveSession)
        $cookies.put(Sessions.profile, cruProfile)
        $rootScope.$digest()
      }))

      afterEach(() => {
        [Sessions.role, Sessions.give, Sessions.profile].forEach((name) => {
          $cookies.remove(name)
        })
      })

      it('sets username', () => {
        expect($ctrl.username).not.toBeDefined()
        jest.spyOn($ctrl.sessionService, 'handleOktaRedirect').mockImplementation(() => Observable.of(false))
        $ctrl.$onInit()

        expect($ctrl.username).toEqual('professorx@xavier.edu')
      })
    })

    describe('handle Okta redirect', () => {
      let deferred
      beforeEach(inject(function (_$q_) {
        $ctrl.errorMessage = undefined
        deferred = _$q_.defer()
        jest.spyOn($ctrl.sessionService, 'handleOktaRedirect').mockImplementation(() => Observable.from(deferred.promise))
        $ctrl.$onInit()
      }))

      it('calls sessionService handleOktaRedirect', () => {
        expect($ctrl.sessionService.handleOktaRedirect).toHaveBeenCalled()
      })

      it('should successfully handle Okta redirect', () => {
        deferred.resolve({})
        $rootScope.$digest()
        expect($ctrl.errorMessage).not.toBeDefined()
      })

      it('should throw an error coming back from Okta', () => {
        const errorMessage = 'generic'
        deferred.reject(errorMessage)
        $rootScope.$digest()
        expect($ctrl.errorMessage).toEqual(errorMessage)
      })
    })
  })

  describe('signInWithOkta', () => {
    let deferred
    beforeEach(inject(function (_$q_) {
      deferred = _$q_.defer()
      jest.spyOn($ctrl.sessionService, 'signIn').mockImplementation(() => Observable.from(deferred.promise))
      $ctrl.signInWithOkta()
    }))

    it('calls sessionService signIn', () => {
      expect($ctrl.isSigningIn).toEqual(true)
      expect($ctrl.sessionService.signIn).toHaveBeenCalledWith(undefined)
    })

    it('signs in successfully', () => {
      deferred.resolve({})
      $rootScope.$digest()

      expect(bindings.onSuccess).toHaveBeenCalled()
    })

    it('adds the sessionService module', () => {
      deferred.resolve({})
      $rootScope.$digest()
      bindings.$injector.has.mockImplementation(() => false)
      bindings.$injector.loadNewModules.mockImplementation(() => {})

      expect(bindings.$document[0].body.dispatchEvent).toHaveBeenCalled();
      const $injector = bindings.$injector

      expect($injector.loadNewModules).toHaveBeenCalledWith(['sessionService'])
      expect(bindings.$document[0].body.dispatchEvent).toHaveBeenCalledWith(
        new window.CustomEvent('giveSignInSuccess', { bubbles: true, detail: { $injector } }))
    })

    it('has unknown error signing in', () => {
      deferred.reject({ data: { error: 'invalid_grant' } })
      $rootScope.$digest()

      expect(bindings.onFailure).toHaveBeenCalled()
      expect($ctrl.errorMessage).toEqual('generic')
      expect($ctrl.isSigningIn).toEqual(false)
    })

    it('has missing error signing in', () => {
      deferred.reject({ data: null })
      $rootScope.$digest()

      expect(bindings.onFailure).toHaveBeenCalled()
      expect($ctrl.errorMessage).toEqual('generic')
      expect($ctrl.isSigningIn).toEqual(false)
    })

    it('removes password from error log', () => {
      deferred.reject({
        config: {
          data: {
            password: $ctrl.password
          }
        }
      })
      $rootScope.$digest()

      expect(bindings.onFailure).toHaveBeenCalled()
      expect($ctrl.$log.error.logs[0]).toEqual(['Sign In Error', { config: { data: {} } }])
    })

    it('has Siebel down error signing in', () => {
      deferred.reject(
        {
          data: {
            code: 'SIEB-DOWN',
            message: 'This functionality is not currently available. Please try again later.'
          }
        })
      $rootScope.$digest()
      expect(bindings.onFailure).toHaveBeenCalled()
      expect($ctrl.errorMessage).toEqual('This functionality is not currently available. Please try again later.')
      expect($ctrl.isSigningIn).toEqual(false)
    })
  })
})
