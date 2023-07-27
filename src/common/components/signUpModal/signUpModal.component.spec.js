import angular from 'angular'
import 'angular-mocks'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/of'
import module from './signUpModal.component'

describe('signUpForm', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings

  beforeEach(inject(function (_$componentController_) {
    bindings = {
      onStateChange: jest.fn(),
      onSuccess: jest.fn()
    }
    $ctrl = _$componentController_(module.name, {}, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  // TODO Complete tests
})
