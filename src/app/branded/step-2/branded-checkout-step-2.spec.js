import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

import module from './branded-checkout-step-2.component'

describe('branded checkout step 2', () => {
  beforeEach(angular.mock.module(module.name))
  let $ctrl

  beforeEach(inject($componentController => {
    $ctrl = $componentController(module.name, null, {
      next: jest.fn(),
      previous: jest.fn()
    })
  }))

  describe('$onInit', () => {
    it('should load cart', () => {
      jest.spyOn($ctrl, 'loadCart').mockImplementation(() => {})
      $ctrl.$onInit()

      expect($ctrl.loadCart).toHaveBeenCalled()
    })
  })

  describe('loadCart', () => {
    it('should load cart data', () => {
      jest.spyOn($ctrl.cartService, 'get').mockReturnValue(Observable.of('some data'))
      $ctrl.loadCart()

      expect($ctrl.cartData).toEqual('some data')
      expect($ctrl.errorLoadingCart).toEqual(false)
    })

    it('should handle error', () => {
      jest.spyOn($ctrl.cartService, 'get').mockReturnValue(Observable.throw('some error'))
      $ctrl.loadCart()

      expect($ctrl.cartData).toBeUndefined()
      expect($ctrl.errorLoadingCart).toEqual(true)
      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading cart data for branded checkout step 2', 'some error'])
    })
  })

  describe('changeStep', () => {
    it('should call next if nextStep is thankYou', () => {
      $ctrl.changeStep('thankYou')

      expect($ctrl.next).toHaveBeenCalled()
    })

    it('should call previous otherwise', () => {
      $ctrl.changeStep('otherStep')

      expect($ctrl.previous).toHaveBeenCalled()
    })
  })
})
