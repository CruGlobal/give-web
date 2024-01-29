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
  })
})
