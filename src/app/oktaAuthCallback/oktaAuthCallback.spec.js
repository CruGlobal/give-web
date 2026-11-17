import angular from 'angular';
import 'angular-mocks';
import module, {
  unknownErrorMessage,
  checkoutUrlWithoutOktaParams,
} from './oktaAuthCallback.component';
import { Roles } from 'common/services/session/session.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import { user } from '../../common/components/signUpModal/signUpModal.component.mock';

const mockDonorDetails = {
  name: {
    'given-name': user.firstName,
    'family-name': user.lastName,
  },
  'donor-type': user.accountType,
  email: user.email,
  mailingAddress: {
    streetAddress: user.streetAddress,
    locality: user.city,
    region: user.state,
    postalCode: user.zipCode,
    country: user.countryCode,
  },
};

describe('oktaAuthCallback', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl, $rootScope, $log, orderService, verificationService;

  beforeEach(inject(function (
    _$componentController_,
    _$rootScope_,
    _$log_,
    _orderService_,
    _verificationService_,
  ) {
    $rootScope = _$rootScope_;
    $log = _$log_;
    orderService = _orderService_;
    verificationService = _verificationService_;
    $ctrl = _$componentController_(module.name, {
      $log,
      $window: {
        location: { replace: jest.fn() },
        localStorage: {
          getItem: jest.fn(),
          removeItem: jest.fn(),
        },
      },
    });
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  describe('$onInit', () => {
    it('should call onSignInSuccess when handleOktaRedirect returns successfully', () => {
      jest.spyOn($ctrl, 'onSignInSuccess').mockImplementation(() => {});
      jest
        .spyOn($ctrl.sessionService, 'handleOktaRedirect')
        .mockReturnValue(Observable.of('data'));

      $ctrl.$onInit();
      $rootScope.$digest();

      expect($ctrl.onSignInSuccess).toHaveBeenCalledWith('data');
    });

    it('should call onSignInFailure when handleOktaRedirect returns an error', () => {
      jest.spyOn($ctrl, 'onSignInFailure').mockImplementation(() => {});
      jest
        .spyOn($ctrl.sessionService, 'handleOktaRedirect')
        .mockReturnValue(Observable.throw('error'));

      $ctrl.$onInit();
      $rootScope.$digest();

      expect($ctrl.onSignInFailure).toHaveBeenCalledWith('error');
    });
  });

  describe('checkoutUrlWithoutOktaParams()', () => {
    it('returns plain checkout when there is no query string', () => {
      expect(checkoutUrlWithoutOktaParams('')).toEqual('/checkout.html');
    });

    it('drops the Okta code and state', () => {
      expect(checkoutUrlWithoutOktaParams('?code=a&state=b')).toEqual(
        '/checkout.html',
      );
    });

    it('keeps other query parameters', () => {
      expect(
        checkoutUrlWithoutOktaParams('?code=a&state=b&ga=111&query=test'),
      ).toEqual('/checkout.html?ga=111&query=test');
    });

    it('drops the Okta error parameters', () => {
      expect(
        checkoutUrlWithoutOktaParams(
          '?error=access_denied&error_description=Not+assigned&state=b',
        ),
      ).toEqual('/checkout.html');
    });

    it('drops an interaction code', () => {
      expect(
        checkoutUrlWithoutOktaParams('?interaction_code=x&state=b'),
      ).toEqual('/checkout.html');
    });
  });

  describe('replayed callback', () => {
    beforeEach(() => {
      $ctrl.$window.location.search = '?code=new-code&state=state-1';
      $ctrl.$window.performance = {
        getEntriesByType: jest.fn().mockReturnValue([{ type: 'back_forward' }]),
      };
      $ctrl.datadogRum = { addAction: jest.fn() };
      jest
        .spyOn($ctrl.sessionService, 'isOktaRedirectReplay')
        .mockReturnValue(true);
      jest.spyOn($ctrl.sessionService, 'handleOktaRedirect');
      ['error', 'warn', 'info'].forEach((level) =>
        jest.spyOn($log, level).mockImplementation(() => {}),
      );
    });

    const expectNoErrorShownOrLogged = () => {
      expect($ctrl.errorMessage).toEqual('');
      expect($log.error).not.toHaveBeenCalled();
      expect($log.warn).not.toHaveBeenCalled();
      expect($log.info).not.toHaveBeenCalled();
    };

    it('sends a signed-in donor back to the page they signed in from', () => {
      jest
        .spyOn($ctrl.sessionService, 'getRole')
        .mockReturnValue(Roles.registered);
      jest
        .spyOn($ctrl.sessionService, 'getSignInStartLocation')
        .mockReturnValue('https://give-stage2.cru.org/search-results.html');

      $ctrl.$onInit();

      expect($ctrl.$window.location.replace).toHaveBeenCalledTimes(1);
      expect($ctrl.$window.location.replace).toHaveBeenCalledWith(
        'https://give-stage2.cru.org/search-results.html',
      );
      expect($ctrl.sessionService.handleOktaRedirect).not.toHaveBeenCalled();
      expectNoErrorShownOrLogged();
    });

    it('sends a signed-in donor to checkout when no sign-in page was saved', () => {
      jest
        .spyOn($ctrl.sessionService, 'getRole')
        .mockReturnValue(Roles.registered);
      jest
        .spyOn($ctrl.sessionService, 'getSignInStartLocation')
        .mockReturnValue(null);

      $ctrl.$onInit();

      expect($ctrl.$window.location.replace).toHaveBeenCalledTimes(1);
      expect($ctrl.$window.location.replace).toHaveBeenCalledWith(
        '/checkout.html',
      );
      expect($ctrl.sessionService.handleOktaRedirect).not.toHaveBeenCalled();
      expectNoErrorShownOrLogged();
    });

    it('keeps other query parameters but drops the Okta ones in the checkout fallback', () => {
      $ctrl.$window.location.search = '?code=new-code&state=state-1&ga=111';
      jest
        .spyOn($ctrl.sessionService, 'getRole')
        .mockReturnValue(Roles.registered);
      jest
        .spyOn($ctrl.sessionService, 'getSignInStartLocation')
        .mockReturnValue(null);

      $ctrl.$onInit();

      expect($ctrl.$window.location.replace).toHaveBeenCalledTimes(1);
      expect($ctrl.$window.location.replace).toHaveBeenCalledWith(
        '/checkout.html?ga=111',
      );
    });

    it('sends a donor who is not signed in to the sign-in page', () => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.public);
      jest.spyOn($ctrl.sessionService, 'getSignInStartLocation');

      $ctrl.$onInit();

      expect($ctrl.$window.location.replace).toHaveBeenCalledTimes(1);
      expect($ctrl.$window.location.replace).toHaveBeenCalledWith(
        '/sign-in.html',
      );
      expect($ctrl.sessionService.handleOktaRedirect).not.toHaveBeenCalled();
      expect(
        $ctrl.sessionService.getSignInStartLocation,
      ).not.toHaveBeenCalled();
      expectNoErrorShownOrLogged();
    });

    it('treats an IDENTIFIED donor as not signed in', () => {
      jest
        .spyOn($ctrl.sessionService, 'getRole')
        .mockReturnValue(Roles.identified);
      jest
        .spyOn($ctrl.sessionService, 'getSignInStartLocation')
        .mockReturnValue('https://give-stage2.cru.org/search-results.html');

      $ctrl.$onInit();

      expect($ctrl.$window.location.replace).toHaveBeenCalledTimes(1);
      expect($ctrl.$window.location.replace).toHaveBeenCalledWith(
        '/sign-in.html',
      );
    });

    it('records a RUM action for a replay while signed in', () => {
      jest
        .spyOn($ctrl.sessionService, 'getRole')
        .mockReturnValue(Roles.registered);
      jest
        .spyOn($ctrl.sessionService, 'getSignInStartLocation')
        .mockReturnValue('https://give-stage2.cru.org/search-results.html');

      $ctrl.$onInit();

      expect($ctrl.datadogRum.addAction).toHaveBeenCalledTimes(1);
      expect($ctrl.datadogRum.addAction).toHaveBeenCalledWith(
        'okta-callback-replay',
        { signedIn: true, navigationType: 'back_forward' },
      );
      expect($ctrl.$window.performance.getEntriesByType).toHaveBeenCalledWith(
        'navigation',
      );
    });

    it('records a RUM action for a replay while not signed in', () => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.public);
      $ctrl.$window.performance.getEntriesByType.mockReturnValue([
        { type: 'reload' },
      ]);

      $ctrl.$onInit();

      expect($ctrl.datadogRum.addAction).toHaveBeenCalledTimes(1);
      expect($ctrl.datadogRum.addAction).toHaveBeenCalledWith(
        'okta-callback-replay',
        { signedIn: false, navigationType: 'reload' },
      );
    });

    it('sends only signedIn and navigationType to RUM', () => {
      jest
        .spyOn($ctrl.sessionService, 'getRole')
        .mockReturnValue(Roles.registered);
      jest
        .spyOn($ctrl.sessionService, 'getSignInStartLocation')
        .mockReturnValue(null);

      $ctrl.$onInit();

      expect(
        Object.keys($ctrl.datadogRum.addAction.mock.calls[0][1]).sort(),
      ).toEqual(['navigationType', 'signedIn']);
    });

    it('reports navigationType unknown when the browser has no navigation entry', () => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.public);
      $ctrl.$window.performance.getEntriesByType.mockReturnValue([]);

      $ctrl.$onInit();

      expect($ctrl.datadogRum.addAction).toHaveBeenCalledWith(
        'okta-callback-replay',
        { signedIn: false, navigationType: 'unknown' },
      );
      expect($ctrl.$window.location.replace).toHaveBeenCalledWith(
        '/sign-in.html',
      );
    });

    it('reports navigationType unknown when the browser has no Performance API', () => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.public);
      delete $ctrl.$window.performance;

      $ctrl.$onInit();

      expect($ctrl.datadogRum.addAction).toHaveBeenCalledWith(
        'okta-callback-replay',
        { signedIn: false, navigationType: 'unknown' },
      );
      expect($ctrl.$window.location.replace).toHaveBeenCalledWith(
        '/sign-in.html',
      );
    });
  });

  describe('callback that is not a replay', () => {
    beforeEach(() => {
      jest
        .spyOn($ctrl.sessionService, 'isOktaRedirectReplay')
        .mockReturnValue(false);
      $ctrl.datadogRum = { addAction: jest.fn() };
    });

    it('still shows and logs a real sign-in error', () => {
      const error = new Error('Token exchange failed');
      jest
        .spyOn($ctrl.sessionService, 'handleOktaRedirect')
        .mockReturnValue(Observable.throw(error));
      jest.spyOn($log, 'error').mockImplementation(() => {});

      $ctrl.$onInit();
      $rootScope.$digest();

      expect($log.error).toHaveBeenCalledWith('Token exchange failed', error);
      expect($ctrl.errorMessage).toEqual('Token exchange failed');
      expect($ctrl.$window.location.replace).not.toHaveBeenCalled();
      expect($ctrl.datadogRum.addAction).not.toHaveBeenCalled();
    });

    it('sends the donor on with location.replace after a normal sign-in', () => {
      jest
        .spyOn($ctrl.sessionService, 'handleOktaRedirect')
        .mockReturnValue(Observable.of('data'));
      jest
        .spyOn(orderService, 'getDonorDetails')
        .mockReturnValue(Observable.of({ 'registration-state': 'REGISTERED' }));
      jest
        .spyOn($ctrl.sessionService, 'getRedirectLocation')
        .mockReturnValue('https://give-stage2.cru.org/search-results.html');

      $ctrl.$onInit();
      $rootScope.$digest();

      expect($ctrl.$window.location.replace).toHaveBeenCalledTimes(1);
      expect($ctrl.$window.location.replace).toHaveBeenCalledWith(
        'https://give-stage2.cru.org/search-results.html',
      );
      expect($ctrl.datadogRum.addAction).not.toHaveBeenCalled();
    });

    it('sends the donor to the sign-in page with location.replace when the URL has no Okta response', () => {
      jest
        .spyOn($ctrl.sessionService, 'handleOktaRedirect')
        .mockReturnValue(Observable.of(false));

      $ctrl.$onInit();
      $rootScope.$digest();

      expect($ctrl.$window.location.replace).toHaveBeenCalledTimes(1);
      expect($ctrl.$window.location.replace).toHaveBeenCalledWith(
        '/sign-in.html',
      );
      expect($ctrl.datadogRum.addAction).not.toHaveBeenCalled();
    });
  });

  describe('onSignInFailure()', () => {
    it('should log error message when error is an Error instance', () => {
      jest.spyOn($log, 'error').mockImplementation(() => {});
      const error = new Error('Failed');
      $ctrl.onSignInFailure(error);
      expect($log.error).toHaveBeenCalledWith('Failed', error);
      expect($ctrl.errorMessage).toEqual('Failed');
    });

    it('should log error message when error is not an Error instance', () => {
      jest.spyOn($log, 'error').mockImplementation(() => {});
      const error = { err: 'ERR' };
      $ctrl.onSignInFailure(error);
      expect($log.error).toHaveBeenCalledWith(unknownErrorMessage, error);
      expect($ctrl.errorMessage).toEqual(unknownErrorMessage);
    });

    it('should call clearRedirectLocation()', () => {
      jest.spyOn($ctrl.sessionService, 'clearRedirectLocation');
      $ctrl.onSignInFailure(undefined);
      expect($ctrl.sessionService.clearRedirectLocation).toHaveBeenCalled();
    });
  });

  describe('redirectToLocationPriorToLogin()', () => {
    it('should update the message to the user', () => {
      $ctrl.$onInit();
      expect($ctrl.isReadyToRedirect).toEqual(false);
      $ctrl.redirectToLocationPriorToLogin();
      expect($ctrl.isReadyToRedirect).toEqual(true);
    });

    it('should redirect the user to prior page', () => {
      jest.spyOn($ctrl.sessionService, 'clearRedirectLocation');
      jest
        .spyOn($ctrl.sessionService, 'getRedirectLocation')
        .mockReturnValue('https://give-stage2.cru.org/search-results.html');
      expect($ctrl.$window.location.replace).not.toHaveBeenCalled();
      $ctrl.redirectToLocationPriorToLogin();
      expect($ctrl.$window.location.replace).toHaveBeenCalledWith(
        'https://give-stage2.cru.org/search-results.html',
      );
      expect($ctrl.sessionService.clearRedirectLocation).toHaveBeenCalled();
    });

    it('should redirect the user to checkout by default', () => {
      jest.spyOn($ctrl.sessionService, 'clearRedirectLocation');
      jest
        .spyOn($ctrl.sessionService, 'getRedirectLocation')
        .mockReturnValue(undefined);
      expect($ctrl.$window.location.replace).not.toHaveBeenCalled();
      $ctrl.redirectToLocationPriorToLogin();
      expect($ctrl.$window.location.replace).toHaveBeenCalledWith(
        '/checkout.html',
      );
      expect($ctrl.sessionService.clearRedirectLocation).not.toHaveBeenCalled();
    });
  });

  describe('openUserMatchModalThenRedirect', () => {
    let deferred, $rootScope;
    beforeEach(inject((_$q_, _$rootScope_) => {
      deferred = _$q_.defer();
      $rootScope = _$rootScope_;
      jest
        .spyOn($ctrl.sessionModalService, 'userMatch')
        .mockReturnValue(deferred.promise);
      jest.spyOn($ctrl, 'redirectToLocationPriorToLogin');
    }));

    it('should open user matching modal and upon completing redirect to the previous page', () => {
      $ctrl.openUserMatchModalThenRedirect();

      expect($ctrl.sessionModalService.userMatch).toHaveBeenCalled();

      deferred.resolve();
      $rootScope.$digest();
      expect($ctrl.redirectToLocationPriorToLogin).toHaveBeenCalled();
    });
  });

  describe('openContactInfoModalThenRedirect', () => {
    let deferred, $rootScope;
    beforeEach(inject((_$q_, _$rootScope_) => {
      deferred = _$q_.defer();
      $rootScope = _$rootScope_;
      jest
        .spyOn($ctrl.sessionModalService, 'registerAccount')
        .mockReturnValue(deferred.promise);
      jest.spyOn($ctrl, 'redirectToLocationPriorToLogin');
    }));

    it('should open contact info modal and upon completing redirect to the previous page', () => {
      $ctrl.openContactInfoModalThenRedirect();

      expect($ctrl.sessionModalService.registerAccount).toHaveBeenCalledWith({
        dismissable: false,
      });

      deferred.resolve();
      $rootScope.$digest();
      expect($ctrl.redirectToLocationPriorToLogin).toHaveBeenCalled();
    });
  });

  describe('postDonorMatches', () => {
    beforeEach(() => {
      jest
        .spyOn($ctrl, 'openUserMatchModalThenRedirect')
        .mockImplementation(() => Observable.of({}));
      jest
        .spyOn($ctrl, 'openContactInfoModalThenRedirect')
        .mockImplementation(() => Observable.of({}));
      jest.spyOn($ctrl, 'redirectToLocationPriorToLogin');
    });

    it('should run post donor matches and on success open the user matching modal', () => {
      jest
        .spyOn(verificationService, 'postDonorMatches')
        .mockImplementation(() => Observable.of({}));
      $ctrl.postDonorMatches();

      expect(verificationService.postDonorMatches).toHaveBeenCalled();
      expect($ctrl.openUserMatchModalThenRedirect).toHaveBeenCalled();
      expect($ctrl.openContactInfoModalThenRedirect).not.toHaveBeenCalled();
    });

    it('should run post donor matches and on failure open the contact info modal', () => {
      jest
        .spyOn(verificationService, 'postDonorMatches')
        .mockReturnValue(Observable.throw({}));
      $ctrl.postDonorMatches();

      expect(verificationService.postDonorMatches).toHaveBeenCalled();
      expect($ctrl.openUserMatchModalThenRedirect).not.toHaveBeenCalled();
      expect($ctrl.openContactInfoModalThenRedirect).toHaveBeenCalled();
    });
  });

  describe('areRequiredFieldsFilled', () => {
    it('should validate given name field', () => {
      const testCases = [
        { givenName: '', expected: false },
        { givenName: 'Test', expected: true },
      ];

      testCases.forEach(({ givenName, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          name: {
            ...mockDonorDetails.name,
            'given-name': givenName,
          },
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate family name field', () => {
      const testCases = [
        { familyName: '', expected: false },
        { familyName: 'Test', expected: true },
      ];

      testCases.forEach(({ familyName, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          name: {
            ...mockDonorDetails.name,
            'family-name': familyName,
          },
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate email field', () => {
      const testCases = [
        { email: '', expected: false },
        { email: user.email, expected: true },
      ];

      testCases.forEach(({ email, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          email,
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate donor-type field', () => {
      const testCases = [
        { donorType: '', expected: false },
        { donorType: user.accountType, expected: true },
      ];

      testCases.forEach(({ donorType, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          'donor-type': donorType,
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate country field', () => {
      const testCases = [
        { country: '', expected: false },
        { country: 'US', expected: true },
      ];

      testCases.forEach(({ country, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          mailingAddress: {
            ...mockDonorDetails.mailingAddress,
            country,
          },
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate street address field', () => {
      const testCases = [
        { streetAddress: '', expected: false },
        { streetAddress: '123 Test lane', expected: true },
      ];

      testCases.forEach(({ streetAddress, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          mailingAddress: {
            ...mockDonorDetails.mailingAddress,
            streetAddress,
          },
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate organization-name field when organization account', () => {
      const testCases = [
        { organizationName: '', expected: false },
        { organizationName: '12345', expected: true },
      ];

      testCases.forEach(({ organizationName, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          'donor-type': 'Organization',
          'organization-name': organizationName,
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate US address', () => {
      const testCases = [
        { locality: '', region: '', postalCode: '', expected: false },
        { locality: 'city', region: '', postalCode: '', expected: false },
        { locality: 'city', region: 'GA', postalCode: '', expected: false },
        { locality: 'city', region: 'GA', postalCode: '12345', expected: true },
      ];

      testCases.forEach(({ locality, region, postalCode, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          mailingAddress: {
            ...mockDonorDetails.mailingAddress,
            country: 'US',
            locality,
            region,
            postalCode,
          },
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate International address', () => {
      const isValid = $ctrl.areRequiredFieldsFilled({
        ...mockDonorDetails,
        mailingAddress: {
          ...mockDonorDetails.mailingAddress,
          country: 'UK',
          locality: '',
          region: '',
          postalCode: '',
        },
      });
      expect(isValid).toBe(true);
    });
  });

  describe('onSignInSuccess', () => {
    let deferred, $rootScope;
    beforeEach(inject((_$q_, _$rootScope_) => {
      deferred = _$q_.defer();
      $rootScope = _$rootScope_;
      jest
        .spyOn($ctrl, 'openUserMatchModalThenRedirect')
        .mockImplementation(() => Observable.of({}));
      jest
        .spyOn($ctrl, 'openContactInfoModalThenRedirect')
        .mockImplementation(() => Observable.of({}));
      jest
        .spyOn($ctrl, 'postDonorMatches')
        .mockImplementation(() => Observable.of({}));
      jest
        .spyOn($ctrl.sessionModalService, 'registerAccount')
        .mockReturnValue(deferred.promise);
      jest
        .spyOn($ctrl.sessionModalService, 'userMatch')
        .mockReturnValue(deferred.promise);
      jest.spyOn($ctrl, 'redirectToLocationPriorToLogin');
    }));

    it('should error if no data', () => {
      jest.spyOn($ctrl, 'onSignInFailure');
      $ctrl.onSignInSuccess(undefined);
      expect($ctrl.onSignInFailure).toHaveBeenCalledWith(undefined);
      expect($ctrl.redirectToLocationPriorToLogin).not.toHaveBeenCalled();
    });

    it('should redirect to sign in when there is no Okta login redirect', () => {
      jest.spyOn($ctrl, 'onSignInFailure');
      jest.spyOn($ctrl, 'redirectToSignInPage').mockImplementation(() => {});
      $ctrl.onSignInSuccess(false);
      expect($ctrl.redirectToSignInPage).toHaveBeenCalled();
      expect($ctrl.onSignInFailure).not.toHaveBeenCalled();
    });

    it('should not fail if has data', () => {
      jest.spyOn($ctrl, 'onSignInFailure');
      jest
        .spyOn(orderService, 'getDonorDetails')
        .mockImplementation(() => Observable.of({}));
      $ctrl.onSignInSuccess('data');
      expect($ctrl.onSignInFailure).not.toHaveBeenCalled();

      deferred.resolve();
      $rootScope.$digest();
      expect($ctrl.redirectToLocationPriorToLogin).toHaveBeenCalled();
    });

    describe('Registration state is NEW', () => {
      it('opens the contact info modal if Cortex sign up fields are missing', () => {
        jest.spyOn($ctrl, 'onSignInFailure');
        jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() =>
          Observable.of({
            ...mockDonorDetails,
            'registration-state': 'NEW',
            mailingAddress: {
              ...mockDonorDetails.mailingAddress,
              streetAddress: undefined,
            },
          }),
        );
        $ctrl.onSignInSuccess('data');

        expect($ctrl.openContactInfoModalThenRedirect).toHaveBeenCalled();
        expect($ctrl.openUserMatchModalThenRedirect).not.toHaveBeenCalled();
        expect($ctrl.postDonorMatches).not.toHaveBeenCalled();

        deferred.resolve();
        $rootScope.$digest();
      });

      it('runs post donor matching when all required Cortex fields are filled', () => {
        jest.spyOn($ctrl, 'onSignInFailure');
        jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() =>
          Observable.of({
            ...mockDonorDetails,
            'registration-state': 'NEW',
          }),
        );
        $ctrl.onSignInSuccess('data');
        expect($ctrl.postDonorMatches).toHaveBeenCalled();
        expect($ctrl.openContactInfoModalThenRedirect).not.toHaveBeenCalled();
        expect($ctrl.openUserMatchModalThenRedirect).not.toHaveBeenCalled();

        deferred.resolve();
        $rootScope.$digest();
      });

      it('opens the user matching modal with an international address', () => {
        jest.spyOn($ctrl, 'onSignInFailure');
        jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() =>
          Observable.of({
            ...mockDonorDetails,
            'registration-state': 'NEW',
            mailingAddress: {
              ...mockDonorDetails.mailingAddress,
              country: 'UK',
              locality: undefined,
              region: undefined,
              postalCode: undefined,
            },
          }),
        );
        $ctrl.onSignInSuccess('data');

        expect($ctrl.postDonorMatches).toHaveBeenCalled();
        expect($ctrl.openContactInfoModalThenRedirect).not.toHaveBeenCalled();
        expect($ctrl.openUserMatchModalThenRedirect).not.toHaveBeenCalled();

        deferred.resolve();
        $rootScope.$digest();
      });
    });

    it('opens the user match modal when the user is MATCHED', () => {
      jest.spyOn($ctrl, 'onSignInFailure');
      jest
        .spyOn(orderService, 'getDonorDetails')
        .mockImplementation(() =>
          Observable.of({ 'registration-state': 'MATCHED' }),
        );
      $ctrl.onSignInSuccess('data');
      expect($ctrl.openUserMatchModalThenRedirect).toHaveBeenCalled();

      deferred.resolve();
      $rootScope.$digest();
    });

    it('does not open a modal and redirects user to prior page when the user is REGISTERED', () => {
      jest.spyOn($ctrl, 'onSignInFailure');
      jest
        .spyOn(orderService, 'getDonorDetails')
        .mockImplementation(() =>
          Observable.of({ 'registration-state': 'REGISTERED' }),
        );
      $ctrl.onSignInSuccess('data');
      expect($ctrl.redirectToLocationPriorToLogin).toHaveBeenCalled();

      expect($ctrl.postDonorMatches).not.toHaveBeenCalled();
      expect($ctrl.openContactInfoModalThenRedirect).not.toHaveBeenCalled();
      expect($ctrl.openUserMatchModalThenRedirect).not.toHaveBeenCalled();
    });
  });
});
