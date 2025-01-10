import angular from 'angular'
import 'angular-mocks'
import module from './registerAccountModal.component'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/throw'
import { Roles, LoginOktaOnlyEvent } from 'common/services/session/session.service'

describe('registerAccountModal', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, $rootScope, bindings, locals

  beforeEach(inject(function (_$componentController_, _$rootScope_) {
    $rootScope = _$rootScope_
    bindings = {
      modalTitle: '',
      onCancel: jest.fn(),
      onSuccess: jest.fn(),
      setLoading: jest.fn()
    }
    locals = {
      $element: [{ dataset: {} }],
      orderService: { getDonorDetails: jest.fn() },
      verificationService: { postDonorMatches: jest.fn() },
      sessionService: {
        getRole: jest.fn(),
        isOktaRedirecting: jest.fn(),
        removeOktaRedirectIndicator: jest.fn(),
        sessionSubject: new BehaviorSubject({})
      },
      cartService: {
        getTotalQuantity: () => new BehaviorSubject(1)
      }
    }
    $ctrl = _$componentController_(module.name, locals, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
    expect($ctrl.orderService).toEqual(locals.orderService)
    expect($ctrl.verificationService).toEqual(locals.verificationService)
    expect($ctrl.sessionService).toEqual(locals.sessionService)
  })

  describe('$onInit()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'getDonorDetails').mockImplementation(() => {})
      jest.spyOn($ctrl, 'stateChanged').mockImplementation(() => {})
    })

    it('should get donor details', () => {
      $ctrl.$onInit()
      expect($ctrl.getDonorDetails).not.toHaveBeenCalled()
      $rootScope.$broadcast(LoginOktaOnlyEvent)
      expect($ctrl.getDonorDetails).toHaveBeenCalled()
    })

    describe('with \'REGISTERED\' cortex-session', () => {
      beforeEach(() => {
        $ctrl.sessionService.getRole.mockReturnValue(Roles.registered)
        $ctrl.$onInit()
      })

      it('proceeds to donor details', () => {
        expect($ctrl.getDonorDetails).toHaveBeenCalled()
        expect($ctrl.stateChanged).not.toHaveBeenCalled()
      })
    })

    describe('with \'PUBLIC\' cortex-session', () => {
      beforeEach(() => {
        $ctrl.sessionService.getRole.mockReturnValue(Roles.public)
        $ctrl.$onInit()
      })

      it('proceeds to sign-in', () => {
        expect($ctrl.getDonorDetails).not.toHaveBeenCalled()
        expect($ctrl.stateChanged).toHaveBeenCalledWith('sign-in')
      })

      it('proceeds to contact-info', () => {
        $ctrl.sessionService.sessionSubject.next({
          firstName: 'Daniel'
        })
        expect($ctrl.getDonorDetails).not.toHaveBeenCalled()

        $ctrl.sessionService.getRole.mockReturnValue(Roles.registered)
        $ctrl.sessionService.sessionSubject.next({
          firstName: 'Daniel'
        })
        expect($ctrl.getDonorDetails).toHaveBeenCalled()
      })
    })

    describe('Get cart count', () => {
      it('Gets cart count', () => {
        jest.spyOn($ctrl.cartService, 'getTotalQuantity').mockReturnValue(Observable.of(3))
        $ctrl.$onInit()
        expect($ctrl.cartCount).toEqual(3)
      });

      it('should show 0 cart items', () => {
        jest.spyOn($ctrl.cartService, 'getTotalQuantity').mockReturnValue(Observable.throw({status: 404}))
        $ctrl.$onInit()
        expect($ctrl.cartCount).toEqual(0)
      });
    })
  })

  describe('$onDestroy()', () => {
    it('should close all subscriptions', () => {
      $ctrl.orderService.getDonorDetails.mockImplementation(() => Observable.of({ }))
      $ctrl.verificationService.postDonorMatches.mockImplementation(() => Observable.of({}))
      $ctrl.$onInit()
      $ctrl.getDonorDetails()
      $ctrl.postDonorMatches()
      expect($ctrl.getTotalQuantitySubscription.closed).toEqual(false)
      expect($ctrl.subscription.closed).toEqual(false)
      // getDonorDetailsSubscription & verificationServiceSubscription are already closed
      $ctrl.$onDestroy()
      expect($ctrl.getTotalQuantitySubscription.closed).toEqual(true)
      expect($ctrl.subscription.closed).toEqual(true)
      expect($ctrl.getDonorDetailsSubscription.closed).toEqual(true)
      expect($ctrl.verificationServiceSubscription.closed).toEqual(true)
    })
  })

  describe('onIdentitySuccess()', () => {
    it('calls getDonorDetails', () => {
      jest.spyOn($ctrl, 'getDonorDetails').mockImplementation(() => {})
      $ctrl.onIdentitySuccess()
      expect($ctrl.getDonorDetails).toHaveBeenCalled()
    });
  })

  describe('onIdentityFailure()', () => {
    it('calls getDonorDetails', () => {
      jest.spyOn($ctrl.sessionService, 'removeOktaRedirectIndicator')
      $ctrl.onIdentityFailure()
      expect($ctrl.sessionService.removeOktaRedirectIndicator).toHaveBeenCalled()
    })
  })

  describe('onContactInfoSuccess()', () => {
    it('calls postDonorMatches', () => {
      jest.spyOn($ctrl, 'postDonorMatches').mockImplementation(() => {})
      $ctrl.onContactInfoSuccess()

      expect($ctrl.postDonorMatches).toHaveBeenCalled()
    })
  })

  describe('onContactInfoSuccess()', () => {
    it('calls postDonorMatches', () => {
      jest.spyOn($ctrl, 'postDonorMatches').mockImplementation(() => {})
      $ctrl.onContactInfoSuccess()

      expect($ctrl.postDonorMatches).toHaveBeenCalled()
    })
  })

  describe('onUserMatchSuccess()', () => {
    it('calls onSuccess', () => {
      $ctrl.onUserMatchSuccess()

      expect($ctrl.onSuccess).toHaveBeenCalled()
    })
  })

  describe('getDonorDetails()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'stateChanged').mockImplementation(() => {})
    })

    describe('orderService.getDonorDetails success', () => {
      describe('\'registration-state\' COMPLETED', () => {
        it('changes state to \'contact-info\'', () => {
          $ctrl.orderService.getDonorDetails.mockImplementation(() => Observable.of({ 'registration-state': 'COMPLETED' }))
          $ctrl.getDonorDetails()

          expect($ctrl.modalTitle).toEqual('Checking your donor account')
          expect($ctrl.stateChanged).toHaveBeenCalledWith('loading')
          expect($ctrl.stateChanged.mock.calls.length).toEqual(1)
          expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled()
          expect($ctrl.onSuccess).toHaveBeenCalled()
        })
      })

      describe('\'registration-state\' NEW', () => {
        it('changes state to \'contact-info\'', () => {
          $ctrl.orderService.getDonorDetails.mockImplementation(() => Observable.of({ 'registration-state': 'NEW' }))
          $ctrl.getDonorDetails()

          expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled()
          expect($ctrl.stateChanged).toHaveBeenCalledWith('contact-info')
        })
      })
    })

    describe('\'registration-state\' FAILED', () => {
      it('changes state to \'failed-verification\'', () => {
        $ctrl.orderService.getDonorDetails.mockImplementation(() => Observable.of({ 'registration-state': 'FAILED' }))
        $ctrl.getDonorDetails()

        expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled()
        expect($ctrl.stateChanged).toHaveBeenCalledWith('failed-verification')
      })
    })

    describe('orderService.getDonorDetails failure', () => {
      it('changes state to \'contact-info\'', () => {
        $ctrl.orderService.getDonorDetails.mockImplementation(() => Observable.throw({}))
        $ctrl.getDonorDetails()

        expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled()
        expect($ctrl.stateChanged).toHaveBeenCalledWith('contact-info')
      })
    })
  })

  describe('postDonorMatches()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'stateChanged').mockImplementation(() => {})
    })

    describe('verificationService.postDonorMatches success', () => {
      it('changes state to \'user-match\'', () => {
        $ctrl.verificationService.postDonorMatches.mockImplementation(() => Observable.of({}))
        $ctrl.postDonorMatches()

        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
        expect($ctrl.verificationService.postDonorMatches).toHaveBeenCalled()
        expect($ctrl.stateChanged).toHaveBeenCalledWith('user-match')
      })
    })

    describe('verificationService.postDonorMatches failure', () => {
      it('calls onCancel', () => {
        $ctrl.verificationService.postDonorMatches.mockImplementation(() => Observable.throw({}))
        $ctrl.postDonorMatches()

        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
        expect($ctrl.verificationService.postDonorMatches).toHaveBeenCalled()
        expect($ctrl.stateChanged).not.toHaveBeenCalled()
        expect($ctrl.onCancel).toHaveBeenCalled()
      })
    })
  })

  describe('stateChanged( state )', () => {
    beforeEach(() => {
      $ctrl.state = 'unknown'
      jest.spyOn($ctrl, 'setModalSize').mockImplementation(() => {})
      jest.spyOn($ctrl, 'scrollModalToTop').mockImplementation(() => {})
    })

    it('should scroll to the top of the modal', () => {
      $ctrl.stateChanged()

      expect($ctrl.scrollModalToTop).toHaveBeenCalled()
    })

    it('changes to \'sign-in\' state', () => {
      $ctrl.stateChanged('sign-in')

      expect($ctrl.setModalSize).toHaveBeenCalledWith('sm')
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
      expect($ctrl.state).toEqual('sign-in')
    })

    it('changes to \'sign-up\' state', () => {
      $ctrl.stateChanged('sign-up')

      expect($ctrl.setModalSize).toHaveBeenCalledWith('md')
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
      expect($ctrl.state).toEqual('sign-up')
    })

    it('changes to \'contact-info\' state', () => {
      $ctrl.stateChanged('contact-info')

      expect($ctrl.setModalSize).toHaveBeenCalledWith(undefined)
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
      expect($ctrl.state).toEqual('contact-info')
    })

    it('changes to \'failed-verification\' state', () => {
      $ctrl.stateChanged('failed-verification')

      expect($ctrl.setModalSize).toHaveBeenCalledWith('sm')
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
      expect($ctrl.state).toEqual('failed-verification')
    })
  })

  describe('setModalSize( size )', () => {
    let modal
    beforeEach(() => {
      modal = { addClass: jest.fn(), removeClass: jest.fn(), data: jest.fn() }
      jest.spyOn(angular, 'element').mockReturnValue(modal)
      angular.element.cleanData = jest.fn()
    })

    it('sets size to \'sm\'', () => {
      $ctrl.setModalSize('sm')

      expect(modal.removeClass).toHaveBeenCalledWith('modal-sm modal-md modal-lg')
      expect(modal.addClass).toHaveBeenCalledWith('modal-sm')
    })

    it('sets size missing param', () => {
      $ctrl.setModalSize()

      expect(modal.removeClass).toHaveBeenCalledWith('modal-sm modal-md modal-lg')
      expect(modal.addClass).not.toHaveBeenCalled()
    })
  })
})
