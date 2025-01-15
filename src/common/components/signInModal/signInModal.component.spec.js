import angular from 'angular'
import 'angular-mocks'
import module from './signInModal.component'

import { Roles } from 'common/services/session/session.service'

describe('signInModal', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings, onStateChange = jest.fn()

  beforeEach(inject(function (_$componentController_) {
    bindings = {
      modalTitle: '',
      onStateChange: onStateChange,
      onSuccess: jest.fn()
    }
    $ctrl = _$componentController_(module.name, {}, bindings)
    $ctrl.$window = {
      location: 'https://give.cru.org/'
    }
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit', () => {
    describe('with \'REGISTERED\' cortex-session', () => {
      beforeEach(() => {
        jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.registered)
        $ctrl.$onInit()
      })

      it('initializes signIn', () => {
        expect($ctrl.modalTitle).toEqual('Sign In')
        expect($ctrl.$window.location).toEqual('/checkout.html')
      })
    })

    describe('with \'PUBLIC\' cortex-session', () => {
      beforeEach(() => {
        jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.public)
        $ctrl.$onInit()
      })

      it('initializes signIn', () => {
        expect($ctrl.modalTitle).toEqual('Sign In')
        expect($ctrl.$window.location).toEqual('https://give.cru.org/')
      })
    })
  })

  describe('getOktaUrl', () => {
    it('should call sessionService getOktaUrl', () => {
      jest.spyOn($ctrl.sessionService, 'getOktaUrl').mockReturnValue('URL')
      expect($ctrl.sessionService.getOktaUrl).not.toHaveBeenCalled()
      $ctrl.getOktaUrl()
      expect($ctrl.sessionService.getOktaUrl).toHaveBeenCalled()
    })
  })
})
