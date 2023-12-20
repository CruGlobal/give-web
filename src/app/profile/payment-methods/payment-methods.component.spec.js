import angular from 'angular'
import 'angular-mocks'
import module from './payment-methods.component'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import { SignOutEvent } from 'common/services/session/session.service'

describe('PaymentMethodsComponent', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl

  const fakeModal = function () {
    return {
      result: {
        then: function (confirmCallback) {
          this.paymentMethods = []
          confirmCallback({})
        }
      }
    }
  }

  const uibModal = {
    open: jest.fn(fakeModal),
    close: jest.fn()
  }

  beforeEach(inject((_$componentController_) => {
    $ctrl = _$componentController_(module.name, {
      $window: { location: '/payment-methods.html' },
      $uibModal: uibModal
    })
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
    expect($ctrl.$window).toBeDefined()
    expect($ctrl.$location).toBeDefined()
    expect($ctrl.$rootScope).toBeDefined()
    expect($ctrl.sessionEnforcerService).toBeDefined()
    expect($ctrl.profileService).toBeDefined()
  })

  describe('$onInit()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'loadPaymentMethods').mockImplementation(() => {})
      jest.spyOn($ctrl, 'loadDonorDetails').mockImplementation(() => {})
      jest.spyOn($ctrl, 'sessionEnforcerService').mockImplementation(() => {})
      jest.spyOn($ctrl.$rootScope, '$on').mockImplementation(() => {})
      jest.spyOn($ctrl, 'signedOut').mockImplementation(() => {})
    })

    it('adds listener for sign-out event', () => {
      $ctrl.$onInit()

      expect($ctrl.$rootScope.$on).toHaveBeenCalledWith(SignOutEvent, expect.any(Function))
      $ctrl.$rootScope.$on.mock.calls[0][1]()

      expect($ctrl.signedOut).toHaveBeenCalled()
    })

    describe('sessionEnforcerService success', () => {
      it('executes success callback', () => {
        $ctrl.$onInit()
        $ctrl.sessionEnforcerService.mock.calls[0][1]['sign-in']()

        expect($ctrl.loadPaymentMethods).toHaveBeenCalled()
        expect($ctrl.loadDonorDetails).toHaveBeenCalled()
      })
    })

    describe('sessionEnforcerService failure', () => {
      it('executes failure callback', () => {
        $ctrl.$onInit()
        $ctrl.sessionEnforcerService.mock.calls[0][1]['cancel']()

        expect($ctrl.$window.location).toEqual('/')
      })
    })
  })

  describe('loadPaymentMethods()', () => {
    it('should load payment methods on $onInit()', () => {
      jest.spyOn($ctrl.profileService, 'getPaymentMethodsWithDonations').mockReturnValue(Observable.of([{}, {}]))
      $ctrl.loadPaymentMethods()

      expect($ctrl.paymentMethods).toEqual([{}, {}])
      expect($ctrl.profileService.getPaymentMethodsWithDonations).toHaveBeenCalled()
    })

    it('should handle and error of loading payment methods on $onInit()', () => {
      jest.spyOn($ctrl.profileService, 'getPaymentMethodsWithDonations').mockReturnValue(Observable.throw({
        data: 'some error'
      }))
      $ctrl.loadPaymentMethods()

      expect($ctrl.loadingError).toEqual(true)
      expect($ctrl.profileService.getPaymentMethodsWithDonations).toHaveBeenCalled()
      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading payment methods', { data: 'some error' }])
    })

    it('should handle 500 errors differently when loading payment methods', () => {
      jest.spyOn($ctrl.profileService, 'getPaymentMethodsWithDonations').mockReturnValue(Observable.throw({
        status: 500
      }))
      $ctrl.loadPaymentMethods()

      expect($ctrl.loadingError).toEqual('authentication')
    })
  })

  describe('loadDonorDetails()', () => {
    it('should get donor details', () => {
      jest.spyOn($ctrl.profileService, 'getDonorDetails').mockReturnValue(Observable.of({ mailingAddress: 'address' }))
      $ctrl.loadDonorDetails()

      expect($ctrl.mailingAddress).toBe('address')
      expect($ctrl.profileService.getDonorDetails).toHaveBeenCalled()
    })

    it('should log an error', () => {
      jest.spyOn($ctrl.profileService, 'getDonorDetails').mockReturnValue(Observable.throw('some error'))
      $ctrl.loadDonorDetails()

      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading mailing address for use in profile payment method add payment method modals', 'some error'])
    })
  })

  describe('addPaymentMethod()', () => {
    it('should open addPaymentMethod Modal', () => {
      $ctrl.paymentMethods = [{}, {}]
      $ctrl.addPaymentMethod()

      expect($ctrl.$uibModal.open).toHaveBeenCalled()
      jest.spyOn($ctrl, 'onPaymentFormStateChange').mockImplementation(() => {})
      $ctrl.$uibModal.open.mock.calls[0][0].resolve.onPaymentFormStateChange()({ $event: {} })

      expect($ctrl.onPaymentFormStateChange).toHaveBeenCalled()
    })

    it('should add payment method', () => {
      const data = {
        address: {
          streetAddress: '123 First St',
          extendedAddress: 'Apt 123',
          locality: 'Sacramento',
          postalCode: '12345',
          region: 'CA'
        }
      }
      jest.spyOn($ctrl.profileService, 'addPaymentMethod').mockReturnValue(Observable.of(data))
      $ctrl.paymentMethodFormModal = { close: jest.fn() }

      $ctrl.parentComponent = $ctrl
      $ctrl.onPaymentFormStateChange({
        state: 'loading',
        payload: 'some data'
      })

      expect($ctrl.paymentMethodFormModal.close).toHaveBeenCalled()
    })

    it('should update payment methods list on modal close', () => {
      $ctrl.paymentMethods = [{}, {}]
      $ctrl.addPaymentMethod()
      $ctrl.paymentMethodFormModal.result.then(() => {})

      expect($ctrl.paymentMethods.length).toBe(3)
      $ctrl.$timeout.flush()

      expect($ctrl.successMessage.show).toBe(false)
    })
  })

  describe('$onDestroy()', () => {
    it('should close modal and cancel the sessionEnforcer', () => {
      jest.spyOn($ctrl.sessionEnforcerService, 'cancel').mockImplementation(() => {})
      $ctrl.enforcerId = '1234567890'
      $ctrl.paymentMethodFormModal = { close: jest.fn() }
      $ctrl.$onDestroy()

      expect($ctrl.sessionEnforcerService.cancel).toHaveBeenCalledWith('1234567890')
      expect($ctrl.paymentMethodFormModal.close).toHaveBeenCalled()
    })

    it('should cancel the sessionEnforcer', () => {
      jest.spyOn($ctrl.sessionEnforcerService, 'cancel').mockImplementation(() => {})
      $ctrl.enforcerId = '1234567890'
      $ctrl.$onDestroy()

      expect($ctrl.sessionEnforcerService.cancel).toHaveBeenCalledWith('1234567890')
    })
  })

  describe('isCard()', () => {
    it('should return true if payment method is a card', () => {
      expect($ctrl.isCard({
        self: {
          type: 'paymentinstruments.payment-instrument'
        },
        'card-type': 'Visa'
      })).toBe(true)

      expect($ctrl.isCard({
        self: {
          type: 'paymentinstruments.payment-instrument'
        },
        'account-type': 'Checking'
      })).toBe(false)
    })
  })

  describe('onDelete()', () => {
    it('should do stuff onDelete()', () => {
      jest.spyOn($ctrl, 'loadPaymentMethods').mockImplementation(() => {})
      $ctrl.onDelete()

      expect($ctrl.loadPaymentMethods).toHaveBeenCalled()
      expect($ctrl.successMessage.show).toBe(true)
      expect($ctrl.successMessage.type).toBe('paymentMethodDeleted')
      $ctrl.$timeout.flush()

      expect($ctrl.successMessage.show).toBe(false)
    })
  })

  describe('onPaymentFormStateChange()', () => {
    it('should update paymentFormState', () => {
      $ctrl.paymentFormResolve.state = 'unsubmitted'
      $ctrl.onPaymentFormStateChange({ state: 'submitted' })

      expect($ctrl.paymentFormResolve.state).toEqual('submitted')
    })

    it('should fail adding payment method and show error message', () => {
      jest.spyOn($ctrl.profileService, 'addPaymentMethod').mockReturnValue(Observable.throw({
        data: 'some error'
      }))
      $ctrl.onPaymentFormStateChange({
        state: 'loading',
        payload: 'some data'
      })

      expect($ctrl.paymentFormResolve.state).toBe('error')
      expect($ctrl.paymentFormResolve.error).toBe('some error')
    })

    it('should handle data.address format', () => {
      $ctrl.paymentMethodFormModal = { close: jest.fn() }
      jest.spyOn($ctrl.profileService, 'addPaymentMethod').mockReturnValue(Observable.of({
        address: {
          'street-address': '123 Sesame St',
          locality: 'Orlando',
          region: 'FL',
          'postal-code': '33333',
          'country-name': 'US'
        }
      }))
      $ctrl.onPaymentFormStateChange({ state: 'loading', payload: 'payload' })

      const expectedData = {
        address: {
          streetAddress: '123 Sesame St',
          locality: 'Orlando',
          region: 'FL',
          postalCode: '33333',
          country: 'US'
        }
      }

      expect($ctrl.paymentMethodFormModal.close).toHaveBeenCalledWith(expectedData)
    })

    it('should handle payment-instrument-identification-attributes', () => {
      $ctrl.paymentMethodFormModal = { close: jest.fn() }
      jest.spyOn($ctrl.profileService, 'addPaymentMethod').mockReturnValue(Observable.of({
        'payment-instrument-identification-attributes': {
          'street-address': '123 Sesame St',
          locality: 'Orlando',
          region: 'FL',
          'postal-code': '33333',
          'country-name': 'US'
        }
      }))
      $ctrl.onPaymentFormStateChange({ state: 'loading', payload: 'payload' })

      const expectedData = {
        address: {
          streetAddress: '123 Sesame St',
          locality: 'Orlando',
          region: 'FL',
          postalCode: '33333',
          country: 'US'
        },
        'payment-instrument-identification-attributes': {
          'street-address': '123 Sesame St',
          locality: 'Orlando',
          region: 'FL',
          'postal-code': '33333',
          'country-name': 'US'
        }
      }

      expect($ctrl.paymentMethodFormModal.close).toHaveBeenCalledWith(expectedData)
    })
  })

  describe('signedOut( event )', () => {
    describe('default prevented', () => {
      it('does nothing', () => {
        $ctrl.signedOut({ defaultPrevented: true })

        expect($ctrl.$window.location).toEqual('/payment-methods.html')
      })
    })

    describe('default not prevented', () => {
      it('navigates to \'\/\'', () => {
        const spy = jest.fn()
        $ctrl.signedOut({ defaultPrevented: false, preventDefault: spy })

        expect(spy).toHaveBeenCalled()
        expect($ctrl.$window.location).toEqual('/')
      })
    })
  })
})
