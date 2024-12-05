import angular from 'angular'
import 'angular-mocks'
import module, { submitOrderEvent, recaptchaFailedEvent } from './cart-summary.component'

describe('checkout', function () {
  describe('cart summary', function () {
    beforeEach(angular.mock.module(module.name))
    const self = {}
    const componentInstance = {}

    beforeEach(inject(function ($rootScope, $componentController) {
      const $scope = $rootScope.$new()
      componentInstance.$rootScope = $rootScope.$new()

      self.controller = $componentController(module.name, {
        $scope: $scope
      })
    }))

    it('to be defined', function () {
      expect(self.controller).toBeDefined()
    })

    describe('buildCartUrl', () => {
      it('should get the url from the cart service', () => {
        jest.spyOn(self.controller.cartService, 'buildCartUrl')
        self.controller.buildCartUrl()
        expect(self.controller.cartService.buildCartUrl).toHaveBeenCalled()
      })
    })

    describe('onSubmit', () => {
      it('should emit an event', () => {
        jest.spyOn(self.controller.$rootScope, '$emit').mockImplementation(() => {})
        self.controller.onSubmit()
        expect(self.controller.$rootScope.$emit).toHaveBeenCalledWith(submitOrderEvent)
      })
    })
  })
})
