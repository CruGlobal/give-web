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

  describe('getOktaUrl()', () => {
    it('should call sessionService getOktaUrl and return Okta URL', () => {
      jest.spyOn($ctrl.sessionService, 'getOktaUrl').mockReturnValue('URL')
      const response = $ctrl.getOktaUrl()

      expect($ctrl.sessionService.getOktaUrl).toHaveBeenCalled();
      expect(response).toEqual('URL')
    })
  })
})
