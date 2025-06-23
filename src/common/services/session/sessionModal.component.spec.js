import angular from 'angular'
import 'angular-mocks'
import module from './sessionModal.component'

describe('sessionModalController', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, state

  beforeEach(inject(function ($componentController) {
    state = 'sign-in'
    $ctrl = $componentController(module.name, {},
      {
        resolve: {
          state: state,
          lastPurchaseId: '<some id>'
        },
        close: jest.fn(),
        dismiss: jest.fn(),
        $injector: {
          has: jest.fn(),
          loadNewModules: jest.fn()
        }
      })
  }))

  describe('$ctrl.$onInit', () => {
    it('should initialize the component state', () => {
      expect($ctrl.isLoading).toEqual(false)
      $ctrl.$onInit()

      expect($ctrl.state).toEqual('sign-in')
      expect($ctrl.lastPurchaseId).toEqual('<some id>')
    })
  })

  describe('$ctrl.stateChanged', () => {
    it('should scroll to the top of the modal', () => {
      jest.spyOn($ctrl, 'scrollModalToTop').mockImplementation(() => {})
      $ctrl.stateChanged()

      expect($ctrl.scrollModalToTop).toHaveBeenCalled()
    })

    it('should update state', () => {
      $ctrl.stateChanged('sign-up')

      expect($ctrl.state).toEqual('sign-up')
    })
  })

  describe('$ctrl.onSignUpSuccess', () => {
    it('should close modal', () => {
      jest.spyOn($ctrl.sessionService, 'removeOktaRedirectIndicator').mockImplementation(() => {})
      jest.spyOn($ctrl.analyticsFactory, 'track').mockImplementation(() => {})
      $ctrl.onSignUpSuccess()

      expect($ctrl.close).toHaveBeenCalled()
      expect($ctrl.analyticsFactory.track).toHaveBeenCalledWith('ga-sign-in-create-login')
      expect($ctrl.sessionService.removeOktaRedirectIndicator).toHaveBeenCalled()
    })
  })

  describe('$ctrl.onAccountBenefitsSuccess', () => {
    it('should move to register-account page and remove Okta Indicator', () => {
      jest.spyOn($ctrl.sessionService, 'removeOktaRedirectIndicator').mockImplementation(() => {})
      $ctrl.onAccountBenefitsSuccess()
      expect($ctrl.sessionService.removeOktaRedirectIndicator).toHaveBeenCalled()
      expect($ctrl.state).toEqual('register-account')
    })
  })

  describe('$ctrl.onFailure', () => {
    it('should dismiss modal with \'error\'', () => {
      jest.spyOn($ctrl.sessionService, 'removeOktaRedirectIndicator').mockImplementation(() => {})
      $ctrl.onFailure()

      expect($ctrl.dismiss).toHaveBeenCalledWith({ $value: 'error' })
      expect($ctrl.sessionService.removeOktaRedirectIndicator).toHaveBeenCalled()
    })
  })

  describe('$ctrl.onCancel', () => {
    it('should dismiss modal with \'cancel\'', () => {
      jest.spyOn($ctrl.sessionService, 'removeOktaRedirectIndicator').mockImplementation(() => {})
      $ctrl.onCancel()

      expect($ctrl.dismiss).toHaveBeenCalledWith({ $value: 'cancel' })
      expect($ctrl.sessionService.removeOktaRedirectIndicator).toHaveBeenCalled()
    })
  })

  describe('$ctrl.setLoading()', () => {
    it('should set isLoading', () => {
      expect($ctrl.isLoading).toEqual(false)
      $ctrl.setLoading(true)

      expect($ctrl.isLoading).toEqual(true)
    })
  })
})
