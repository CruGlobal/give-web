import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/of'
import module, { countryFieldSelector, inputFieldErrorSelectorPrefix, regionFieldSelector } from './signUpModal.component'
import { Sessions } from 'common/services/session/session.service'
import { cortexRole } from 'common/services/session/fixtures/cortex-role'
import { giveSession } from 'common/services/session/fixtures/give-session'
import { cruProfile } from 'common/services/session/fixtures/cru-profile'
import { schema, user } from './signUpModal.component.mock'
import { customFields } from './signUpFormCustomFields'

describe('signUpForm', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings, $rootScope, $flushPendingTasks

  beforeEach(inject(function (_$rootScope_,  _$componentController_, _$flushPendingTasks_) {
    $rootScope = _$rootScope_
    $flushPendingTasks = _$flushPendingTasks_
    bindings = {
      onSignIn: jest.fn(),
      onSignUpError: jest.fn(),
      signUpForm: {
        $valid: false,
        $setSubmitted: jest.fn()
      },
    }
    $ctrl = _$componentController_(module.name, {}, bindings)
    $ctrl.loadTranslations()
    $flushPendingTasks()

    // Prevent the actual Okta widget from being created in tests
    jest.spyOn($ctrl, 'setUpSignUpWidget').mockImplementation(() => {})

    jest.spyOn($ctrl.sessionService, 'signIn').mockReturnValue(Observable.of({}))
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
      let defaultData = [
        schema[0],
        schema[1],
        schema[2],
      ]

      beforeEach(() => {
        $ctrl.translations = {
          giveAsIndividual: 'Household',
          giveAsOrganization: 'Organization',
          organizationName: 'Organization Name',
        }
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
        $ctrl.$scope = {}
        defaultData= [
          ...defaultData,
          {
            ...customFields.accountType,
            options: {
              Household: 'Household',
              Organization: 'Organization'
            },
            value: 'Household'
          },
          {
            ...customFields.organizationName,
            label: 'Organization Name',
            value: ''
          }
        ]
      });

      it('should default to Step 1 and return data correctly', () => {
        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith(defaultData)
      });

      it('should use saved data from $scope', () => {
        $ctrl.$scope = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          accountType: user.accountType,
          organizationName: user.organizationName
        }
        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith([
          {
            ...defaultData[0],
            value: $ctrl.$scope.firstName,
          },
          {
            ...defaultData[1],
            value: $ctrl.$scope.lastName,
          },
          {
            ...defaultData[2],
            value: $ctrl.$scope.email,
          },
          {
            ...defaultData[3],
            value: $ctrl.$scope.accountType
          },
          {
            ...defaultData[4],
            value: $ctrl.$scope.organizationName
          }
        ])
      })

      it('should use saved data from donorDetails', () => {
        $ctrl.donorDetails = {
          name: {
            'given-name': `${user.firstName} donor`,
            'family-name': `${user.lastName} donor`
          },
          email: `${user.email} donor`,
          'donor-type': 'Organization',
          'organization-name': `${user.organizationName} donor`

        }
        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith([
          {
            ...defaultData[0],
            value: `${user.firstName} donor`,
          },
          {
            ...defaultData[1],
            value: `${user.lastName} donor`,
          },
          {
            ...defaultData[2],
            value: `${user.email} donor`,
          },
          {
            ...defaultData[3],
            value: $ctrl.donorDetails['donor-type']
          },
          {
            ...defaultData[4],
            value: $ctrl.donorDetails['organization-name']
          }
        ])
      });

      it('should use saved data from the session', () => {
        $ctrl.sessionService.session = {
          first_name: `${user.firstName} session`,
          last_name: `${user.lastName} session`,
          email: `${user.email} session`
        }
        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith([
          {
            ...defaultData[0],
            value: `${user.firstName} session`,
          },
          {
            ...defaultData[1],
            value: `${user.lastName} session`,
          },
          {
            ...defaultData[2],
            value: `${user.email} session`,
          },
          {
            ...defaultData[3],
            value: 'Household'
          },
          {
            ...defaultData[4],
            value: ''
          }
        ])
      });
    });


    describe('getStep2Fields()', () => {
      const onSuccess = jest.fn();
      let defaultData = []
      beforeEach(() => {
        $ctrl.currentStep = 2;
        $ctrl.translations = {
          country: 'Country code',
          address: 'Street address',
          city: 'City',
          state: 'State',
          zip:  'Zip code',
        }
        $ctrl.countryCodeOptions = {
          US: 'USA',
          UK: 'United Kingdom',
          CA: 'Canada'
        }
        $ctrl.stateOptions = {
          CA: 'California',
          GA: 'Georgia'
        }
        $ctrl.donorDetails = {
          mailingAddress: {
            streetAddress: '',
            locality: '', // city
            region: '', // state
            postalCode: '',
            country: '',
          },
          name: {
            'given-name': '',
            'family-name': ''
          },
          email: '',
          'donor-type': ''
        }
        $ctrl.$scope = {
          streetAddress: '',
          city: '',
          state: '',
          zipCode: '',
          countryCode: '',
        }

        defaultData = [
          {
            ...customFields.countryCode,
            options: $ctrl.countryCodeOptions,
            value: 'US'
          },
          {
            ...customFields.streetAddress,
            value: ''
          },
          {
            ...customFields.streetAddressExtended,
            value: ''
          },
          {
            ...customFields.internationalAddressLine3,
            value: ''
          },
          {
            ...customFields.internationalAddressLine4,
            value: ''
          },
          {
            ...customFields.city,
            value: ''
          },
          {
            ...customFields.state,
            options: {
              '': '',
              ...$ctrl.stateOptions,
            },
            value: ''
          },
          {
            ...customFields.zipCode,
            value: ''
          },
        ]
      });

      it('should return step 2 using default data', () => {
        $ctrl.parseSchema(schema, onSuccess);
        expect(onSuccess).toHaveBeenCalledWith(defaultData)
      });

      it('should use saved data from $scope', () => {
        $ctrl.$scope.countryCode = 'UK';
        $ctrl.$scope.streetAddress = user.streetAddress;
        $ctrl.$scope.streetAddressExtended = 'Extended';
        $ctrl.$scope.internationalAddressLine3 = 'internationalAddressLine3';
        $ctrl.$scope.internationalAddressLine4 = 'internationalAddressLine4';
        $ctrl.$scope.city = user.city;
        $ctrl.$scope.state = user.state;
        $ctrl.$scope.zipCode = user.zipCode;

        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith([
          {
            ...defaultData[0],
            value: $ctrl.$scope.countryCode
          },
          {
            ...defaultData[1],
            value: $ctrl.$scope.streetAddress
          },
          {
            ...defaultData[2],
            value: $ctrl.$scope.streetAddressExtended
          },
          {
            ...defaultData[3],
            value: 'internationalAddressLine3'
          },
          {
            ...defaultData[4],
            value: 'internationalAddressLine4'
          },
          {
            ...defaultData[5],
            value: $ctrl.$scope.city
          },
          {
            ...defaultData[6],
            value: $ctrl.$scope.state
          },
          {
            ...defaultData[7],
            value: $ctrl.$scope.zipCode
          },
        ])
      })

      it('should use saved data from donorDetails', () => {
        $ctrl.donorDetails.mailingAddress.country = `CA`;
        $ctrl.donorDetails.mailingAddress.streetAddress = `${user.streetAddress} donor`;
        $ctrl.donorDetails.mailingAddress.extendedAddress = `extendedAddress`;
        $ctrl.donorDetails.mailingAddress.intAddressLine3 = `intAddressLine3`;
        $ctrl.donorDetails.mailingAddress.intAddressLine4 = `intAddressLine4`;
        $ctrl.donorDetails.mailingAddress.locality = `${user.city} donor`;
        $ctrl.donorDetails.mailingAddress.region = `${user.state} donor`;
        $ctrl.donorDetails.mailingAddress.postalCode = `${user.zipCode} donor`;

        $ctrl.parseSchema(schema, onSuccess);

        expect(onSuccess).toHaveBeenCalledWith([
          {
            ...defaultData[0],
            value: $ctrl.donorDetails.mailingAddress.country
          },
          {
            ...defaultData[1],
            value: $ctrl.donorDetails.mailingAddress.streetAddress
          },
          {
            ...defaultData[2],
            value: $ctrl.donorDetails.mailingAddress.extendedAddress
          },
          {
            ...defaultData[3],
            value: $ctrl.donorDetails.mailingAddress.intAddressLine3
          },
          {
            ...defaultData[4],
            value: $ctrl.donorDetails.mailingAddress.intAddressLine4
          },
          {
            ...defaultData[5],
            value: $ctrl.donorDetails.mailingAddress.locality
          },
          {
            ...defaultData[6],
            value: $ctrl.donorDetails.mailingAddress.region
          },
          {
            ...defaultData[7],
            value: $ctrl.donorDetails.mailingAddress.postalCode
          },
        ])
      });
    });
  });

  describe('loadCountries()', () => {
    const countries = [
      { name: 'US', 'display-name': 'USA' },
      { name: 'UK', 'display-name': 'United Kingdom' }
    ];
    beforeEach(() => {
      $ctrl.countryCodeOptions = {}
      $ctrl.countriesData = null
      $ctrl.$scope.countryCode = null;
      jest.spyOn($ctrl, 'refreshRegions').mockReturnValue(Observable.of(''));
      jest.spyOn($ctrl.geographiesService, 'getCountries').mockReturnValue(Observable.of(countries));
    });

    it('should set loadingCountriesError to false', () => {
      $ctrl.loadingCountriesError = true;
      $ctrl.loadCountries({initial: false}).subscribe(() => {
        expect($ctrl.loadingCountriesError).toBe(false);
      });
    });

    it('should log an error if error occurs while calling getCountries()', (done) => {
      const error = new Error('Error loading countries');
      $ctrl.geographiesService.getCountries.mockReturnValue(Observable.throw(error));
      jest.spyOn($ctrl.$log, 'error');
      $ctrl.loadCountries({initial: false}).subscribe({
        error: () => {
          expect($ctrl.loadingCountriesError).toBe(true);
          expect($ctrl.$log.error).toHaveBeenCalledWith('Okta Sign up: Error loading countries.', error);
          done();
        }
      });
    });

    it('should set countryCodeOptions & countriesData when data is found', (done) => {
      const expectedCountryCodeOptions = {
        US: 'USA',
        UK: 'United Kingdom'
      }
      $ctrl.loadCountries({initial: false}).subscribe((data) => {
        expect($ctrl.countryCodeOptions).toEqual(expectedCountryCodeOptions);
        expect(data).toEqual(expectedCountryCodeOptions);
        expect($ctrl.countriesData).toEqual(countries);
        done();
      });
    });

    it('should not call refreshRegions()', (done) => {
      $ctrl.loadCountries({initial: false}).subscribe(() => {
        expect($ctrl.refreshRegions).not.toHaveBeenCalled()
        done();
      });
    });

    it('should call refreshRegions() is this.$scope.countryCode is set', (done) => {
      $ctrl.$scope.countryCode = 'UK';
      $ctrl.loadCountries({initial: false}).subscribe(() => {
        expect($ctrl.refreshRegions).toHaveBeenCalledWith('UK')
        done();
      });
    });

    it('should call refreshRegions() when initial time running function', (done) => {
      $ctrl.loadCountries({initial: true}).subscribe(() => {
        expect($ctrl.refreshRegions).toHaveBeenCalledWith('US')
        done();
      });
    });

    it("should use donorDetails's country", (done) => {
      $ctrl.donorDetails = {
        mailingAddress: {
          country: 'CA'
        }
      }
      $ctrl.loadCountries({initial: true}).subscribe(() => {
        expect($ctrl.refreshRegions).toHaveBeenCalledWith('CA')
        done();
      });
    });
  });

  describe('refreshRegions()', () => {
    beforeEach(() => {
      $ctrl.selectedCountry = {};
      $ctrl.countriesData = [
        {
          name: 'country',
          regions: [
            { name: 'region1', 'display-name': 'Region 1' },
            { name: 'region2', 'display-name': 'Region 2' }
          ],
        },
        {
          name: 'country2',
          regions: [
            { name: 'region3', 'display-name': 'Region 3' },
            { name: 'region4', 'display-name': 'Region 4' }
          ],
        },
      ]
      jest.spyOn($ctrl.geographiesService, 'getRegions').mockReturnValue(Observable.of([]));
    });

    it('should return null if selectedCountry is equal to country and forceRetry is false', (done) => {
      $ctrl.selectedCountry.name = 'country';
      $ctrl.refreshRegions('country').subscribe((data) => {
        expect(data).toBe(null);
        done()
      });
    });

    it('should return null if it can not find country in countriesData', (done) => {
      $ctrl.refreshRegions('country3').subscribe({
        error: (error) => {
          expect(error.message).toBe('Country not found');
          done();
        }
      });
    });

    it('should set loadingRegionsError to false', () => {
      $ctrl.loadingRegionsError = true;
      $ctrl.refreshRegions('country').subscribe(() => {
        expect($ctrl.loadingRegionsError).toBe(false);
      });
    });

    it('should set selectedCountry to countryData', (done) => {
      $ctrl.refreshRegions('country').subscribe(() => {
        expect($ctrl.selectedCountry.name).toBe('country');
        done();
      });
    });

    it('should call geographiesService.getRegions with countryData', (done) => {
      $ctrl.refreshRegions('country').subscribe(() => {
        expect($ctrl.geographiesService.getRegions).toHaveBeenCalledWith($ctrl.countriesData[0]);
        done();
      });
    });

    it('should set stateOptions if data is found', (done) => {
     $ctrl.geographiesService.getRegions.mockReturnValue(Observable.of($ctrl.countriesData[0].regions));
      $ctrl.refreshRegions('country').subscribe(() => {
        expect($ctrl.stateOptions).toEqual({
          region1: 'Region 1',
          region2: 'Region 2'
        });
        done();
      });
    });

    it('should handle error and set loadingRegionsError to true', (done) => {
      const error = new Error('Error loading regions');
      $ctrl.geographiesService.getRegions.mockReturnValue(Observable.throw(error));
      jest.spyOn($ctrl.$log, 'error');
      $ctrl.refreshRegions('country').subscribe({
        error: () => {
          expect($ctrl.loadingRegionsError).toBe(true);
          expect($ctrl.$log.error).toHaveBeenCalledWith('Okta Sign up: Error loading regions.', error);
          done();
        }
      });
    });
  });

  describe('preSubmit()', () => {
    const onSuccess = jest.fn();

    beforeEach(() => {
      jest.spyOn($ctrl, 'goToNextStep').mockImplementation(() => {});
      jest.spyOn($ctrl, 'injectErrorMessages').mockImplementation(() => {});
      jest.spyOn($ctrl, 'clearInjectedErrorMessages').mockImplementation(() => {});
    })

    it('clears sign up errors', () => {
      $ctrl.signUpErrors = [
        { property: 'accountType', errorSummary:  'accountTypeError' }
      ]

      $ctrl.preSubmit({}, onSuccess)

      expect($ctrl.signUpErrors).toEqual([])
      expect($ctrl.clearInjectedErrorMessages).toHaveBeenCalled()
    })

    describe('saveStep1Data()', () => {
      let postData = {}
      const orgNameError = 'orgNameError';

      beforeEach(() => {
        $ctrl.currentStep = 1;
        $ctrl.translations = {
          orgNameError,
        }
        postData= {
          userProfile: user,
          accountType: user.accountType,
          organizationName: user.organizationName,
        }
      });

      it('saves Organisation account Information correctly', () => {
        postData.accountType = 'Organization';
        expect($ctrl.$scope.firstName).not.toEqual(user.firstName);
        $ctrl.preSubmit(postData, onSuccess);

        expect($ctrl.$scope.firstName).toEqual(user.firstName);
        expect($ctrl.$scope.lastName).toEqual(user.lastName);
        expect($ctrl.$scope.email).toEqual(user.email);
        expect($ctrl.$scope.accountType).toEqual('Organization');
        expect($ctrl.$scope.organizationName).toEqual(user.organizationName);
        expect($ctrl.goToNextStep).toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
      });

      it('saves HouseHold account Information correctly', () => {
        expect($ctrl.$scope.firstName).not.toEqual(user.firstName);
        $ctrl.preSubmit(postData, onSuccess);

        expect($ctrl.$scope.firstName).toEqual(user.firstName);
        expect($ctrl.$scope.lastName).toEqual(user.lastName);
        expect($ctrl.$scope.email).toEqual(user.email);
        expect($ctrl.$scope.accountType).toEqual(user.accountType);
        expect($ctrl.$scope.organizationName).toEqual('');
        expect($ctrl.goToNextStep).toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
      });

      it('should handle no organisation name error', () => {
        postData.accountType = 'Organization';
        postData.organizationName = '';
        $ctrl.preSubmit(postData, onSuccess);

        expect($ctrl.injectErrorMessages).toHaveBeenCalledWith([
          {
            property: 'organizationName',
            errorSummary: orgNameError
          }
        ])
        expect($ctrl.injectErrorMessages).toHaveBeenCalled();
        expect($ctrl.goToNextStep).not.toHaveBeenCalled();
      });
    });


    describe('saveStep2Data()', () => {
      let postData = {}
      const cityError = 'cityError';
      const selectStateError = 'selectStateError';
      const zipCodeError = 'zipCodeError';
      const invalidUSZipError = 'invalidUSZipError';

      beforeEach(() => {
        $ctrl.currentStep = 2;
        $ctrl.translations = {
          cityError: cityError,
          selectStateError,
          zipCodeError,
          invalidUSZipError
        }
        postData= {
          userProfile: user,
          organizationName: user.organizationName,
        }
      });

      describe('Saves Information', () => {
        beforeEach(() => {
          expect($ctrl.$scope.streetAddress).not.toEqual(user.streetAddress);
        });

        afterEach(() => {
          expect($ctrl.$scope.streetAddress).toEqual(user.streetAddress);
          expect($ctrl.$scope.streetAddressExtended).toEqual(user.streetAddressExtended);
          expect($ctrl.goToNextStep).toHaveBeenCalled();
          expect(onSuccess).not.toHaveBeenCalled();
        });

        it('should save a US address', () => {
          $ctrl.preSubmit(postData, onSuccess);

          expect($ctrl.$scope.city).toEqual(user.city);
          expect($ctrl.$scope.state).toEqual(user.state);
          expect($ctrl.$scope.zipCode).toEqual(user.zipCode);
          expect($ctrl.$scope.countryCode).toEqual(user.countryCode);
          expect($ctrl.$scope.internationalAddressLine3).toEqual('');
          expect($ctrl.$scope.internationalAddressLine4).toEqual('');
        });

        it('should save a non-US address', () => {
          const internationalAddressLine3 = 'internationalAddressLine3';
          const internationalAddressLine4 = 'internationalAddressLine4';
          postData.userProfile.countryCode = 'UK';
          postData.userProfile.internationalAddressLine3 = internationalAddressLine3;
          postData.userProfile.internationalAddressLine4 = internationalAddressLine4;
          $ctrl.preSubmit(postData, onSuccess);

          expect($ctrl.$scope.city).toEqual('');
          expect($ctrl.$scope.state).toEqual('');
          expect($ctrl.$scope.zipCode).toEqual('');
          expect($ctrl.$scope.countryCode).toEqual('UK');
          expect($ctrl.$scope.internationalAddressLine3).toEqual(internationalAddressLine3)
          expect($ctrl.$scope.internationalAddressLine4).toEqual(internationalAddressLine4)
          postData.userProfile.countryCode = 'US';
        });
      });

      it('should handle no country error', () => {
        postData.userProfile = {...postData.userProfile, city: ''};
        $ctrl.preSubmit(postData, onSuccess);
        expect($ctrl.injectErrorMessages).toHaveBeenCalledWith([
          {
            property: 'userProfile.city',
            errorSummary: cityError
          }
        ])
      });

      it('should handle no state error', () => {
        postData.userProfile = {...postData.userProfile, state: ''};
        $ctrl.preSubmit(postData, onSuccess);
        expect($ctrl.injectErrorMessages).toHaveBeenCalledWith([
          {
            property: 'userProfile.state',
            errorSummary: selectStateError
          }
        ])
      });

      it('should handle no zipCode error', () => {
        postData.userProfile = {...postData.userProfile, zipCode: ''};
        $ctrl.preSubmit(postData, onSuccess);
        expect($ctrl.injectErrorMessages).toHaveBeenCalledWith([
          {
            property: 'userProfile.zipCode',
            errorSummary: zipCodeError
          }
        ])
      });

      describe('Valid US zipCodes', () => {
        afterEach(() => {
          expect($ctrl.injectErrorMessages).not.toHaveBeenCalled();
          expect($ctrl.goToNextStep).toHaveBeenCalled();
        });
        it('should ensure zipCode is valid', () => {
          postData.userProfile.zipCode = '12345';
          $ctrl.preSubmit(postData, onSuccess);
        });

        it('should ensure zipCode with extended format is valid', () => {
          postData.userProfile.zipCode = '12345-6789';
          $ctrl.preSubmit(postData, onSuccess);
        });

        it('should ensure zipCode with spaces is valid', () => {
          postData.userProfile.zipCode = '12345 6789';
          $ctrl.preSubmit(postData, onSuccess);
        });
      });

      describe('Invalid US zipCodes', () => {
        afterEach(() => {
          expect($ctrl.injectErrorMessages).toHaveBeenCalledWith([
            {
              property: 'userProfile.zipCode',
              errorSummary: invalidUSZipError
            }
          ])
        });

        it('should ensure zipCode with letters is invalid', () => {
          postData.userProfile.zipCode = '1234A';
          $ctrl.preSubmit(postData, onSuccess);
        });

        it('should ensure zipCode with too few digits is invalid', () => {
          postData.userProfile.zipCode = '1234';
          $ctrl.preSubmit(postData, onSuccess);
        });

        it('should ensure zipCode with too many digits is invalid', () => {
          postData.userProfile.zipCode = '123456';
          $ctrl.preSubmit(postData, onSuccess);
        });

        it('should ensure zipCode with invalid extended format is invalid', () => {
          postData.userProfile.zipCode = '12345-678';
          $ctrl.preSubmit(postData, onSuccess);
        });
      });
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
      $ctrl.$scope.organizationName = user.organizationName

      $ctrl.preSubmit(postData, onSuccess);

      expect(onSuccess).toHaveBeenCalledWith({
        userProfile: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }
      });
    });
  });

  describe('postSubmit()', () => {
    it('should call onSuccess', () => {
      const response = 'response'
      const onSuccess = jest.fn()
      $ctrl.postSubmit(response, onSuccess)

      expect(onSuccess).toHaveBeenCalledWith(response)
    });
  });

  describe('Misc functions', () => {
    it('afterError() sets sign up errors and fixes sign up button text', () => {
      const cause = { message: 'message', property: 'userProfile.email' }
      const error = {
        xhr: {
          responseJSON: {
            errorCauses: [cause]
          }
        }
      }
      $ctrl.afterError(jest.fn(), error)

      expect($ctrl.signUpErrors).toEqual([cause])

      // Simulate Okta changing the button text and adding the info box after the `afterError` completes
      document.body.innerHTML = `
        <div class="okta-form-infobox-error">
          <p>There was an error</p>
        </div>
        <div class="o-form-button-bar">
          <input class="button button-primary" value="Sign up">
        <div>
      `;

      // Wait for $timeout
      $flushPendingTasks()

      expect(document.querySelector('.button-primary')).toHaveValue('Continue')
      const errorText = document.querySelector('.okta-form-infobox-error').textContent
      expect(errorText).toContain('There was an error')
      expect(errorText).toContain('Please review the following fields: email.')
    });

    describe('afterRender()', () => {
      beforeEach(() => {
        jest.spyOn($ctrl, 'loadDonorDetails').mockReturnValue(Observable.of({}));
        jest.spyOn($ctrl, 'updateSignUpButtonText').mockImplementation(() => {});
        jest.spyOn($ctrl, 'resetCurrentStepOnRegistrationComplete').mockImplementation(() => {});
        jest.spyOn($ctrl, 'redirectToSignInModalIfNeeded').mockImplementation(() => {});
        jest.spyOn($ctrl, 'injectErrorMessages').mockImplementation(() => {});
        jest.spyOn($ctrl, 'injectBackButton').mockImplementation(() => {});
        jest.spyOn($ctrl, 'showVerificationCodeField').mockImplementation(() => {});
        jest.spyOn($ctrl, 'skipOptionalMFAEnrollment').mockImplementation(() => {});

        $ctrl.$onInit()
      })

      it('updates the form', () => {
        $ctrl.afterRender({ formName: 'enroll-profile' })

        expect($ctrl.updateSignUpButtonText).toHaveBeenCalled()
        expect($ctrl.resetCurrentStepOnRegistrationComplete).toHaveBeenCalled()
        expect($ctrl.redirectToSignInModalIfNeeded).toHaveBeenCalled()
        expect($ctrl.injectErrorMessages).toHaveBeenCalled()
        expect($ctrl.injectBackButton).toHaveBeenCalled()
      })

      it('moves to the email verification form', () => {
        $ctrl.afterRender({ formName: 'enroll-authenticator' })

        expect($ctrl.currentStep).toBe(4)
        expect($ctrl.showVerificationCodeField).toHaveBeenCalled()
      })

      it('shows the loading screen and skips the MFA enroll', () => {
        $ctrl.afterRender({ formName: 'select-authenticator-enroll' })

        expect($ctrl.currentStep).toBe(5)
        expect($ctrl.isLoading).toBeTruthy()
        expect($ctrl.skipOptionalMFAEnrollment).toHaveBeenCalled()
      })
    });

    describe('updateSignUpButtonText', () => {
      beforeEach(() => {
        document.body.innerHTML = `
          <div class="o-form-button-bar">
            <input class="button button-primary" value="Sign up">
          <div>
        `
      })

      it('updates the button text', () => {
        $ctrl.currentStep = 1
        $ctrl.updateSignUpButtonText()

        expect(document.querySelector('.button-primary')).toHaveDisplayValue('Continue')
      })

      it('updates to different text on step 3', () => {
        $ctrl.currentStep = 3
        $ctrl.updateSignUpButtonText()

        expect(document.querySelector('.button-primary')).toHaveDisplayValue('Create Account')
      })

      it('does nothing on step 4', () => {
        $ctrl.currentStep = 4
        $ctrl.updateSignUpButtonText()

        expect(document.querySelector('.button-primary')).toHaveDisplayValue('Sign up')
      })
    })

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
        expect($ctrl.$log.error).toHaveBeenCalledWith('Okta Sign up: Error rendering Okta sign up widget.', error);
        done();
      });
    });
  });

  describe('AfterRender JS Triggers', () => {
    const handleClick = jest.fn();
    window.handleClick = handleClick;
    beforeEach(() => {
      handleClick.mockClear();
    })

    describe('showVerificationCodeField()', () => {
      it('should call handleClick when button link is rendered', () => {
        document.body.innerHTML = `
          <div>
            <button class="button-link enter-auth-code-instead-link" onclick="handleClick()">
              Enter authentication code instead
            </button>
          </div>
        `;

        $ctrl.showVerificationCodeField()
        expect(handleClick).toHaveBeenCalled();
      });

      it("shouldn't call handleClick if button link is not rendered", () => {
        document.body.innerHTML = `
          <div>Something else</div>
        `;

        $ctrl.showVerificationCodeField()
        expect(handleClick).not.toHaveBeenCalled();
      });
    });

    describe('skipOptionalMFAEnrollment()', () => {
      it('should call handleClick when button link is rendered', () => {
        document.body.innerHTML = `
          <div class="select-authenticator-enroll">
            <a class="button skip-all" onclick="handleClick()">
              Continue
            </a>
          </div>
        `;

        $ctrl.skipOptionalMFAEnrollment()
        expect(handleClick).toHaveBeenCalled();
      });

      it("shouldn't call handleClick if button link is not rendered", () => {
        document.body.innerHTML = `
          <div>Something else</div>
        `;

        $ctrl.skipOptionalMFAEnrollment()
        expect(handleClick).not.toHaveBeenCalled();
      });
    });
  });

  describe('Injecting error messages', () => {
    const retryFieldSelector = '.cru-retry-button';
    const inputErrorFieldSelector = '.okta-form-input-error';

    describe('injectErrorMessages()', () => {
      const accountTypeFieldClass = `${inputFieldErrorSelectorPrefix}accountType`;
      const countryFieldClass = `${inputFieldErrorSelectorPrefix}userProfile.country`;
      beforeEach(() => {
        document.body.innerHTML = `
          <div class="okta-form-infobox-error">
            <p>There was an error</p>
          </div>
          <div>
            <div class="o-form-input">
              <div class="${accountTypeFieldClass.slice(1)}"></div>
            </div>
          </div>
          <div>
            <div class="o-form-input">
              <div class="${countryFieldClass.slice(1)}"></div>
            </div>
          </div>
        `;
      });

      it('should not inject any errors as this.signUpErrors is empty', () => {
        $ctrl.signUpErrors = []
        $ctrl.injectErrorMessages()

        const field = document.querySelector(inputErrorFieldSelector);
        expect(field).toBeNull();
      });

      it('should inject error message and add classes', () => {
        const errorSummary = 'accountTypeError';
        $ctrl.signUpErrors = [
          {
            property: 'accountType',
            errorSummary
          }
        ]
        $ctrl.injectErrorMessages()

        const field = document.querySelector(accountTypeFieldClass);
        const errorElement = field.parentNode.querySelector(inputErrorFieldSelector);
        expect(errorElement).not.toBeNull();
        expect(errorElement.getAttribute('role')).toBe('alert');
        expect(errorElement.innerHTML).toContain(errorSummary);
        expect(field.parentNode.classList).toContain('o-form-has-errors');
        // Remove the dot from the selector
        expect(errorElement.classList).toContain(inputErrorFieldSelector.slice(1));
        expect(errorElement.classList).toContain('o-form-input-error');
        expect(errorElement.classList).toContain('o-form-explain');
      });

      it('should inject error message summary array', () => {
        const errorSummary = 'accountTypeError';
        $ctrl.signUpErrors = [
          {
            property: 'accountType',
            errorSummary: [errorSummary, errorSummary]
          }
        ]
        $ctrl.injectErrorMessages()

        const errorElement = document.querySelector(inputErrorFieldSelector);
        expect(errorElement.textContent).toBe(`${errorSummary} ${errorSummary}`);
      });

      it('should sanitize error messages', () => {
        const errorSummary = '<script>console.log("Hacked")</script>';
        $ctrl.signUpErrors = [
          {
            property: 'accountType',
            errorSummary
          }
        ]
        $ctrl.injectErrorMessages()

        const errorElement = document.querySelector(inputErrorFieldSelector);
        expect(errorElement.innerHTML).not.toContain(errorSummary);
        expect(errorElement.innerHTML).toContain('&lt;script&gt;');
      });

      it('should only add the error message passed as a prop', () => {
        $ctrl.signUpErrors = [
          {
            property: 'accountType',
            errorSummary: 'accountTypeError'
          }
        ]
        $ctrl.injectErrorMessages([
          {
            property: 'userProfile.country',
            errorSummary: 'countryError'
          }
        ])
        // No error injected for field accountType
        const accountTypeField = document.querySelector(accountTypeFieldClass);
        const accountTypeErrorElement = accountTypeField.parentNode.querySelector(inputErrorFieldSelector);
        expect(accountTypeErrorElement).toBeNull();

        // Error injected for field userProfile.country
        // - also handling a class with a dot in the name
        const countryTypeField = document.querySelector(`${inputFieldErrorSelectorPrefix}userProfile\\.country`);
        const countryErrorElement = countryTypeField.parentNode.querySelector(inputErrorFieldSelector);
        expect(countryErrorElement).not.toBeNull();
      });

      it('should not duplicate errors', () => {
        $ctrl.signUpErrors = [
          {
            property: 'accountType',
            errorSummary: 'accountTypeError'
          }
        ]
        $ctrl.injectErrorMessages()

        const accountTypeField = document.querySelector(accountTypeFieldClass);
        const accountTypeErrorElement = accountTypeField.parentNode.querySelector(inputErrorFieldSelector);
        expect(accountTypeErrorElement).not.toBeNull();

        $ctrl.injectErrorMessages()
        $ctrl.injectErrorMessages()

        const accountTypeErrorElements = accountTypeField.parentNode.querySelectorAll(inputErrorFieldSelector);
        expect(accountTypeErrorElements.length).toEqual(1);
      });

      describe('error box augmentation', () => {
        let errorBox
        beforeEach(() => {
          $ctrl.signUpErrors = [
            { message: 'Invalid field', property: 'userProfile.unknown' },
            { message: 'Invalid first name', property: 'userProfile.firstName' },
            { message: 'Invalid last name', property: 'userProfile.lastName' },
            { message: 'Invalid email', property: 'userProfile.email' },
            { message: 'Invalid password', property: 'credentials.passcode' },
          ]

          errorBox = document.querySelector('.okta-form-infobox-error')
        })

        afterEach(() => {
          // Ensure that the text provided by Okta is not removed
          expect(errorBox.textContent).toContain('There was an error')
        })

        it('notifies the user which fields had errors in the error box', () => {
          $ctrl.injectErrorMessages()

          expect(errorBox.textContent).toContain('Please review the following fields: first name, last name, email, password.')
        })

        it('is skipped on the verify step', () => {
          $ctrl.currentStep = 4
          $ctrl.injectErrorMessages()

          expect(errorBox.textContent).not.toContain('Please review the following fields:')
        })

        it('is skipped when no whitelisted fields have errors', () => {
          $ctrl.signUpErrors = [$ctrl.signUpErrors[0]]
          $ctrl.injectErrorMessages()

          expect(errorBox.textContent).not.toContain('Please review the following fields')
        })

        it('only creates error messages once', () => {
          $ctrl.injectErrorMessages()
          $ctrl.injectErrorMessages()

          expect(errorBox.textContent.match(/Please review the following fields/g)?.length).toBe(1)
        })
      })
    });

    describe('load errors', () => {
      it('injectCountryLoadError()', () => {
        jest.spyOn($ctrl, 'injectLoadError').mockImplementation(() => {});
        const countryListError  = 'countryListError'
        $ctrl.translations = {
          countryListError
        }
        $ctrl.injectCountryLoadError()
        expect($ctrl.injectLoadError).toBeCalledWith({
          fieldSelector: countryFieldSelector,
          errorMessage: countryListError,
          retryCallback: expect.any(Function)
        })
      });

      it('injectRegionLoadError()', () => {
        jest.spyOn($ctrl, 'injectLoadError').mockImplementation(() => {});
        const regionsLoadingError  = 'regionsLoadingError'
        $ctrl.translations = {
          regionsLoadingError
        }
        $ctrl.injectRegionLoadError()
        expect($ctrl.injectLoadError).toBeCalledWith({
          fieldSelector: regionFieldSelector,
          errorMessage: regionsLoadingError,
          retryCallback: expect.any(Function)
        })
      });

      describe('injectLoadError()', () => {
        let fieldSelector, errorMessage, retryCallback;

        beforeEach(() => {
          fieldSelector = '.o-form-fieldset';
          errorMessage = 'errorMessage';
          retryCallback = jest.fn().mockReturnValue({
            finally: jest.fn().mockReturnValue({
              subscribe: jest.fn()
            })
          });

          document.body.innerHTML = `
            <div class="o-form-fieldset">
              <div class="fieldSelector"></div>
            </div>
          `;

          $ctrl.translations = {
            retry: 'Retry'
          }

          $ctrl.injectLoadError({
            fieldSelector,
            errorMessage,
            retryCallback
          });
        });

        it('should add error message to the field', () => {
          const field = document.querySelector(fieldSelector);
          const errorElement = field.querySelector(inputErrorFieldSelector);
          expect(errorElement).not.toBeNull();
          expect(errorElement.getAttribute('role')).toBe('alert');
          expect(errorElement.innerHTML).toContain(errorMessage);
        });

        it('should add retry button to the field', () => {
          const field = document.querySelector(fieldSelector);
          const retryButton = field.querySelector(retryFieldSelector);
          expect(retryButton).not.toBeNull();
          expect(retryButton.innerHTML).toBe($ctrl.translations.retry);
        });

        it('should call retryCallback on retry button click', () => {
          const retryButton = document.querySelector(retryFieldSelector);
          retryButton.click();
          expect(retryCallback).toHaveBeenCalled();
        });
      });
    });
  });

  describe('injectBackButton', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="o-form-button-bar">
          <input class="button button-primary" value="Sign up">
        <div>
      `
    })

    it('adds back button', () => {
      $ctrl.injectBackButton()

      expect(document.querySelector('.btn-secondary')).toBeInTheDocument()
    })

    it('does not add back button on step 1', () => {
      $ctrl.currentStep = 1
      $ctrl.injectBackButton()

      expect(document.querySelector('.btn-secondary')).not.toBeInTheDocument()
    })

    it('does not add back button on step 4', () => {
      $ctrl.currentStep = 4
      $ctrl.injectBackButton()

      expect(document.querySelector('.btn-secondary')).not.toBeInTheDocument()
    })
  })

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
      const error = new Error('Error signing in')
      jest.spyOn($ctrl.$log, 'error').mockImplementation(() => {})
      const showSignInAndRedirect = jest.fn().mockRejectedValue(error)
      const handleLoginRedirect = jest.fn()
      $ctrl.oktaSignInWidget = {
        showSignInAndRedirect,
        authClient: {
          handleLoginRedirect
        }
      }

      $ctrl.signIn().then(() => {
        expect(handleLoginRedirect).not.toHaveBeenCalled()
        expect($ctrl.$log.error).toHaveBeenCalledWith('Okta Sign up: Error showing Okta sign in widget.', error)
        done()
      }, done)
    })
  })

  describe('loadDonorDetails()', () => {
    const signUpFormData = {
      name: {
        'given-name': user.firstName,
        'family-name': user.lastName,
      },
      'donor-type': user.accountType,
      'organization-name': user.organizationName,
      email: user.email,
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
          expect($ctrl.$log.error).toHaveBeenCalledWith('Okta Sign up: Error loading donorDetails.', error)
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

  describe('saveDonorDetails()', () => {
    const emailFormUri = '/emails/crugive'
    const signUpDonorDetails = {
      name: {
        'given-name': user.firstName,
        'family-name': user.lastName
      },
      'donor-type': user.accountType,
      'organization-name': 'Organization Name',
      email: user.email,
      mailingAddress: {
        streetAddress: user.streetAddress,
        extendedAddress: 'extendedAddress',
        intAddressLine3: 'intAddressLine3',
        intAddressLine4: 'intAddressLine4',
        locality: user.city,
        region: user.state,
        postalCode: '12345-678',
        country: user.countryCode
      }
    }
    beforeEach(() => {
      $ctrl.$scope.firstName = user.firstName
      $ctrl.$scope.lastName = user.lastName
      $ctrl.$scope.email = user.email
      $ctrl.$scope.accountType = user.accountType
      $ctrl.$scope.organizationName = 'Organization Name'
      $ctrl.$scope.streetAddress = user.streetAddress
      $ctrl.$scope.streetAddressExtended = 'extendedAddress'
      $ctrl.$scope.internationalAddressLine3 = 'intAddressLine3'
      $ctrl.$scope.internationalAddressLine4 = 'intAddressLine4'
      $ctrl.$scope.city = user.city
      $ctrl.$scope.state = user.state
      $ctrl.$scope.zipCode = user.zipCode
      $ctrl.$scope.countryCode = user.countryCode

      jest.spyOn($ctrl.orderService, 'getDonorDetails').mockReturnValue(Observable.of({
        'registration-state': 'NEW',
        name: {
          'given-name': 'Existing',
          'family-name': 'Existing'
        },
        'donor-type': '',
        email: 'existing.email@cru.org',
        mailingAddress: {
          streetAddress: '',
          locality: '',
          region: '',
          postalCode: '',
          country: 'CANADA'
        },
        emailFormUri
      }))
      jest.spyOn($ctrl.orderService, 'addEmail').mockImplementation(() => Observable.of({}))
      jest.spyOn($ctrl, 'redirectToOktaForLogin')
      jest.spyOn($ctrl, 'onSignUpError')

      $ctrl.oktaSignInWidget = {
        remove: jest.fn(),
        renderEl: jest.fn(),
        off: jest.fn()
      }
    })

    it("should succeed updating the user's data, redirecting to Okta", () => {
      jest.spyOn($ctrl.orderService, 'updateDonorDetails').mockImplementation(() => Observable.of({}))
      $ctrl.isLoading = false

      $ctrl.saveDonorDetails()

      expect($ctrl.isLoading).toEqual(true)
      expect($ctrl.orderService.updateDonorDetails).toHaveBeenCalledWith(expect.objectContaining(signUpDonorDetails))
      expect($ctrl.orderService.addEmail).toHaveBeenCalledWith(signUpDonorDetails.email, emailFormUri)
      expect($ctrl.redirectToOktaForLogin).toHaveBeenCalled()
      expect($ctrl.onSignUpError).not.toHaveBeenCalled()
    })

    it("should fail while updating the user's data, opening the contact info modal", () => {
      jest.spyOn($ctrl.orderService, 'updateDonorDetails').mockImplementation(() => Observable.throw({}))
      $ctrl.saveDonorDetails()

      expect($ctrl.redirectToOktaForLogin).not.toHaveBeenCalled()
      expect($ctrl.onSignUpError).toHaveBeenCalled()
    })
  });

  describe('redirectToOktaForLogin', () => {
    it('should call sessionService.signIn', () => {
      $ctrl.$scope.email = user.email
      $ctrl.redirectToOktaForLogin()
      expect($ctrl.sessionService.signIn).toHaveBeenCalledWith($ctrl.lastPurchaseId, user.email)
    })
  })
})
