import angular from 'angular'
import 'angular-mocks'

import module from './checkout.service'

describe('checkout service', () => {
  beforeEach(angular.mock.module(module.name))

  beforeEach(angular.mock.module(($provide) => {
    $provide.value('envService', {
      read: () => '123'
    })
  }))

  const self = {}
  let script

  beforeEach(inject((checkoutService, envService, $window) => {
    self.checkoutService = checkoutService
    self.envService = envService
    self.$window = $window
    self.$window.document = document

    script = self.$window.document.createElement('script')
  }))

  describe('initializeRecaptcha()', () => {
    beforeEach(() => {
      script.src = 'https://www.google.com/recaptcha/enterprise.js?render=123'
      script.id = 'test-script'
    })

    afterEach(() => {
      const foundScript = self.$window.document.getElementById('give-checkout-recaptcha')
      if (foundScript) {
        self.$window.document.head.removeChild(foundScript)
      }
    })

    it('should add a script even if one already exists', () => {
      self.$window.document.head.appendChild(script)
      self.checkoutService.initializeRecaptcha.call(self)
      expect(self.$window.document.getElementById('give-checkout-recaptcha')).not.toBeNull()
      expect(self.$window.document.getElementById('test-script')).not.toBeNull()
    })

    it('should only add this script once', () => {
      script.id = 'give-checkout-recaptcha'
      self.$window.document.head.appendChild(script)
      expect(self.$window.document.getElementById('give-checkout-recaptcha')).not.toBeNull()
      self.checkoutService.initializeRecaptcha.call(self)
      expect(self.$window.document.querySelectorAll('#give-checkout-recaptcha')).toHaveLength(1)
    })
  })
})
