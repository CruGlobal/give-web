import angular from 'angular'
import 'angular-mocks'

import module from './analytics.factory'

describe('branded analytics factory', () => {
  beforeEach(angular.mock.module(module.name))

  const self = {}
  beforeEach(inject((analyticsFactory, $window) => {
    self.analyticsFactory = analyticsFactory
    self.$window = $window
    self.$window.dataLayer = []
  }))

  describe('handleFormErrors', () => {
    it('calls fieldError for each error', () => {
      jest.spyOn(self.analyticsFactory, 'fieldError')

      self.analyticsFactory.handleFormErrors({
        $valid: false,
        $dirty: true,
        firstName: {
          $invalid: true,
          $error: {
            required: true
          }
        },
        lastName: {
          $invalid: false,
          $error: {}
        },
        middleName: {
          $invalid: true,
          $error: {
            capitalized: true,
            maxLength: true
          }
        }
      })

      expect(self.analyticsFactory.fieldError.mock.calls).toEqual([
        ['firstName', 'required'],
        ['middleName', 'capitalized'],
        ['middleName', 'maxLength']
      ])
    })
  })
})
