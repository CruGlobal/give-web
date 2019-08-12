import angular from 'angular'
import 'angular-mocks'
import module from './sessionModal.service'
import modalStateModule from 'common/services/modalState.service'

describe('sessionModalService', function () {
  beforeEach(angular.mock.module(module.name))
  let sessionModalService; let $uibModal; let counter = 0

  beforeEach(inject(function (_sessionModalService_, _$uibModal_) {
    sessionModalService = _sessionModalService_
    $uibModal = _$uibModal_
    // Spy On $uibModal.open and return mock object
    jest.spyOn($uibModal, 'open').mockImplementation(() => {
      return {
        result: { finally: angular.noop, then: angular.noop },
        dismiss: angular.noop,
        opened: { then: angular.noop },
        uniq: counter++
      }
    })
  }))

  it('should be defined', () => {
    expect(sessionModalService).toBeDefined()
  })

  describe('open', () => {
    it('should be defined', () => {
      expect(sessionModalService.open).toBeDefined()
    })

    it('should open \'sign-in\' by default', () => {
      const modal = sessionModalService.open()

      expect($uibModal.open).toHaveBeenCalled()
      expect($uibModal.open.mock.calls.length).toEqual(1)
      expect($uibModal.open.mock.calls[0][0].resolve.state()).toEqual('sign-in')
      expect(modal).toEqual(sessionModalService.currentModal())
    })

    it('should allow options', () => {
      sessionModalService.open('sign-up', { backdrop: false, keyboard: false })

      expect($uibModal.open).toHaveBeenCalledTimes(1)
      expect($uibModal.open).toHaveBeenCalledWith(expect.objectContaining({ backdrop: false, keyboard: false }))
    })

    describe('modal opens', () => {
      let deferred, $rootScope, analyticsFactory
      beforeEach(inject(function (_$q_, _$rootScope_, _$location_, _analyticsFactory_) {
        $rootScope = _$rootScope_
        deferred = _$q_.defer()
        analyticsFactory = _analyticsFactory_
        jest.spyOn(analyticsFactory, 'track').mockImplementation(() => {})
        $uibModal.open.mockReturnValue({ result: { finally: angular.noop, then: angular.noop }, opened: deferred.promise })
      }))

      it('sends analytics event', () => {
        sessionModalService.open('sign-up', {
          openAnalyticsEvent: 'eventA'
        })
        deferred.resolve()
        $rootScope.$digest()

        expect(analyticsFactory.track).toHaveBeenCalledWith('eventA')
      })
    })

    describe('modal closes', () => {
      let deferred, $rootScope, modalStateService, analyticsFactory
      beforeEach(inject(function (_$q_, _$rootScope_, _$location_, _modalStateService_, _analyticsFactory_) {
        $rootScope = _$rootScope_
        modalStateService = _modalStateService_
        deferred = _$q_.defer()
        analyticsFactory = _analyticsFactory_
        jest.spyOn(modalStateService, 'name').mockImplementation(() => {})
        jest.spyOn(analyticsFactory, 'track').mockImplementation(() => {})
        $uibModal.open.mockReturnValue({ result: deferred.promise })
      }))

      it('removes modal name', () => {
        sessionModalService.open()
        deferred.resolve()
        $rootScope.$digest()

        expect(modalStateService.name).toHaveBeenCalledWith(null)
        expect(analyticsFactory.track).not.toHaveBeenCalled()
      })

      it('sends analytics event', () => {
        sessionModalService.open('sign-up', {
          dismissAnalyticsEvent: 'eventA'
        })
        deferred.reject()
        $rootScope.$digest()

        expect(analyticsFactory.track).toHaveBeenCalledWith('eventA')
      })
    })

    it('should only allow 1 modal at a time', () => {
      sessionModalService.open()
      const result = sessionModalService.open()

      expect(result).toEqual(false)
      expect($uibModal.open).toHaveBeenCalledTimes(1)
    })

    it('can replace existing modal', () => {
      const modalA = sessionModalService.open()
      const modalB = sessionModalService.open('sign-up', {}, true)

      expect(sessionModalService.currentModal()).not.toEqual(modalA)
      expect(sessionModalService.currentModal()).toEqual(modalB)
    })
  })

  describe('signIn', () => {
    it('should open signIn modal', () => {
      sessionModalService.signIn()

      expect($uibModal.open).toHaveBeenCalledTimes(1)
      expect($uibModal.open.mock.calls[0][0].resolve.state()).toEqual('sign-in')
    })

    it('should open signIn modal with last purchase id', () => {
      sessionModalService.signIn('gxwpz=')

      expect($uibModal.open).toHaveBeenCalledTimes(1)
      expect($uibModal.open.mock.calls[0][0].resolve.lastPurchaseId()).toEqual('gxwpz=')
    })
  })

  describe('signUp', () => {
    it('should open signUp modal', () => {
      sessionModalService.signUp()

      expect($uibModal.open).toHaveBeenCalledTimes(1)
      expect($uibModal.open.mock.calls[0][0].resolve.state()).toEqual('sign-up')
    })
  })

  describe('forgotPassword', () => {
    it('should open forgotPassword modal', () => {
      sessionModalService.forgotPassword()

      expect($uibModal.open).toHaveBeenCalledTimes(1)
      expect($uibModal.open.mock.calls[0][0].resolve.state()).toEqual('forgot-password')
    })
  })

  describe('resetPassword', () => {
    it('should open resetPassword modal', () => {
      sessionModalService.resetPassword()

      expect($uibModal.open).toHaveBeenCalledTimes(1)
      expect($uibModal.open.mock.calls[0][0].resolve.state()).toEqual('reset-password')
    })
  })

  describe('userMatch', () => {
    it('should open userMatch modal', () => {
      sessionModalService.userMatch()

      expect($uibModal.open).toHaveBeenCalledTimes(1)
      expect($uibModal.open.mock.calls[0][0].resolve.state()).toEqual('user-match')
    })
  })

  describe('contactInfo', () => {
    it('should open contactInfo modal', () => {
      sessionModalService.contactInfo()

      expect($uibModal.open).toHaveBeenCalledTimes(1)
      expect($uibModal.open.mock.calls[0][0].resolve.state()).toEqual('contact-info')
    })
  })

  describe('registerAccount', () => {
    it('should open registerAccount modal', () => {
      sessionModalService.registerAccount()

      expect($uibModal.open).toHaveBeenCalledTimes(1)
      expect($uibModal.open.mock.calls[0][0].resolve.state()).toEqual('register-account')
    })
  })
})

describe('sessionModalService module config', () => {
  let modalStateServiceProvider

  beforeEach(() => {
    angular.mock.module(modalStateModule.name, function (_modalStateServiceProvider_) {
      modalStateServiceProvider = _modalStateServiceProvider_
      jest.spyOn(modalStateServiceProvider, 'registerModal').mockImplementation(() => {})
    })
    angular.mock.module(module.name)
  })

  it('config to register \'reset-password\' modal', inject(function () {
    expect(modalStateServiceProvider.registerModal).toHaveBeenCalledWith('reset-password', ['sessionModalService', expect.any(Function)])
  }))

  describe('invoke \'reset-password\' modal function', () => {
    let sessionModalService, $injector

    beforeEach(inject(function (_sessionModalService_, _$injector_) {
      sessionModalService = _sessionModalService_
      $injector = _$injector_
      jest.spyOn(sessionModalService, 'resetPassword').mockImplementation(() => {})
    }))

    it('calls sessionModalService.resetPassword()', () => {
      const fn = modalStateServiceProvider.registerModal.mock.calls[0][1]
      $injector.invoke(fn)

      expect(sessionModalService.resetPassword).toHaveBeenCalled()
    })
  })
})
