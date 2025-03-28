import angular from 'angular'
import 'angular-mocks'
import module, { unknownErrorMessage } from './oktaAuthCallback.component'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import { user } from '../../common/components/signUpModal/signUpModal.component.mock'

const mockDonorDetails = {
  name: {
    'given-name': user.firstName,
    'family-name': user.lastName
  },
  'donor-type': user.accountType,
  email: user.email,
  mailingAddress: {
    streetAddress: user.streetAddress,
    locality: user.city,
    region: user.state,
    postalCode: user.zipCode,
    country: user.countryCode
  },
}

describe('oktaAuthCallback', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, $rootScope, $log, orderService, verificationService

  beforeEach(inject(function (_$componentController_, _$rootScope_, _$log_, _orderService_, _verificationService_) {
    $rootScope = _$rootScope_
    $log = _$log_
    orderService = _orderService_
    verificationService = _verificationService_
    $ctrl = _$componentController_(module.name,
      {
        $log,
        $window: {
          location: '/okta-auth-callback.html',
          localStorage: {
            getItem: jest.fn(),
            removeItem: jest.fn(),
          }
        }
      }
    )
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit', () => {
    it('should call onSignInSuccess when handleOktaRedirect returns successfully', () => {
      jest.spyOn($ctrl, 'onSignInSuccess').mockImplementation(() => {})
      jest.spyOn($ctrl.sessionService, 'handleOktaRedirect').mockReturnValue(Observable.of('data'))

      $ctrl.$onInit()
      $rootScope.$digest()

      expect($ctrl.onSignInSuccess).toHaveBeenCalledWith('data')
    })

    it('should call onSignInFailure when handleOktaRedirect returns an error', () => {
      jest.spyOn($ctrl, 'onSignInFailure').mockImplementation(() => {})
      jest.spyOn($ctrl.sessionService, 'handleOktaRedirect').mockReturnValue(Observable.throw('error'))

      $ctrl.$onInit()
      $rootScope.$digest()

      expect($ctrl.onSignInFailure).toHaveBeenCalledWith('error')
    })
  })


  describe('onSignInFailure()', () => {
    it('should log error message', () => {
      jest.spyOn($log, 'error').mockImplementation(() => {})
      $ctrl.onSignInFailure('error')
      expect($log.error).toHaveBeenCalledWith('error')
    })

    it('should call removeStoredLocation()', () => {
      jest.spyOn($ctrl.sessionService, 'removeStoredLocation')
      $ctrl.onSignInFailure('error')
      expect($ctrl.sessionService.removeStoredLocation).toHaveBeenCalled()
    })

    it('should call removeStoredLocation()', () => {
      $ctrl.onSignInFailure('error')
      expect($ctrl.errorMessage).toEqual('error')
    })

    it('should call removeStoredLocation()', () => {
      $ctrl.onSignInFailure(undefined)
      expect($ctrl.errorMessage).toEqual(unknownErrorMessage)
    })
  })

  describe('redirectToLocationPriorToLogin()', () => {
    it('should update the message to the user', () => {
      $ctrl.$onInit()
      expect($ctrl.noticeToUser).toEqual('Authenticating...')
      $ctrl.redirectToLocationPriorToLogin()
      expect($ctrl.noticeToUser).toEqual('Redirecting to prior location...')
    })

    it('should redirect the user to prior page', () => {
      jest.spyOn($ctrl.sessionService, 'removeStoredLocation')
      jest.spyOn($ctrl.sessionService, 'getStoredLocation').mockReturnValue('https://give-stage2.cru.org/search-results.html')
      expect($ctrl.$window.location).toEqual('/okta-auth-callback.html')
      $ctrl.redirectToLocationPriorToLogin()
      expect($ctrl.$window.location).toEqual('https://give-stage2.cru.org/search-results.html')
      expect($ctrl.sessionService.removeStoredLocation).toHaveBeenCalled()
    })

    it('should redirect the user to checkout by default', () => {
      jest.spyOn($ctrl.sessionService, 'removeStoredLocation')
      jest.spyOn($ctrl.sessionService, 'getStoredLocation').mockReturnValue(undefined)
      expect($ctrl.$window.location).toEqual('/okta-auth-callback.html')
      $ctrl.redirectToLocationPriorToLogin()
      expect($ctrl.$window.location).toEqual('/checkout.html')
      expect($ctrl.sessionService.removeStoredLocation).not.toHaveBeenCalled()
    })
  })

  describe('openUserMatchModalThenRedirect', () => {
    let deferred, $rootScope
    beforeEach(inject((_$q_, _$rootScope_) => {
      deferred = _$q_.defer()
      $rootScope = _$rootScope_
      jest.spyOn($ctrl.sessionModalService, 'userMatch').mockReturnValue(deferred.promise)
      jest.spyOn($ctrl, 'redirectToLocationPriorToLogin')
    }));

    it('should open user matching modal and upon completing redirect to the previous page', () => {
      $ctrl.openUserMatchModalThenRedirect()

      expect($ctrl.sessionModalService.userMatch).toHaveBeenCalled()

      deferred.resolve()
      $rootScope.$digest()
      expect($ctrl.redirectToLocationPriorToLogin).toHaveBeenCalled()
    });
  });

  describe('openContactInfoModalThenRedirect', () => {
    let deferred, $rootScope
    beforeEach(inject((_$q_, _$rootScope_) => {
      deferred = _$q_.defer()
      $rootScope = _$rootScope_
      jest.spyOn($ctrl.sessionModalService, 'registerAccount').mockReturnValue(deferred.promise)
      jest.spyOn($ctrl, 'redirectToLocationPriorToLogin')
    }));

    it('should open contact info modal and upon completing redirect to the previous page', () => {
      $ctrl.openContactInfoModalThenRedirect()

      expect($ctrl.sessionModalService.registerAccount).toHaveBeenCalledWith({ dismissable: false })

      deferred.resolve()
      $rootScope.$digest()
      expect($ctrl.redirectToLocationPriorToLogin).toHaveBeenCalled()
    });
  });

  describe('postDonorMatches', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'openUserMatchModalThenRedirect').mockImplementation(() => Observable.of({}))
      jest.spyOn($ctrl, 'openContactInfoModalThenRedirect').mockImplementation(() => Observable.of({}))
      jest.spyOn($ctrl, 'redirectToLocationPriorToLogin')
    });

    it('should run post donor matches and on success open the user matching modal', () => {
      jest.spyOn(verificationService, 'postDonorMatches').mockImplementation(() => Observable.of({}))
      $ctrl.postDonorMatches()

      expect(verificationService.postDonorMatches).toHaveBeenCalled()
      expect($ctrl.openUserMatchModalThenRedirect).toHaveBeenCalled()
      expect($ctrl.openContactInfoModalThenRedirect).not.toHaveBeenCalled()
    });

    it('should run post donor matches and on failure open the contact info modal', () => {
      jest.spyOn(verificationService, 'postDonorMatches').mockReturnValue(Observable.throw({}))
      $ctrl.postDonorMatches()

      expect(verificationService.postDonorMatches).toHaveBeenCalled()
      expect($ctrl.openUserMatchModalThenRedirect).not.toHaveBeenCalled()
      expect($ctrl.openContactInfoModalThenRedirect).toHaveBeenCalled()
    });
  });

  describe('areRequiredFieldsFilled', () => {
    it('should validate given name field', () => {
      const testCases = [
        { givenName: '', expected: false },
        { givenName: 'Test', expected: true }
      ];

      testCases.forEach(({ givenName, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          name: {
            ...mockDonorDetails.name,
            'given-name': givenName,
          }
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate family name field', () => {
      const testCases = [
        { familyName: '', expected: false },
        { familyName: 'Test', expected: true }
      ];

      testCases.forEach(({ familyName, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          name: {
            ...mockDonorDetails.name,
            'family-name': familyName,
          }
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate email field', () => {
      const testCases = [
        { email: '', expected: false },
        { email: user.email, expected: true }
      ];

      testCases.forEach(({ email, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          email
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate donor-type field', () => {
      const testCases = [
        { donorType: '', expected: false },
        { donorType: user.accountType, expected: true }
      ];

      testCases.forEach(({ donorType, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          'donor-type': donorType
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate country field', () => {
      const testCases = [
        { country: '', expected: false },
        { country: 'US', expected: true }
      ];

      testCases.forEach(({ country, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          mailingAddress: {
            ...mockDonorDetails.mailingAddress,
            country,
          }
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate street address field', () => {
      const testCases = [
        { streetAddress: '', expected: false },
        { streetAddress: '123 Test lane', expected: true }
      ];

      testCases.forEach(({ streetAddress, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          mailingAddress: {
            ...mockDonorDetails.mailingAddress,
            streetAddress,
          }
        });
        expect(isValid).toBe(expected);
      });
    });

    it("should validate organization-name field when organization account", () => {
      const testCases = [
        { organizationName: '', expected: false },
        { organizationName: '12345', expected: true }
      ];

      testCases.forEach(({ organizationName, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          'donor-type': 'Organization',
          'organization-name': organizationName
        });
        expect(isValid).toBe(expected);
      });
    });

    it('should validate US address', () => {
      const testCases = [
        { locality: '', region: '', postalCode: '', expected: false },
        { locality: 'city', region: '', postalCode: '', expected: false },
        { locality: 'city', region: 'GA', postalCode: '', expected: false },
        { locality: 'city', region: 'GA', postalCode: '12345', expected: true }
      ];

      testCases.forEach(({ locality, region, postalCode, expected }) => {
        const isValid = $ctrl.areRequiredFieldsFilled({
          ...mockDonorDetails,
          mailingAddress: {
            ...mockDonorDetails.mailingAddress,
            country: 'US',
            locality,
            region,
            postalCode
          }
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
          postalCode: ''
        }
      });
      expect(isValid).toBe(true);
    });
  });




  describe('onSignInSuccess', () => {
    let deferred, $rootScope
    beforeEach(inject((_$q_, _$rootScope_) => {
      deferred = _$q_.defer()
      $rootScope = _$rootScope_
      jest.spyOn($ctrl, 'openUserMatchModalThenRedirect').mockImplementation(() => Observable.of({}))
      jest.spyOn($ctrl, 'openContactInfoModalThenRedirect').mockImplementation(() => Observable.of({}))
      jest.spyOn($ctrl, 'postDonorMatches').mockImplementation(() => Observable.of({}))
      jest.spyOn($ctrl.sessionModalService, 'registerAccount').mockReturnValue(deferred.promise)
      jest.spyOn($ctrl.sessionModalService, 'userMatch').mockReturnValue(deferred.promise)
      jest.spyOn($ctrl, 'redirectToLocationPriorToLogin')
    }))

    it('should error if no data', () => {
      jest.spyOn($ctrl, 'onSignInFailure')
      $ctrl.onSignInSuccess(undefined)
      expect($ctrl.onSignInFailure).toHaveBeenCalledWith(undefined)
      expect($ctrl.redirectToLocationPriorToLogin).not.toHaveBeenCalled()
    })

    it('should not fail if has data', () => {
      jest.spyOn($ctrl, 'onSignInFailure')
      jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({}))
      $ctrl.onSignInSuccess('data')
      expect($ctrl.onSignInFailure).not.toHaveBeenCalled()

      deferred.resolve()
      $rootScope.$digest()
      expect($ctrl.redirectToLocationPriorToLogin).toHaveBeenCalled()
    })

    describe('Registration state is NEW', () => {
      it('opens the contact info modal if Cortex sign up fields are missing', () => {
        jest.spyOn($ctrl, 'onSignInFailure')
        jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({
          ...mockDonorDetails,
          'registration-state': 'NEW',
          mailingAddress: {
            ...mockDonorDetails.mailingAddress,
            streetAddress: undefined
          }
        }))
        $ctrl.onSignInSuccess('data')

        expect($ctrl.openContactInfoModalThenRedirect).toHaveBeenCalled()
        expect($ctrl.openUserMatchModalThenRedirect).not.toHaveBeenCalled()
        expect($ctrl.postDonorMatches).not.toHaveBeenCalled()

        deferred.resolve()
        $rootScope.$digest()
      })

      it('runs post donor matching when all required Cortex fields are filled', () => {
        jest.spyOn($ctrl, 'onSignInFailure')
        jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({
          ...mockDonorDetails,
          'registration-state': 'NEW'
        }))
        $ctrl.onSignInSuccess('data')
        expect($ctrl.postDonorMatches).toHaveBeenCalled()
        expect($ctrl.openContactInfoModalThenRedirect).not.toHaveBeenCalled()
        expect($ctrl.openUserMatchModalThenRedirect).not.toHaveBeenCalled()

        deferred.resolve()
        $rootScope.$digest()
      })

      it('opens the user matching modal with an international address', () => {
        jest.spyOn($ctrl, 'onSignInFailure')
        jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({
          ...mockDonorDetails,
          'registration-state': 'NEW',
          mailingAddress: {
            ...mockDonorDetails.mailingAddress,
            country: 'UK',
            locality: undefined,
            region: undefined,
            postalCode: undefined,
          }
        }))
        $ctrl.onSignInSuccess('data')

        expect($ctrl.postDonorMatches).toHaveBeenCalled()
        expect($ctrl.openContactInfoModalThenRedirect).not.toHaveBeenCalled()
        expect($ctrl.openUserMatchModalThenRedirect).not.toHaveBeenCalled()

        deferred.resolve()
        $rootScope.$digest()
      })
    })

    it('opens the user match modal when the user is MATCHED', () => {
      jest.spyOn($ctrl, 'onSignInFailure')
      jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'registration-state': 'MATCHED' }))
      $ctrl.onSignInSuccess('data')
      expect($ctrl.openUserMatchModalThenRedirect).toHaveBeenCalled()

      deferred.resolve()
      $rootScope.$digest()
    })

    it('does not open a modal and redirects user to prior page when the user is REGISTERED', () => {
      jest.spyOn($ctrl, 'onSignInFailure')
      jest.spyOn(orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'registration-state': 'REGISTERED' }))
      $ctrl.onSignInSuccess('data')
      expect($ctrl.redirectToLocationPriorToLogin).toHaveBeenCalled()

      expect($ctrl.postDonorMatches).not.toHaveBeenCalled()
      expect($ctrl.openContactInfoModalThenRedirect).not.toHaveBeenCalled()
      expect($ctrl.openUserMatchModalThenRedirect).not.toHaveBeenCalled()
    })
  })
})
