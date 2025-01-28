import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/of'
import module from './signUpModal.component'
import { Sessions } from 'common/services/session/session.service'
import { cortexRole } from 'common/services/session/fixtures/cortex-role'
import { giveSession } from 'common/services/session/fixtures/give-session'
import { cruProfile } from 'common/services/session/fixtures/cru-profile'
import { accountTypeFieldSchema, organizationNameFieldSchema, schema, user } from './signUpModal.component.mock'

describe('signUpForm', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings, $rootScope

  beforeEach(inject(function (_$rootScope_,  _$componentController_) {
    $rootScope = _$rootScope_
    bindings = {
      onSignIn: jest.fn(),
      onSignUp: jest.fn(),
      signUpForm: {
        $valid: false,
        $setSubmitted: jest.fn()
      },
    }
    const scope = { $apply: jest.fn() }
    scope.$apply.mockImplementation(() => {})
    $ctrl = _$componentController_(module.name, { $scope: scope }, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit()', () => {

    it('should initialize variables and load data', () => {
      jest.spyOn($ctrl, 'loadTranslations')
      jest.spyOn($ctrl, 'loadDonorDetails')
      $ctrl.$onInit()

      expect($ctrl.currentStep).toEqual(1)
      expect($ctrl.donorDetails).toEqual({})
      expect($ctrl.signUpErrors).toEqual([])
      expect($ctrl.isLoading).toEqual(true)
      expect($ctrl.submitting).toEqual(false)
    })

    it('should set up Okta Sign Up widget', (done) => {
      jest.spyOn($ctrl, 'loadDonorDetails').mockReturnValue(Observable.of())
      jest.spyOn($ctrl, 'setUpSignUpWidget')

      $ctrl.$onInit()

      setTimeout(() => {
        expect($ctrl.setUpSignUpWidget).toHaveBeenCalled()
        done()
      })
    })


    describe('with \'REGISTERED\' cortex-session', () => {
      let $cookies
      beforeEach(inject(function (_$cookies_) {
        $cookies = _$cookies_
        $cookies.put(Sessions.role, cortexRole.registered)
        $cookies.put(Sessions.give, giveSession)
        $cookies.put(Sessions.profile, cruProfile)
        $rootScope.$digest()
      }))

      afterEach(() => {
        [Sessions.role, Sessions.give, Sessions.profile].forEach((name) => {
          $cookies.remove(name)
        })
      })

      it('Redirects user to sign in modal', () => {
        jest.spyOn($ctrl, 'onSignIn')
        $ctrl.$onInit()

        expect($ctrl.onSignIn).toHaveBeenCalled()
      })
    })
  })

  describe('parseSchema()', () => {
    describe('getStep1Fields()', () => {
      const onSuccess = jest.fn();

      beforeEach(() => {
        $ctrl.giveAsIndividualTxt = 'Household'
        $ctrl.giveAsOrganizationTxt = 'Organization'
        $ctrl.sessionService.session = {
          first_name: '',
          last_name: '',
          email: ''
        }
        $ctrl.donorDetails = {
          name: {
            'given-name': '',
            'family-name': ''
          },
          email: '',
          'donor-type': ''
        }
      });

      it('should default to Step 1 and return data correctly', () => {
        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith([
          schema[0],
          schema[1],
          schema[2],
          accountTypeFieldSchema
        ])
      });

      it('should use saved data from $scope', () => {
        $ctrl.$scope.firstName = user.firstName;
        $ctrl.$scope.lastName = user.lastName;
        $ctrl.$scope.email = user.email;
        $ctrl.$scope.accountType = user.accountType;

        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith([
          {
            ...schema[0],
            value: user.firstName,
          },
          {
            ...schema[1],
            value: user.lastName,
          },
          {
            ...schema[2],
            value: user.email,
          },
          {
            ...accountTypeFieldSchema,
            value: user.accountType
          }
        ])
      })

      it('should use saved data from donorDetails', () => {
        $ctrl.donorDetails.name['given-name'] = `${user.firstName} donor`;
        $ctrl.donorDetails.name['family-name'] = `${user.lastName} donor`;
        $ctrl.donorDetails.email = `${user.email} donor`;
        $ctrl.donorDetails['donor-type'] = `${user.accountType} donor`;

        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith([
          {
            ...schema[0],
            value: `${user.firstName} donor`,
          },
          {
            ...schema[1],
            value: `${user.lastName} donor`,
          },
          {
            ...schema[2],
            value: `${user.email} donor`,
          },
          {
            ...accountTypeFieldSchema,
            value: `${user.accountType} donor`
          }
        ])
      });

      it('should use saved data from the session', () => {
        $ctrl.sessionService.session.first_name = `${user.firstName} session`;
        $ctrl.sessionService.session.last_name = `${user.lastName} session`;
        $ctrl.sessionService.session.email = `${user.email} session`;

        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith([
          {
            ...schema[0],
            value: `${user.firstName} session`,
          },
          {
            ...schema[1],
            value: `${user.lastName} session`,
          },
          {
            ...schema[2],
            value: `${user.email} session`,
          },
          accountTypeFieldSchema
        ])
      });
    });


    describe('getStep2Fields()', () => {
      const onSuccess = jest.fn();

      beforeEach(() => {
        $ctrl.currentStep = 2;
        $ctrl.organizationNameTxt = 'Organization Name';
        $ctrl.$scope = {
          organizationName: '',
          streetAddress: '',
          city: '',
          state: '',
          zipCode: '',
          countryCode: '',
          primaryPhone: '',
        }
        $ctrl.donorDetails = {
          mailingAddress: {
            streetAddress: '',
            locality: '', // city
            region: '', // state
            postalCode: '',
            country: '',
          },
          'phone-number': ''
        }
      });

      it('should return step 2 with no pre-filled values', () => {
        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith([
          schema[3],
          schema[4],
          schema[5],
          schema[6],
          schema[7],
          schema[8],
        ])
      });

      it('should include the organization field in step 2', () => {
        $ctrl.$scope.accountType = 'organization'
        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith([
          organizationNameFieldSchema,
          schema[3],
          schema[4],
          schema[5],
          schema[6],
          schema[7],
          schema[8],
        ])
      });

      it('should use saved data from $scope', () => {
        $ctrl.$scope.accountType = 'organization'
        $ctrl.$scope.organizationName = user.organizationName;
        $ctrl.$scope.streetAddress = user.streetAddress;
        $ctrl.$scope.city = user.city;
        $ctrl.$scope.state = user.state;
        $ctrl.$scope.zipCode = user.zipCode;
        $ctrl.$scope.countryCode = user.countryCode;
        $ctrl.$scope.primaryPhone = user.primaryPhone;

        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith([
          {
            ...organizationNameFieldSchema,
            value: user.organizationName,
          },
          {
            ...schema[3],
            value: user.streetAddress,
          },
          {
            ...schema[4],
            value: user.city,
          },
          {
            ...schema[5],
            value: user.state,
          },
          {
            ...schema[6],
            value: user.zipCode,
          },
          {
            ...schema[7],
            value: user.countryCode,
          },
          {
            ...schema[8],
            value: user.primaryPhone,
          },
        ])
      })

      it('should use saved data from donorDetails', () => {
        $ctrl.$scope.accountType = 'organization'
        $ctrl.donorDetails['organization-name'] = `${user.organizationName} donor`;
        $ctrl.donorDetails.mailingAddress.streetAddress = `${user.streetAddress} donor`;
        $ctrl.donorDetails.mailingAddress.locality = `${user.city} donor`;
        $ctrl.donorDetails.mailingAddress.region = `${user.state} donor`;
        $ctrl.donorDetails.mailingAddress.postalCode = `${user.zipCode} donor`;
        $ctrl.donorDetails.mailingAddress.country = `${user.countryCode} donor`;
        $ctrl.donorDetails['phone-number'] = `${user.primaryPhone} donor`;

        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith([
          {
            ...organizationNameFieldSchema,
            value: `${user.organizationName} donor`,
          },
          {
            ...schema[3],
            value: `${user.streetAddress} donor`,
          },
          {
            ...schema[4],
            value: `${user.city} donor`,
          },
          {
            ...schema[5],
            value: `${user.state} donor`,
          },
          {
            ...schema[6],
            value: `${user.zipCode} donor`,
          },
          {
            ...schema[7],
            value: `${user.countryCode} donor`,
          },
          {
            ...schema[8],
            value: `${user.primaryPhone} donor`,
          },
        ])
      });
    });
  });

  describe('preSubmit()', () => {
    const onSuccess = jest.fn();

    it('saveStep1Data()', () => {
      $ctrl.currentStep = 1;
      jest.spyOn($ctrl, 'goToNextStep').mockImplementation(() => {});
      jest.spyOn($ctrl.$scope, '$apply').mockImplementation((callback) => callback());

      const postData = {
        userProfile: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        accountType: user.accountType,
      }

      expect($ctrl.$scope.firstName).not.toEqual(user.firstName);
      $ctrl.preSubmit(postData, onSuccess);

      expect($ctrl.$scope.firstName).toEqual(user.firstName);
      expect($ctrl.$scope.lastName).toEqual(user.lastName);
      expect($ctrl.$scope.email).toEqual(user.email);
      expect($ctrl.$scope.accountType).toEqual(user.accountType);
      expect($ctrl.goToNextStep).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('saveStep2Data()', () => {
      $ctrl.currentStep = 2;
      jest.spyOn($ctrl, 'goToNextStep').mockImplementation(() => {});
      jest.spyOn($ctrl.$scope, '$apply').mockImplementation((callback) => callback());

      const postData = {
        userProfile: {
          streetAddress: user.streetAddress,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          countryCode: user.countryCode,
          primaryPhone: user.primaryPhone,
        },
        organizationName: user.organizationName,
      }

      expect($ctrl.$scope.streetAddress).not.toEqual(user.streetAddress);
      $ctrl.preSubmit(postData, onSuccess);

      expect($ctrl.$scope.streetAddress).toEqual(user.streetAddress);
      expect($ctrl.$scope.city).toEqual(user.city);
      expect($ctrl.$scope.state).toEqual(user.state);
      expect($ctrl.$scope.zipCode).toEqual(user.zipCode);
      expect($ctrl.$scope.countryCode).toEqual(user.countryCode);
      expect($ctrl.$scope.primaryPhone).toEqual(user.primaryPhone);
      expect($ctrl.$scope.organizationName).toEqual(user.organizationName);
      expect($ctrl.goToNextStep).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('submitFinalData()', () => {
      const postData = {};
      $ctrl.currentStep = 3;
      $ctrl.$scope.firstName = user.firstName
      $ctrl.$scope.lastName = user.lastName
      $ctrl.$scope.email = user.email
      $ctrl.$scope.accountType = user.accountType
      $ctrl.$scope.streetAddress = user.streetAddress
      $ctrl.$scope.city = user.city
      $ctrl.$scope.state = user.state
      $ctrl.$scope.zipCode = user.zipCode
      $ctrl.$scope.countryCode = user.countryCode
      $ctrl.$scope.primaryPhone = user.primaryPhone
      $ctrl.$scope.organizationName = user.organizationName

      $ctrl.preSubmit(postData, onSuccess);

      expect(onSuccess).toHaveBeenCalledWith({
        userProfile: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          streetAddress: user.streetAddress,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          countryCode: user.countryCode,
          primaryPhone: user.primaryPhone,
        }
      });
    });
  });

  describe('postSubmit()', () => {
    it('should call onSignUp with details of donor', () => {
      jest.spyOn($ctrl.$scope, '$apply').mockImplementation((callback) => callback());
      jest.spyOn($ctrl, 'onSignUp').mockImplementation(() => {});

      $ctrl.$scope.firstName = user.firstName
      $ctrl.$scope.lastName = user.lastName
      $ctrl.$scope.email = user.email
      $ctrl.$scope.accountType = user.accountType
      $ctrl.$scope.streetAddress = user.streetAddress
      $ctrl.$scope.city = user.city
      $ctrl.$scope.state = user.state
      $ctrl.$scope.zipCode = user.zipCode
      $ctrl.$scope.countryCode = user.countryCode
      $ctrl.$scope.primaryPhone = user.primaryPhone
      $ctrl.$scope.organizationName = user.organizationName

      const response = 'response'
      const onSuccess = jest.fn()
      $ctrl.postSubmit(response, onSuccess)

      expect($ctrl.onSignUp).toHaveBeenCalledWith({
        donorDetails: {
          name: {
            'given-name': user.firstName,
            'family-name': user.lastName,
          },
          'donor-type': user.accountType,
          'organization-name': user.organizationName,
          email: user.email,
          phone: user.primaryPhone,
          mailingAddress: {
            streetAddress: user.streetAddress,
            locality: user.city,
            region: user.state,
            postalCode: user.zipCode,
            country: user.countryCode,
          }
        }
      });
      expect(onSuccess).toHaveBeenCalledWith(response)
    });
  });

  describe('Misc functions', () => {
    it('afterError()', () => {
      const error = {
        xhr: {
          responseJSON: {
            errorCauses: [
              {
                message: 'message'
              }
            ]
          }
        }
      }
      $ctrl.afterError(jest.fn(), error)
      expect($ctrl.signUpErrors).toEqual([
        {
          message: 'message'
        }
      ])
    });

    it('afterRender()', () => {
      jest.spyOn($ctrl, 'updateSignUpButtonText').mockImplementation(() => {});
      jest.spyOn($ctrl, 'resetCurrentStepOnRegistrationComplete').mockImplementation(() => {});
      jest.spyOn($ctrl, 'redirectToSignInModalIfNeeded').mockImplementation(() => {});
      jest.spyOn($ctrl, 'injectErrorMessages').mockImplementation(() => {});
      jest.spyOn($ctrl, 'injectBackButton').mockImplementation(() => {});

      $ctrl.afterRender()

      expect($ctrl.updateSignUpButtonText).toHaveBeenCalled()
      expect($ctrl.resetCurrentStepOnRegistrationComplete).toHaveBeenCalled()
      expect($ctrl.redirectToSignInModalIfNeeded).toHaveBeenCalled()
      expect($ctrl.injectErrorMessages).toHaveBeenCalled()
      expect($ctrl.injectBackButton).toHaveBeenCalled()
    });


    describe('resetCurrentStepOnRegistrationComplete()', () => {
      beforeEach(() => {
        $ctrl.currentStep = 2
      });
      it('resets the sign up form to the beginning', () => {
        $ctrl.resetCurrentStepOnRegistrationComplete({controller: 'registration-complete'})
        expect($ctrl.currentStep).toEqual(null)
      });
      it('should not reset the sign up form', () => {
        $ctrl.resetCurrentStepOnRegistrationComplete({controller: 'registration'})
        expect($ctrl.currentStep).toEqual(2)
      });
    });

    describe('redirectToSignInModalIfNeeded()', () => {
      beforeEach(() => {
        jest.spyOn($ctrl.$scope, '$apply').mockImplementation((callback) => callback());
        jest.spyOn($ctrl, 'onSignIn').mockImplementation(() => {});
      });
      it('shows the login modal if the user navigates to the okta widget login form', () => {
        $ctrl.redirectToSignInModalIfNeeded({controller: 'primary-auth'})
        expect($ctrl.onSignIn).toHaveBeenCalled()
      });
      it('should not reset the sign up form', () => {
        $ctrl.redirectToSignInModalIfNeeded({controller: 'registration'})
        expect($ctrl.onSignIn).not.toHaveBeenCalled()
      });
    });

    it('goToNextStep()', () => {
      jest.spyOn($ctrl, 'reRenderWidget').mockImplementation(() => {});
      $ctrl.currentStep = 1
      $ctrl.goToNextStep()
      expect($ctrl.currentStep).toEqual(2)
      expect($ctrl.reRenderWidget).toHaveBeenCalled()

      $ctrl.goToNextStep()
      expect($ctrl.currentStep).toEqual(3)
    });

    it('goToPreviousStep()', () => {
      jest.spyOn($ctrl, 'reRenderWidget').mockImplementation(() => {});
      $ctrl.currentStep = 2
      $ctrl.goToPreviousStep()
      expect($ctrl.currentStep).toEqual(1)
      expect($ctrl.reRenderWidget).toHaveBeenCalled()

      $ctrl.goToPreviousStep()
      expect($ctrl.currentStep).toEqual(1)
    });

    it('reRenderWidget()', (done) => {
      const remove = jest.fn()
      const renderEl = jest.fn()
      $ctrl.oktaSignInWidget = {
        remove,
        renderEl
      }
      jest.spyOn($ctrl.$log, 'error').mockImplementation(() => {});
      $ctrl.reRenderWidget()
      expect(remove).toHaveBeenCalled()
      expect(renderEl).toHaveBeenCalled()

      const error = new Error('Render error');
      renderEl.mockImplementation((_, __, callback) => callback(error));
      $ctrl.reRenderWidget()
      setTimeout(() => {
        expect($ctrl.$log.error).toHaveBeenCalledWith('Error rendering Okta sign up widget.', error);
        done();
      });
    });
  });

  describe('signIn()', () => {
    it('should authenticated and handle login', (done) => {
      jest.spyOn($ctrl.$log, 'error').mockImplementation(() => {});
      const showSignInAndRedirect = jest.fn().mockImplementation(() => Promise.resolve({
      token: 'token'
      }));
      const handleLoginRedirect = jest.fn();
      $ctrl.oktaSignInWidget = {
        showSignInAndRedirect,
        authClient: {
          handleLoginRedirect
        }
      }

      $ctrl.signIn().then(() => {
      expect(showSignInAndRedirect).toHaveBeenCalledWith({
        el: '#osw-container'
      })
      expect(handleLoginRedirect).toHaveBeenCalledWith({
        token: 'token'
      })
      expect($ctrl.$log.error).not.toHaveBeenCalled()
      done()
      });
    });

    it('should handle an error with $log', (done) => {
      const error = new Error('Error signing in');
      jest.spyOn($ctrl.$log, 'error').mockImplementation(() => {});
      const showSignInAndRedirect = jest.fn().mockRejectedValue(error);
      const handleLoginRedirect = jest.fn();
      $ctrl.oktaSignInWidget = {
        showSignInAndRedirect,
        authClient: {
          handleLoginRedirect
        }
      }

      $ctrl.signIn().then(() => {
      expect(handleLoginRedirect).not.toHaveBeenCalled()
      expect($ctrl.$log.error).toHaveBeenCalledWith('Error showing Okta sign in widget.', error)
      done()
      });
    });
  });

  describe('loadDonorDetails()', () => {
    const signUpFormData = {
      name: {
        'given-name': user.firstName,
        'family-name': user.lastName,
      },
      'donor-type': user.accountType,
      'organization-name': user.organizationName,
      email: user.email,
      phone: user.primaryPhone,
      mailingAddress: {
        streetAddress: user.streetAddress,
        locality: user.city,
        region: user.state,
        postalCode: user.zipCode,
        country: user.countryCode,
      }
    };

    it('Inherits data from orderService', (done) => {
      jest.spyOn($ctrl.orderService, 'getDonorDetails').mockImplementation(() => Observable.from(
        [signUpFormData]
      ))
      $ctrl.loadDonorDetails().subscribe((data) => {
        expect(data).toEqual(signUpFormData)
        done()
      })
    })

    it('grabs data from orderService if data from both orderService and sessionService are set', (done) => {
      jest.spyOn($ctrl, 'loadDonorDetails')
      jest.spyOn($ctrl.orderService, 'getDonorDetails').mockImplementation(() => Observable.from(
        [signUpFormData]
      ))
      $ctrl.sessionService.session.checkoutSavedData = {
        ...signUpFormData,
        email: 'emailFromCheckoutSavedData@cru.org'
      };

      $ctrl.loadDonorDetails().subscribe((data) => {
        expect(data).toEqual({
          ...signUpFormData,
        email: 'emailFromCheckoutSavedData@cru.org'
        })
        done()
      })
    })

    it('should error and then set loadingDonorDetails to false', (done) => {
      const error = { status: 404 }
      jest.spyOn($ctrl.orderService, 'getDonorDetails').mockReturnValue(Observable.throw(error))
      jest.spyOn($ctrl.$log, 'error')
      $ctrl.loadingDonorDetails = true
      $ctrl.loadDonorDetails().subscribe({
        error: () => {
          expect($ctrl.$log.error).toHaveBeenCalledWith('Error loading donorDetails.', error)
        }
      })

      // Observable.finally is fired after the test, this defers until it's called.
      // eslint-disable-next-line angular/timeout-service
      setTimeout(() => {
        expect($ctrl.loadingDonorDetails).toEqual(false)
        done()
      })
    })
  });
})
