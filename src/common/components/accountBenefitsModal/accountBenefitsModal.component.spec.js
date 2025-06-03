import angular from 'angular'
import 'angular-mocks'
import module from './accountBenefitsModal.component'
import { Roles } from 'common/services/session/session.service'

describe('accountBenefitsModal', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, $location, bindings

  beforeEach(inject(function (_$componentController_, _$location_) {
    $location = _$location_
    bindings = {
      modalTitle: '',
      onRegister: jest.fn(),
      onSuccess: jest.fn()
    }
    $ctrl = _$componentController_(module.name, {}, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit', () => {
    it('initializes component', () => {
      $ctrl.$onInit()

      expect($ctrl.modalTitle).toEqual('Register Your Account for Online Access')
    })
  })

  describe('registerAccount()', () => {
    it('call onSuccess if role is registered', () => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.registered)
      $ctrl.registerAccount()

      expect($ctrl.onSuccess).toHaveBeenCalled()
    })

    it('calls onRegister if role is not registered', () => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.public)
      $ctrl.registerAccount()

      expect($ctrl.onRegister).toHaveBeenCalled()
    })
  })

  describe('onFailure()', () => {
    it('calls sessionService.removeOktaRedirectIndicator()', () => {
      jest.spyOn($ctrl.sessionService, 'removeOktaRedirectIndicator')
      $ctrl.onFailure()
      expect($ctrl.sessionService.removeOktaRedirectIndicator).toHaveBeenCalled()
    })
  })
})
