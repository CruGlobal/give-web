import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/of'
import module from './returningFromOktaModal.component'
import { Sessions } from 'common/services/session/session.service'
import { cortexRole } from 'common/services/session/fixtures/cortex-role'
import { giveSession } from 'common/services/session/fixtures/give-session'
import { cruProfile } from 'common/services/session/fixtures/cru-profile'
import { createAccountDataCookieName } from 'common/services/session/session.service'

const lastPurchaseId = 'lastPurchaseId'

describe('signUpActivationModal', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings, $rootScope, $cookies, $window

  beforeEach(inject(function (_$rootScope_, _$cookies_, _$componentController_, _$window_) {
    $rootScope = _$rootScope_;
    $cookies = _$cookies_;
    $window = _$window_;
    bindings = {
      onStateChange: jest.fn(),
      onSuccess: jest.fn(),
      onFailure: jest.fn(),
      onCancel: jest.fn(),
      isInsideAnotherModal: false,
      lastPurchaseId,
    }
    const scope = { $apply: jest.fn() }
    scope.$apply.mockImplementation(() => {})
    $ctrl = _$componentController_(module.name, { $scope: scope }, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit() with an authenticated cortex-session', () => {
    beforeEach(() => {
      $cookies.put(Sessions.give, giveSession)
      $cookies.put(Sessions.profile, cruProfile)
      jest.spyOn($ctrl, 'onStateChange')
      $rootScope.$digest()
    })

    afterEach(() => {
      [Sessions.role, Sessions.give, Sessions.profile].forEach((name) => {
        $cookies.remove(name)
      })
      $ctrl.onStateChange.mockClear()
    })

    it('Redirects user to sign in modal', () => {
      $cookies.put(Sessions.role, cortexRole.registered)
      $rootScope.$digest()
      $ctrl.$onInit()

      expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'sign-in' })
    })

    it('Redirects user with identified role to sign in modal', () => {
      $cookies.put(Sessions.role, cortexRole.identified)
      $rootScope.$digest()
      $ctrl.$onInit()

      expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'sign-in' })
    })
  })
})
