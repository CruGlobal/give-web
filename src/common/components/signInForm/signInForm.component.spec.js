import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
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
      $document: {
        body: {
          dispatchEvent: jest.fn()
        }
      }
    }

    $ctrl = _$componentController_(module.name, {}, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit', () => {
    it('has no username', () => {
      $ctrl.$onInit()

      expect($ctrl.username).not.toBeDefined()
      expect($ctrl.signInState).toEqual('identity')
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
        $ctrl.$onInit()

        expect($ctrl.username).toEqual('professorx@xavier.edu')
      })
    })
  })

  describe('signIn', () => {
    describe('on \'identity\' signInState', () => {
      let deferred
      beforeEach(inject(function (_$q_) {
        deferred = _$q_.defer()
        $ctrl.signInState = 'identity'
        jest.spyOn($ctrl.sessionService, 'signIn').mockImplementation(() => Observable.from(deferred.promise))
        $ctrl.username = 'professorx@xavier.edu'
        $ctrl.password = 'Cerebro123'
        $ctrl.signIn()
      }))

      it('calls sessionService signIn', () => {
        expect($ctrl.isSigningIn).toEqual(true)
        expect($ctrl.sessionService.signIn).toHaveBeenCalledWith('professorx@xavier.edu', 'Cerebro123', undefined, undefined, undefined)
      })

      it('signs in successfully', () => {
        deferred.resolve({})
        $rootScope.$digest()

        expect(bindings.onSuccess).toHaveBeenCalled()
        expect(bindings.$document.body.dispatchEvent)
          .toHaveBeenCalledWith(new window.CustomEvent('giveSignInSuccess', { bubbles: true, detail: {} }))
      })

      it('requires multi-factor', () => {
        deferred.reject({ data: { error: 'invalid_grant', thekey_authn_error: 'mfa_required' } })
        $rootScope.$digest()

        expect(bindings.onFailure).not.toHaveBeenCalled()
        expect($ctrl.signInState).toEqual('mfa')
        expect($ctrl.errorMessage).not.toBeDefined()
        expect($ctrl.isSigningIn).toEqual(false)
      })

      it('has error signing in', () => {
        deferred.reject({ data: { error: 'invalid_grant', thekey_authn_error: 'invalid_credentials' } })
        $rootScope.$digest()

        expect(bindings.onFailure).toHaveBeenCalled()
        expect($ctrl.errorMessage).toEqual('Bad username or password')
        expect($ctrl.isSigningIn).toEqual(false)
        expect($ctrl.signInState).toEqual('identity')
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

    describe('on \'mfa\' signInState', () => {
      let deferred
      beforeEach(inject(function (_$q_) {
        deferred = _$q_.defer()
        $ctrl.signInState = 'mfa'
        jest.spyOn($ctrl.sessionService, 'signIn').mockImplementation(() => Observable.from(deferred.promise))
        $ctrl.username = 'professorx@xavier.edu'
        $ctrl.password = 'Cerebro123'
        $ctrl.mfa_token = '123456'
        $ctrl.trust_device = false
      }))

      it('calls sessionService signIn', () => {
        $ctrl.signIn()

        expect($ctrl.isSigningIn).toEqual(true)
        expect($ctrl.sessionService.signIn).toHaveBeenCalledWith('professorx@xavier.edu', 'Cerebro123', '123456', false, undefined)
      })

      it('calls sessionService signIn with trust_device', () => {
        $ctrl.trust_device = true
        $ctrl.signIn()

        expect($ctrl.isSigningIn).toEqual(true)
        expect($ctrl.sessionService.signIn).toHaveBeenCalledWith('professorx@xavier.edu', 'Cerebro123', '123456', true, undefined)
      })

      it('signs in successfully', () => {
        $ctrl.signIn()
        deferred.resolve({})
        $rootScope.$digest()

        expect(bindings.onSuccess).toHaveBeenCalled()
      })

      it('requires multi-factor', () => {
        $ctrl.signIn()
        deferred.reject({ data: { error: 'invalid_grant', thekey_authn_error: 'mfa_required' } })
        $rootScope.$digest()

        expect(bindings.onFailure).not.toHaveBeenCalled()
        expect($ctrl.signInState).toEqual('mfa')
        expect($ctrl.errorMessage).toEqual('mfa')
        expect($ctrl.isSigningIn).toEqual(false)
        expect($ctrl.mfa_token).not.toBeDefined()
      })
    })
  })
})
