import angular from 'angular'
import 'angular-mocks'
import module from './userMatchIdentity.component'

describe('userMatchIdentity', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings

  beforeEach(inject(function (_$componentController_) {
    bindings = {
      contacts: ['a', 'b'],
      onSubmit: jest.fn(),
      identityForm: { $valid: false },
      contact: {}
    }
    $ctrl = _$componentController_(module.name, {}, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
    expect($ctrl.hasError).toEqual(false)
  })

  describe('$onChanges', () => {
    it('submits the form when submitted changes to true', () => {
      $ctrl.$onChanges({
        submitted: { currentValue: true }
      })

      expect($ctrl.onSubmit).toHaveBeenCalled()
    })

    it('does nothing when the when submitted changes to false', () => {
      $ctrl.$onChanges({
        submitted: { currentValue: false }
      })

      expect($ctrl.onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('selectContact()', () => {
    describe('invalid form', () => {
      it('set hasError', () => {
        $ctrl.selectContact()

        expect($ctrl.onSubmit).toHaveBeenCalledWith({ success: false })
        expect($ctrl.hasError).toEqual(true)
      })
    })

    describe('valid form', () => {
      beforeEach(() => {
        $ctrl.identityForm.$valid = true
      })

      describe('empty contact', () => {
        it('sends selects \'that-is-not-me\' contact', () => {
          $ctrl.selectContact()

          expect($ctrl.onSubmit).toHaveBeenCalledWith({ success: true, contact: undefined })
        })
      })

      describe('defined contact', () => {
        it('selects contact', () => {
          $ctrl.contact = 'a'
          $ctrl.selectContact()

          expect($ctrl.onSubmit).toHaveBeenCalledWith({ success: true, contact: 'a' })
        })
      })
    })
  })
})
