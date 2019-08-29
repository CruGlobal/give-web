import angular from 'angular'
import 'angular-mocks'
import module from './signInModal.component'

import { Roles } from 'common/services/session/session.service'

describe('signInModal', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings

  beforeEach(inject(function (_$componentController_) {
    bindings = {
      modalTitle: '',
      onStateChange: jest.fn(),
      onSuccess: jest.fn()
    }
    $ctrl = _$componentController_(module.name, {}, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit', () => {
    describe('with \'REGISTERED\' cortex-session', () => {
      beforeEach(() => {
        jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.registered)
        $ctrl.session.email = 'professorx@xavier.edu'
        $ctrl.$onInit()
      })

      it('initializes signIn with user\'s email', () => {
        expect($ctrl.modalTitle).toEqual('Sign In')
        expect($ctrl.username).toEqual('professorx@xavier.edu')
        expect($ctrl.identified).toEqual(true)
      })
    })

    describe('with \'PUBLIC\' cortex-session', () => {
      beforeEach(() => {
        jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.public)
        $ctrl.$onInit()
      })

      it('initializes signIn', () => {
        expect($ctrl.modalTitle).toEqual('Sign In')
        expect($ctrl.username).not.toBeDefined()
        expect($ctrl.identified).toEqual(false)
      })
    })
  })

  describe('signOut', () => {
    beforeEach(() => {
      $ctrl.identified = true
    })

    it('set identified to false', () => {
      $ctrl.signOut()

      expect($ctrl.identified).toEqual(false)
    })
  })
})
