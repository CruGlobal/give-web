import angular from 'angular';
import 'angular-mocks';
import module from './registerAccountModal.component';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/throw';
import { Roles } from 'common/services/session/session.service';

describe('registerAccountModal', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl, $rootScope, bindings, locals;

  beforeEach(inject(function (_$componentController_, _$rootScope_) {
    $rootScope = _$rootScope_;
    bindings = {
      modalTitle: '',
      onCancel: jest.fn(),
      onSuccess: jest.fn(),
      setLoading: jest.fn(),
    };
    locals = {
      $element: [{ dataset: {} }],
      orderService: {
        getDonorDetails: jest.fn(),
        updateDonorDetails: jest.fn(),
        addEmail: jest.fn(),
      },
      verificationService: { postDonorMatches: jest.fn() },
      sessionService: {
        getRole: jest.fn(),
        isOktaRedirecting: jest.fn(),
        removeOktaRedirectIndicator: jest.fn(),
        signIn: jest.fn(),
        sessionSubject: new BehaviorSubject({}),
      },
      cartService: {
        getTotalQuantity: () => new BehaviorSubject(1),
      },
    };
    $ctrl = _$componentController_(module.name, locals, bindings);
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
    expect($ctrl.orderService).toEqual(locals.orderService);
    expect($ctrl.verificationService).toEqual(locals.verificationService);
    expect($ctrl.sessionService).toEqual(locals.sessionService);
  });

  describe('$onInit()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'checkDonorDetails').mockImplementation(() => {});
      jest.spyOn($ctrl, 'stateChanged').mockImplementation(() => {});
    });

    it('should get donor details', () => {
      $ctrl.$onInit();
      expect($ctrl.checkDonorDetails).not.toHaveBeenCalled();
    });

    it('should load donor details initially and reload when session changes', () => {
      $ctrl.sessionService.getRole.mockReturnValue(Roles.registered);

      $ctrl.$onInit();
      expect($ctrl.checkDonorDetails).toHaveBeenCalledTimes(1);
      $ctrl.sessionService.sessionSubject.next({});
      expect($ctrl.checkDonorDetails).toHaveBeenCalledTimes(2);
    });

    describe("with 'REGISTERED' cortex-session", () => {
      beforeEach(() => {
        $ctrl.sessionService.getRole.mockReturnValue(Roles.registered);
        $ctrl.$onInit();
      });

      it('proceeds to donor details', () => {
        expect($ctrl.checkDonorDetails).toHaveBeenCalled();
        expect($ctrl.stateChanged).not.toHaveBeenCalled();
      });
    });

    describe("with 'PUBLIC' cortex-session", () => {
      beforeEach(() => {
        $ctrl.sessionService.getRole.mockReturnValue(Roles.public);
      });

      it('proceeds to sign-in', () => {
        $ctrl.$onInit();

        expect($ctrl.checkDonorDetails).not.toHaveBeenCalled();
        expect($ctrl.stateChanged).toHaveBeenCalledWith('sign-in');
      });

      it('proceeds to sign-up if showSignUp is true', () => {
        $ctrl.showSignUp = true;
        $ctrl.$onInit();

        expect($ctrl.stateChanged).toHaveBeenCalledWith('sign-up');
      });

      it('proceeds to contact-info', () => {
        $ctrl.$onInit();
        $ctrl.sessionService.sessionSubject.next({
          firstName: 'Daniel',
        });
        expect($ctrl.checkDonorDetails).not.toHaveBeenCalled();

        $ctrl.sessionService.getRole.mockReturnValue(Roles.registered);
        $ctrl.sessionService.sessionSubject.next({
          firstName: 'Daniel',
        });
        expect($ctrl.checkDonorDetails).toHaveBeenCalled();
      });
    });

    describe('Get cart count', () => {
      it('Gets cart count', () => {
        jest
          .spyOn($ctrl.cartService, 'getTotalQuantity')
          .mockReturnValue(Observable.of(3));
        $ctrl.$onInit();
        expect($ctrl.cartCount).toEqual(3);
      });

      it('should show 0 cart items', () => {
        jest
          .spyOn($ctrl.cartService, 'getTotalQuantity')
          .mockReturnValue(Observable.throw({ status: 404 }));
        $ctrl.$onInit();
        expect($ctrl.cartCount).toEqual(0);
      });
    });
  });

  describe('$onDestroy()', () => {
    it('should close all subscriptions', () => {
      $ctrl.orderService.getDonorDetails.mockImplementation(() =>
        Observable.of({}),
      );
      $ctrl.verificationService.postDonorMatches.mockImplementation(() =>
        Observable.of({}),
      );
      $ctrl.$onInit();
      $ctrl.checkDonorDetails();
      $ctrl.postDonorMatches();
      expect($ctrl.getTotalQuantitySubscription.closed).toEqual(false);
      expect($ctrl.subscription.closed).toEqual(false);
      // getDonorDetailsSubscription & verificationServiceSubscription are already closed
      $ctrl.$onDestroy();
      expect($ctrl.getTotalQuantitySubscription.closed).toEqual(true);
      expect($ctrl.subscription.closed).toEqual(true);
      expect($ctrl.getDonorDetailsSubscription.closed).toEqual(true);
      expect($ctrl.verificationServiceSubscription.closed).toEqual(true);
    });
  });

  describe('onSignUpError()', () => {
    it('should save donor details and record that an error occurred', () => {
      jest.spyOn($ctrl, 'stateChanged');
      const donorDetails = {
        name: {
          'given-name': 'First',
          'family-name': 'Last',
        },
        'donor-type': 'Household',
        email: 'email',
        mailingAddress: {
          streetAddress: '123 First St',
          locality: 'Orlando',
          region: 'FL',
          postalCode: '12345',
          country: 'US',
        },
      };
      expect($ctrl.signUpDonorDetails).toBe(undefined);
      expect($ctrl.cortexSignUpError).toBe(undefined);

      $ctrl.onSignUpError(donorDetails);

      expect($ctrl.signUpDonorDetails).toBe(donorDetails);
      expect($ctrl.cortexSignUpError).toBe(true);
      expect($ctrl.stateChanged).toHaveBeenCalledWith('contact-info');
    });
  });

  describe('onIdentitySuccess()', () => {
    it('calls checkDonorDetails', () => {
      jest.spyOn($ctrl, 'checkDonorDetails').mockImplementation(() => {});
      $ctrl.onIdentitySuccess();
      expect($ctrl.checkDonorDetails).toHaveBeenCalled();
    });
  });

  describe('onIdentityFailure()', () => {
    it('calls checkDonorDetails', () => {
      jest.spyOn($ctrl.sessionService, 'removeOktaRedirectIndicator');
      $ctrl.onIdentityFailure();
      expect(
        $ctrl.sessionService.removeOktaRedirectIndicator,
      ).toHaveBeenCalled();
    });
  });

  describe('onContactInfoSuccess()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'postDonorMatches').mockImplementation(() => {});
      jest.spyOn($ctrl, 'redirectToOktaForLogin').mockImplementation(() => {});
    });
    it('calls postDonorMatches', () => {
      $ctrl.onContactInfoSuccess();

      expect($ctrl.postDonorMatches).toHaveBeenCalled();
      expect($ctrl.redirectToOktaForLogin).not.toHaveBeenCalled();
    });
    it('calls redirectToOktaForLogin when registration error occurred.', () => {
      $ctrl.cortexSignUpError = true;
      $ctrl.onContactInfoSuccess();

      expect($ctrl.redirectToOktaForLogin).toHaveBeenCalled();
      expect($ctrl.postDonorMatches).not.toHaveBeenCalled();
    });
  });

  describe('onContactInfoSuccess()', () => {
    it('calls postDonorMatches', () => {
      jest.spyOn($ctrl, 'postDonorMatches').mockImplementation(() => {});
      $ctrl.onContactInfoSuccess();

      expect($ctrl.postDonorMatches).toHaveBeenCalled();
    });
  });

  describe('onUserMatchSuccess()', () => {
    it('calls onSuccess', () => {
      $ctrl.onUserMatchSuccess();

      expect($ctrl.onSuccess).toHaveBeenCalled();
    });
  });

  describe('checkDonorDetails()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'stateChanged').mockImplementation(() => {});
    });

    describe('orderService.checkDonorDetails success', () => {
      describe("'registration-state' COMPLETED", () => {
        it("changes state to 'contact-info'", () => {
          $ctrl.orderService.getDonorDetails.mockImplementation(() =>
            Observable.of({ 'registration-state': 'COMPLETED' }),
          );
          $ctrl.checkDonorDetails();

          expect($ctrl.stateChanged).toHaveBeenCalledWith('loading-donor');
          expect($ctrl.stateChanged.mock.calls.length).toEqual(1);
          expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled();
          expect($ctrl.onSuccess).toHaveBeenCalled();
        });
      });
    });

    describe("'registration-state' MATCHED", () => {
      it("changes state to 'user-match'", () => {
        $ctrl.orderService.getDonorDetails.mockImplementation(() =>
          Observable.of({ 'registration-state': 'MATCHED' }),
        );
        $ctrl.verificationService.postDonorMatches.mockImplementation(() =>
          Observable.of({}),
        );
        $ctrl.checkDonorDetails();

        expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled();
        expect($ctrl.stateChanged).toHaveBeenCalledWith('user-match');
      });
    });

    describe("'registration-state' NEW", () => {
      it("changes state to 'contact-info'", () => {
        $ctrl.orderService.getDonorDetails.mockImplementation(() =>
          Observable.of({
            'registration-state': 'NEW',
          }),
        );
        $ctrl.checkDonorDetails();

        expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled();
        expect($ctrl.stateChanged).toHaveBeenCalledWith('contact-info');
      });
    });

    describe("'registration-state' FAILED", () => {
      it("changes state to 'user-match'", () => {
        $ctrl.orderService.getDonorDetails.mockImplementation(() =>
          Observable.of({ 'registration-state': 'FAILED' }),
        );
        $ctrl.checkDonorDetails();

        expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled();
        expect($ctrl.stateChanged).toHaveBeenCalledWith('user-match');
      });
    });

    describe('orderService.checkDonorDetails failure', () => {
      it("changes state to 'contact-info'", () => {
        $ctrl.orderService.getDonorDetails.mockImplementation(() =>
          Observable.throw({}),
        );
        $ctrl.checkDonorDetails();

        expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled();
        expect($ctrl.stateChanged).toHaveBeenCalledWith('contact-info');
      });
    });
  });

  describe('postDonorMatches()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'stateChanged').mockImplementation(() => {});
    });

    describe('verificationService.postDonorMatches success', () => {
      it("changes state to 'user-match'", () => {
        $ctrl.verificationService.postDonorMatches.mockImplementation(() =>
          Observable.of({}),
        );
        $ctrl.postDonorMatches();

        expect($ctrl.verificationService.postDonorMatches).toHaveBeenCalled();
        expect($ctrl.stateChanged).toHaveBeenCalledWith('user-match');
      });
    });

    describe('verificationService.postDonorMatches failure', () => {
      it('calls onCancel', () => {
        $ctrl.verificationService.postDonorMatches.mockImplementation(() =>
          Observable.throw({}),
        );
        $ctrl.postDonorMatches();

        expect($ctrl.verificationService.postDonorMatches).toHaveBeenCalled();
        expect($ctrl.stateChanged).not.toHaveBeenCalled();
        expect($ctrl.onCancel).toHaveBeenCalled();
      });
    });
  });

  describe('stateChanged( state )', () => {
    let originalWidth;

    beforeEach(() => {
      originalWidth = $ctrl.$window.innerWidth;

      $ctrl.state = 'unknown';
      jest.spyOn($ctrl, 'setModalSize').mockImplementation(() => {});
      jest.spyOn($ctrl, 'scrollModalToTop').mockImplementation(() => {});
    });

    afterEach(() => {
      $ctrl.$window.innerWidth = originalWidth;
    });

    it('should scroll to the top of the modal', () => {
      $ctrl.stateChanged();

      expect($ctrl.scrollModalToTop).toHaveBeenCalled();
    });

    it("changes to 'sign-in' state", () => {
      $ctrl.stateChanged('sign-in');

      expect($ctrl.setModalSize).toHaveBeenCalledWith('md');
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });
      expect($ctrl.state).toEqual('sign-in');
    });

    it("changes to 'sign-up' state", () => {
      $ctrl.stateChanged('sign-up');

      expect($ctrl.setModalSize).toHaveBeenCalledWith('md');
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });
      expect($ctrl.state).toEqual('sign-up');
    });

    it("changes to 'contact-info' state", () => {
      $ctrl.stateChanged('contact-info');

      expect($ctrl.setModalSize).toHaveBeenCalledWith('lg');
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });
      expect($ctrl.state).toEqual('contact-info');
    });

    it("changes to 'user-match' state", () => {
      $ctrl.stateChanged('user-match');

      expect($ctrl.setModalSize).toHaveBeenCalledWith('md');
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });
      expect($ctrl.state).toEqual('user-match');
    });

    it('sets the sign-in modal size to medium', () => {
      $ctrl.stateChanged('sign-in');

      expect($ctrl.setModalSize).toHaveBeenCalledWith('md');
    });

    it('sets the sign-up modal size to medium', () => {
      $ctrl.stateChanged('sign-up');

      expect($ctrl.setModalSize).toHaveBeenCalledWith('md');
    });

    it('sets the contact-info modal size to large', () => {
      $ctrl.stateChanged('contact-info');

      expect($ctrl.setModalSize).toHaveBeenCalledWith('lg');
    });
  });

  describe('setModalSize( size )', () => {
    let modal;
    beforeEach(() => {
      modal = { addClass: jest.fn(), removeClass: jest.fn(), data: jest.fn() };
      jest.spyOn(angular, 'element').mockReturnValue(modal);
      angular.element.cleanData = jest.fn();
    });

    it("sets size to 'sm'", () => {
      $ctrl.setModalSize('sm');

      expect(modal.removeClass).toHaveBeenCalledWith(
        'modal-sm modal-md modal-lg',
      );
      expect(modal.addClass).toHaveBeenCalledWith('modal-sm');
    });
  });

  describe('redirectToOktaForLogin', () => {
    it('should call sessionService.signIn', () => {
      jest
        .spyOn($ctrl.sessionService, 'signIn')
        .mockReturnValue(Observable.of({}));
      $ctrl.redirectToOktaForLogin();
      expect($ctrl.sessionService.signIn).toHaveBeenCalledWith(
        $ctrl.lastPurchaseId,
      );
    });
  });
});
