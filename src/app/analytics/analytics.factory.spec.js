import angular from 'angular'
import 'angular-mocks'

import module from './analytics.factory'

describe('branded analytics factory', () => {
  beforeEach(angular.mock.module(module.name, 'environment'))

  const self = {}
  beforeEach(inject((analyticsFactory, envService, $window) => {
    self.analyticsFactory = analyticsFactory
    self.envService = envService
    self.$window = $window
    self.$window.dataLayer = []
  }))

  describe('handleCheckoutFormErrors', () => {
    const form = {
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
    }

    it('calls checkoutFieldError for each error', () => {
      jest.spyOn(self.analyticsFactory, 'checkoutFieldError')
      jest.spyOn(self.envService, 'read').mockImplementation(name => name === 'isCheckout')

      self.analyticsFactory.handleCheckoutFormErrors(form)
      expect(self.analyticsFactory.checkoutFieldError.mock.calls).toEqual([
        ['firstName', 'required'],
        ['middleName', 'capitalized'],
        ['middleName', 'maxLength']
      ])
    })

    it('does nothing when not checkout out', () => {
      jest.spyOn(self.analyticsFactory, 'checkoutFieldError')
      jest.spyOn(self.envService, 'read').mockReturnValue(false)

      self.analyticsFactory.handleCheckoutFormErrors(form)
      expect(self.analyticsFactory.checkoutFieldError).not.toHaveBeenCalled()
    })
  })
})
