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
      orderService: {
        getDonorDetails: jest.fn(),
        updateDonorDetails: jest.fn(),
        addEmail: jest.fn()
      },
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
      jest.spyOn($ctrl, 'checkDonorDetails').mockImplementation(() => {})
      jest.spyOn($ctrl, 'stateChanged').mockImplementation(() => {})
    })

    it('should get donor details', () => {
      $ctrl.$onInit()
      expect($ctrl.checkDonorDetails).not.toHaveBeenCalled()
      $rootScope.$broadcast(LoginOktaOnlyEvent)
      expect($ctrl.checkDonorDetails).toHaveBeenCalled()
    })

    it('should load donor details initially and reload when session changes', () => {
      $ctrl.sessionService.getRole.mockReturnValue(Roles.registered)

      $ctrl.$onInit()
      expect($ctrl.checkDonorDetails).toHaveBeenCalledTimes(1)
      $ctrl.sessionService.sessionSubject.next({})
      expect($ctrl.checkDonorDetails).toHaveBeenCalledTimes(2)
    })

    describe('with \'REGISTERED\' cortex-session', () => {
      beforeEach(() => {
        $ctrl.sessionService.getRole.mockReturnValue(Roles.registered)
        $ctrl.$onInit()
      })

      it('proceeds to donor details', () => {
        expect($ctrl.checkDonorDetails).toHaveBeenCalled()
        expect($ctrl.stateChanged).not.toHaveBeenCalled()
      })
    })

    describe('with \'PUBLIC\' cortex-session', () => {
      beforeEach(() => {
        $ctrl.sessionService.getRole.mockReturnValue(Roles.public)
        $ctrl.$onInit()
      })

      it('proceeds to sign-in', () => {
        expect($ctrl.checkDonorDetails).not.toHaveBeenCalled()
        expect($ctrl.stateChanged).toHaveBeenCalledWith('sign-in')
      })

      it('proceeds to contact-info', () => {
        $ctrl.sessionService.sessionSubject.next({
          firstName: 'Daniel'
        })
        expect($ctrl.checkDonorDetails).not.toHaveBeenCalled()

        $ctrl.sessionService.getRole.mockReturnValue(Roles.registered)
        $ctrl.sessionService.sessionSubject.next({
          firstName: 'Daniel'
        })
        expect($ctrl.checkDonorDetails).toHaveBeenCalled()
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
      $ctrl.checkDonorDetails()
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
    it('calls checkDonorDetails', () => {
      jest.spyOn($ctrl, 'checkDonorDetails').mockImplementation(() => {})
      $ctrl.onIdentitySuccess()
      expect($ctrl.checkDonorDetails).toHaveBeenCalled()
    });
  })

  describe('onIdentityFailure()', () => {
    it('calls checkDonorDetails', () => {
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

  describe('checkDonorDetails()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'stateChanged').mockImplementation(() => {})
    })

    describe('orderService.checkDonorDetails success', () => {
      describe('\'registration-state\' COMPLETED', () => {
        it('changes state to \'contact-info\'', () => {
          $ctrl.orderService.getDonorDetails.mockImplementation(() => Observable.of({ 'registration-state': 'COMPLETED' }))
          $ctrl.checkDonorDetails()

          expect($ctrl.stateChanged).toHaveBeenCalledWith('loading-donor')
          expect($ctrl.stateChanged.mock.calls.length).toEqual(1)
          expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled()
          expect($ctrl.onSuccess).toHaveBeenCalled()
        })
      })
    })

    describe('\'registration-state\' MATCHED', () => {
      it('changes state to \'user-match\'', () => {
        $ctrl.orderService.getDonorDetails.mockImplementation(() => Observable.of({ 'registration-state': 'MATCHED' }))
        $ctrl.verificationService.postDonorMatches.mockImplementation(() => Observable.of({}))
        $ctrl.checkDonorDetails()

        expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled()
        expect($ctrl.stateChanged).toHaveBeenCalledWith('user-match')
      })
    })

    describe('\'registration-state\' NEW', () => {
      const signUpDonorDetails = {
        name: {
          'given-name': 'First',
          'family-name': 'Last'
        },
        'donor-type': 'Household',
        email: 'first.last@cru.org',
        phone: '111-222-3333',
        mailingAddress: {
          streetAddress: '123 First St',
          locality: 'Orlando',
          region: 'FL',
          postalCode: '12345',
          country: 'US'
        }
      }

      const emailFormUri = '/emails/crugive'

      beforeEach(() => {
        $ctrl.orderService.getDonorDetails.mockImplementation(() => Observable.of({
          'registration-state': 'NEW',
          name: {
            'given-name': 'Existing',
            'family-name': 'Existing'
          },
          'donor-type': '',
          email: 'existing.email@cru.org',
          phone: '',
          mailingAddress: {
            streetAddress: '',
            locality: '',
            region: '',
            postalCode: '',
            country: 'CANADA'
          },
          emailFormUri
        }))
        $ctrl.orderService.addEmail.mockImplementation(() => Observable.of({}))
      })

      describe('with sign up details', () => {
        it('saves sign up contact info merged with existing contact info', () => {
          $ctrl.checkDonorDetails(signUpDonorDetails)

          expect($ctrl.orderService.updateDonorDetails).toHaveBeenCalledWith(expect.objectContaining(signUpDonorDetails))
          expect($ctrl.orderService.addEmail).toHaveBeenCalledWith(signUpDonorDetails.email, emailFormUri)
          expect($ctrl.stateChanged).toHaveBeenCalledWith('contact-info')
        })

        it('remembers contact info after error', () => {
          $ctrl.orderService.addEmail.mockImplementation(() => Observable.throw(new Error('Error adding email')))

          $ctrl.checkDonorDetails(signUpDonorDetails)

          expect($ctrl.signUpDonorDetails).toBe(signUpDonorDetails)
          expect($ctrl.stateChanged).toHaveBeenCalledWith('contact-info')
        })
      })

      it('changes state to \'contact-info\'', () => {
        $ctrl.checkDonorDetails()

        expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled()
        expect($ctrl.stateChanged).toHaveBeenCalledWith('contact-info')
      })
    })

    describe('\'registration-state\' FAILED', () => {
      it('changes state to \'failed-verification\'', () => {
        $ctrl.orderService.getDonorDetails.mockImplementation(() => Observable.of({ 'registration-state': 'FAILED' }))
        $ctrl.checkDonorDetails()

        expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled()
        expect($ctrl.stateChanged).toHaveBeenCalledWith('failed-verification')
      })
    })

    describe('orderService.checkDonorDetails failure', () => {
      it('changes state to \'contact-info\'', () => {
        $ctrl.orderService.getDonorDetails.mockImplementation(() => Observable.throw({}))
        $ctrl.checkDonorDetails()

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
    let originalWidth

    beforeEach(() => {
      originalWidth = $ctrl.$window.innerWidth

      $ctrl.state = 'unknown'
      jest.spyOn($ctrl, 'setModalSize').mockImplementation(() => {})
      jest.spyOn($ctrl, 'scrollModalToTop').mockImplementation(() => {})
    })

    afterEach(() => {
      $ctrl.$window.innerWidth = originalWidth
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

      expect($ctrl.setModalSize).toHaveBeenCalledWith('sm')
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
      expect($ctrl.state).toEqual('sign-up')
    })

    it('changes to \'contact-info\' state', () => {
      $ctrl.stateChanged('contact-info')

      expect($ctrl.setModalSize).toHaveBeenCalledWith('md')
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
      expect($ctrl.state).toEqual('contact-info')
    })

    it('changes to \'failed-verification\' state', () => {
      $ctrl.stateChanged('failed-verification')

      expect($ctrl.setModalSize).toHaveBeenCalledWith('sm')
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
      expect($ctrl.state).toEqual('failed-verification')
    })

    describe('when welcomeBack is true', () => {
      beforeEach(() => {
        $ctrl.welcomeBack = true
      })

      it('sets the sign-in modal size to large on wide screens', () => {
        $ctrl.$window.innerWidth = 1200
        $ctrl.stateChanged('sign-in')

        expect($ctrl.setModalSize).toHaveBeenCalledWith('lg')
      })

      it('sets the sign-in modal size to small on narrow screens', () => {
        $ctrl.stateChanged('sign-in')

        expect($ctrl.setModalSize).toHaveBeenCalledWith('sm')
      })

      it('sets the sign-up modal size to small', () => {
        $ctrl.stateChanged('sign-up')

        expect($ctrl.setModalSize).toHaveBeenCalledWith('sm')
      })

      it('sets the contact-info modal size to medium', () => {
        $ctrl.stateChanged('contact-info')

        expect($ctrl.setModalSize).toHaveBeenCalledWith('md')
      })
    })

    describe('when the screen is wide', () => {
      beforeEach(() => {
        $ctrl.$window.innerWidth = 1200
      })

      it('sets the sign-in modal size to small', () => {
        $ctrl.stateChanged('sign-in')

        expect($ctrl.setModalSize).toHaveBeenCalledWith('sm')
      })

      it('sets the sign-up modal size to small', () => {
        $ctrl.stateChanged('sign-up')

        expect($ctrl.setModalSize).toHaveBeenCalledWith('sm')
      })

      it('sets the contact-info modal size to large', () => {
        $ctrl.stateChanged('contact-info')

        expect($ctrl.setModalSize).toHaveBeenCalledWith('lg')
      })
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
  })
})
