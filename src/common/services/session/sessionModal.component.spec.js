import angular from 'angular'
import 'angular-mocks'
import module from './sessionModal.component'
import { LoginOktaOnlyEvent } from './session.service'

describe('sessionModalController', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, state, $rootScope

  beforeEach(inject(function ($componentController, _$rootScope_) {
    state = 'sign-in'
    $rootScope = _$rootScope_
    $ctrl = $componentController(module.name, {
      $window: {
        location: '/sign-in.html',
        sessionStorage: {
          getItem: jest.fn(),
          removeItem: jest.fn(),
        }
      }
    },
      {
        resolve: {
          state: state,
          lastPurchaseId: '<some id>'
        },
        close: jest.fn(),
        dismiss: jest.fn(),
        $document: [{
          body: {
            dispatchEvent: jest.fn()
          }
        }],
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

    it('should stateChanged on LoginOktaOnlyEvent', () => {
      expect($ctrl.isLoading).toEqual(false)
      $ctrl.$onInit()
      expect($ctrl.state).toEqual('sign-in')
      $rootScope.$broadcast(LoginOktaOnlyEvent, 'register-account')
      expect($ctrl.state).toEqual('register-account')
    })
  })

  describe('$ctrl.$onDestroy', () => {
    it('should remove sessionSubject subscription', () => {
      $ctrl.$onInit()
      expect($ctrl.subscription.closed).toEqual(false)
      $ctrl.$onDestroy()
      expect($ctrl.subscription.closed).toEqual(true)
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

  describe('$ctrl.onSignInSuccess', () => {
    it('should close modal', () => {
      jest.spyOn($ctrl.sessionService, 'removeOktaRedirectIndicator').mockImplementation(() => {})
      $ctrl.$injector.has.mockImplementation(() => true)
      $ctrl.onSignInSuccess()
      const $injector = $ctrl.$injector

      expect($ctrl.close).toHaveBeenCalled()
      expect($ctrl.sessionService.removeOktaRedirectIndicator).toHaveBeenCalled()
      expect($ctrl.$document[0].body.dispatchEvent).toHaveBeenCalledWith(
        new window.CustomEvent('giveSignInSuccess', { bubbles: true, detail: { $injector } }))
    })

    it('should add the sessionService module', () => {
      $ctrl.$injector.has.mockImplementation(() => false)
      $ctrl.$injector.loadNewModules.mockImplementation(() => {})
      $ctrl.onSignInSuccess()
      const $injector = $ctrl.$injector

      expect($injector.loadNewModules).toHaveBeenCalledWith(['sessionService'])
      expect($ctrl.$document[0].body.dispatchEvent).toHaveBeenCalledWith(
        new window.CustomEvent('giveSignInSuccess', { bubbles: true, detail: { $injector } }))
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
