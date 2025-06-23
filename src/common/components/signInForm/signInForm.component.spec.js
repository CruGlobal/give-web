import angular from 'angular'
import 'angular-mocks'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/of'
import module from './signInForm.component'

describe('signInForm', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings, $rootScope

  beforeEach(inject(function (_$rootScope_, _$componentController_) {
    $rootScope = _$rootScope_
    bindings = {
      onSuccess: jest.fn(),
      onFailure: jest.fn(),
    }

    const scope = { $apply: jest.fn() }
    scope.$apply.mockImplementation(() => {})
    $ctrl = _$componentController_(module.name, { $scope: scope }, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })
})
