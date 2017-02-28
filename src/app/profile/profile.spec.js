import angular from 'angular';
import 'angular-mocks';
import module from './profile.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import {SignOutEvent} from 'common/services/session/session.service';

describe( 'ProfileComponent', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( ( _$componentController_ ) => {
    $ctrl = _$componentController_( module.name, {
      $window: {location: '/profile.html'}
    }, {
      donorEmailForm: {
        $setPristine: jasmine.createSpy('$setPristine'),
        $dirty: true,
        $invalid: false,
        $valid: true
      },
      spouseEmailForm: {
        $setPristine: jasmine.createSpy('$setPristine'),
        $dirty: true,
        $invalid: false,
        $valid: true
      },
      mailingAddressForm: {
        $setPristine: jasmine.createSpy('$setPristine'),
        $dirty: true,
        $invalid: false,
        $valid: true
      },
      donorDetailsForm: {
        $setPristine: jasmine.createSpy('$setPristine'),
        $dirty: true,
        $invalid: false,
        $valid: true
      },
      spouseDetailsForm: {
        $setPristine: jasmine.createSpy('$setPristine'),
        $dirty: true,
        $invalid: false,
        $valid: true,
        title: {
          $dirty: true
        },
        suffix: {
          $dirty: true
        }
      },
      phoneNumberForms: [{
        $setPristine: jasmine.createSpy('$setPristine'),
        $setDirty: jasmine.createSpy('$setPristine'),
        $dirty: true,
        $invalid: false,
        $valid: true,
        phoneNumber: {
          $setValidity: jasmine.createSpy('$setPristine')
        }
      }]
    } );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
    expect( $ctrl.$window ).toBeDefined();
    expect( $ctrl.$log ).toBeDefined();
    expect( $ctrl.$location ).toBeDefined();
    expect( $ctrl.$rootScope ).toBeDefined();
    expect( $ctrl.sessionEnforcerService ).toBeDefined();
    expect( $ctrl.profileService ).toBeDefined();
  } );

  describe( '$onInit()', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'loadDonorDetails' );
      spyOn( $ctrl, 'loadMailingAddress' );
      spyOn( $ctrl, 'loadEmail' );
      spyOn( $ctrl, 'loadPhoneNumbers' );
      spyOn( $ctrl, 'syncPhoneValidators' );
      spyOn( $ctrl, 'sessionEnforcerService' );
      spyOn( $ctrl.$rootScope, '$on' );
      spyOn( $ctrl, 'signedOut' );
    } );

    it('should call syncPhoneValidators', () =>{
      $ctrl.$onInit();
      expect( $ctrl.syncPhoneValidators ).toHaveBeenCalled();
    });

    it( 'adds listener for sign-out event', () => {
      $ctrl.$onInit();
      expect( $ctrl.$rootScope.$on ).toHaveBeenCalledWith( SignOutEvent, jasmine.any( Function ) );
      $ctrl.$rootScope.$on.calls.argsFor( 0 )[1]();
      expect( $ctrl.signedOut ).toHaveBeenCalled();
    } );

    describe( 'sessionEnforcerService success', () => {
      it( 'executes success callback', () => {
        $ctrl.$onInit();
        $ctrl.sessionEnforcerService.calls.argsFor( 0 )[1]['sign-in']();
        expect( $ctrl.loadDonorDetails ).toHaveBeenCalled();
        expect( $ctrl.loadMailingAddress ).toHaveBeenCalled();
        expect( $ctrl.loadEmail ).toHaveBeenCalled();
      } );
    } );

    describe( 'sessionEnforcerService failure', () => {
      it( 'executes failure callback', () => {
        $ctrl.$onInit();
        $ctrl.sessionEnforcerService.calls.argsFor( 0 )[1]['cancel']();
        expect( $ctrl.$window.location ).toEqual( '/' );
      } );
    } );
  } );

  describe( '$onDestroy()', () => {
    it( 'cleans up the component', () => {
      spyOn( $ctrl.sessionEnforcerService, 'cancel' );

      $ctrl.enforcerId = '1234567890';
      $ctrl.$onDestroy();
      expect( $ctrl.sessionEnforcerService.cancel ).toHaveBeenCalledWith( '1234567890' );
    } );
  } );

  describe( 'signedOut( event )', () => {
    describe( 'default prevented', () => {
      it( 'does nothing', () => {
        $ctrl.signedOut( {defaultPrevented: true} );
        expect( $ctrl.$window.location ).toEqual( '/profile.html' );
      } );
    } );

    describe( 'default not prevented', () => {
      it( 'navigates to \'\/\'', () => {
        let spy = jasmine.createSpy( 'preventDefault' );
        $ctrl.signedOut( {defaultPrevented: false, preventDefault: spy} );
        expect( spy ).toHaveBeenCalled();
        expect( $ctrl.$window.location ).toEqual( '/' );
      } );
    } );
  } );

  describe('loadDonorDetails()', () => {
    it('should load donor details on $onInit() and have a spouse info', () => {
      let data = {
        'spouse-name': {
          'family-name': 'abc'
        }
      };
      spyOn($ctrl.profileService, 'getProfileDonorDetails').and.returnValue(Observable.of(data));
      $ctrl.loadDonorDetails();
      expect($ctrl.donorDetails).toBe(data);
      expect($ctrl.hasSpouse).toBe(true);
      expect($ctrl.profileService.getProfileDonorDetails).toHaveBeenCalled();
    });

    it('should load donor details on $onInit() without spouse info', () => {
      let data = {
        'spouse-name': {
          'family-name': undefined
        }
      };
      spyOn($ctrl.profileService, 'getProfileDonorDetails').and.returnValue(Observable.of(data));
      $ctrl.loadDonorDetails();
      expect($ctrl.hasSpouse).toBe(false);
    });

    it('should handle and error of loading donor details on $onInit()', () => {
      spyOn($ctrl.profileService, 'getProfileDonorDetails').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.loadDonorDetails();
      expect($ctrl.donorDetailsError).toBe('loading');
      expect($ctrl.profileService.getProfileDonorDetails).toHaveBeenCalled();
    });
  });

  describe('updateDonorDetails()', () => {
    it('should update donor details ', () => {
      spyOn($ctrl.profileService, 'updateProfileDonorDetails').and.returnValue(Observable.of(''));
      spyOn($ctrl,'updateEmail');
      $ctrl.updateDonorDetails();
      expect($ctrl.profileService.updateProfileDonorDetails).toHaveBeenCalled();
      expect($ctrl.donorDetailsForm.$setPristine).toHaveBeenCalled();
      expect($ctrl.updateEmail).toHaveBeenCalled();
    });

    it('should handle and error of updating donor details', () => {
      spyOn($ctrl.profileService, 'updateProfileDonorDetails').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.updateDonorDetails();
      expect($ctrl.donorDetailsError).toBe('updating');
      expect($ctrl.profileService.updateProfileDonorDetails).toHaveBeenCalled();
    });
  });

  describe('loadMailingAddress()', () => {
    it('should load mailing address on $onInit()', () => {
      let data = {
        address: {
          country: 'US',
          streetAddress: '123 First St',
          extendedAddress: '',
          locality: 'Sacramento',
          region: 'CA'
        }
      };
      spyOn($ctrl.profileService, 'getMailingAddress').and.returnValue(Observable.of(data));
      $ctrl.loadMailingAddress();
      expect($ctrl.profileService.getMailingAddress).toHaveBeenCalled();
    });


    it('should handle and error of loading mailing address on $onInit()', () => {
      spyOn($ctrl.profileService, 'getMailingAddress').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.loadMailingAddress();
      expect($ctrl.mailingAddressError).toBe('loading');
      expect($ctrl.profileService.getMailingAddress).toHaveBeenCalled();
    });
  });

  describe('loadEmail()', () => {
    it('should load email on $onInit()', () => {
      let data = [{ email: 'donor@email.com' }, { email: 'spouse@email.com' }];

      spyOn($ctrl.profileService, 'getEmails').and.returnValue(Observable.of(data));
      $ctrl.loadEmail();
      expect($ctrl.donorEmail).toEqual({ email: 'donor@email.com' });
      expect($ctrl.spouseEmail).toEqual({ email: 'spouse@email.com' });
      expect($ctrl.profileService.getEmails).toHaveBeenCalled();
    });

    it('should load email on $onInit() and handle empty response', () => {
      let data = undefined;

      spyOn($ctrl.profileService, 'getEmails').and.returnValue(Observable.of(data));
      $ctrl.loadEmail();
      expect($ctrl.donorEmail).toEqual({ email: '' });
      expect($ctrl.spouseEmail).toEqual({ email: '' });
      expect($ctrl.profileService.getEmails).toHaveBeenCalled();
    });

    it('should handle and error of loading email on $onInit()', () => {
      spyOn($ctrl.profileService, 'getEmails').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.loadEmail();
      expect($ctrl.emailAddressError).toBe('loading');
      expect($ctrl.profileService.getEmails).toHaveBeenCalled();
    });
  });

  describe('updateEmail()', () => {
    it('should update donor email', () => {
      spyOn($ctrl.profileService, 'updateEmail').and.returnValue(Observable.of({email: 'new email'}));
      $ctrl.updateEmail(false);
      expect($ctrl.donorEmail).toEqual({email: 'new email'});
      expect($ctrl.profileService.updateEmail).toHaveBeenCalled();
    });

    it('should update spouse email', () => {
      spyOn($ctrl.profileService, 'updateEmail').and.returnValue(Observable.of({email: 'new email'}));
      $ctrl.updateEmail(true);
      expect($ctrl.spouseEmail).toEqual({email: 'new email'});
      expect($ctrl.profileService.updateEmail).toHaveBeenCalled();
    });

    it('should handle and error of updating email', () => {
      spyOn($ctrl.profileService, 'updateEmail').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.updateEmail();
      expect($ctrl.emailAddressError).toBe('updating');
      expect($ctrl.profileService.updateEmail).toHaveBeenCalled();
    });
  });

  describe('syncPhoneValidators()', () => {
    it('should add phone number validators to inputs', () => {
      $ctrl.phoneNumberForms = {};
      $ctrl.syncPhoneValidators();
      $ctrl.$scope.$apply();
      expect($ctrl.phoneNumberForms).toEqual({});
      $ctrl.phoneNumberForms[0] = {
        phoneNumber: {
          $validators: {}
        }
      };
      $ctrl.$scope.$apply();
      expect( $ctrl.phoneNumberForms[0].phoneNumber.$validators.phone( '541-967-0010' ) ).toEqual( true );
      expect( $ctrl.phoneNumberForms[0].phoneNumber.$validators.phone( '123-456-7890' ) ).toEqual( false );
    });
  });

  describe('loadPhoneNumbers()', () => {
    it('should load phone numbers on $onInit()', () => {
      spyOn($ctrl.profileService, 'getPhoneNumbers').and.returnValue(Observable.of([{}]));
      $ctrl.loadPhoneNumbers();
      expect($ctrl.phoneNumbers).toEqual([{ ownerChanged: false }]);
      expect($ctrl.profileService.getPhoneNumbers).toHaveBeenCalled();
    });

    it('should handle and error of loading phone numbers on $onInit()', () => {
      spyOn($ctrl.profileService, 'getPhoneNumbers').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.loadPhoneNumbers();
      expect($ctrl.phoneNumberError).toBe('loading');
      expect($ctrl.profileService.getPhoneNumbers).toHaveBeenCalled();
    });
  });

  describe('addPhoneNumber()', () => {
    it('should add blank phone number to the list', () => {
      $ctrl.phoneNumbers = [];
      $ctrl.addPhoneNumber();
      expect($ctrl.phoneNumbers.length).toBe(1);
    });
  });

  describe('phoneOwner()', () => {
    it('should return phone owner name', () => {
      $ctrl.donorDetails = {
        name: {
          'given-name': 'donor'
        },
        'spouse-name': {
          'given-name': 'spouse'
        }
      };
      expect($ctrl.phoneOwner(false)).toBe('donor');
      expect($ctrl.phoneOwner(true)).toBe('spouse');
    });
  });

  describe('updatePhoneNumbers()', () => {
    it('should set phone number for the change of owner', () => {
      $ctrl.phoneNumbers = [
        {
          ownerChanged: true // existing phone number to switch owner
        }
      ];
      $ctrl.updatePhoneNumbers();
      expect($ctrl.phoneNumbers.length).toBe(2);
      expect($ctrl.phoneNumbers[0].delete).toBe(true);
    });

    it('should update phone number', () => {
      $ctrl.phoneNumbers = [
        {
          self: {
            uri: ''
          } // existing phone number to update
        }
      ];
      spyOn($ctrl.profileService, 'updatePhoneNumber').and.returnValue(Observable.of('data'));
      spyOn($ctrl, 'resetPhoneNumberForms');
      $ctrl.updatePhoneNumbers();
      expect($ctrl.profileService.updatePhoneNumber).toHaveBeenCalled();
      expect($ctrl.resetPhoneNumberForms).toHaveBeenCalled();
    });

    it('should fail updating phone number', () => {
      $ctrl.phoneNumbers = [
        {
          self: {
            uri: ''
          } // existing phone number to update
        }
      ];
      spyOn($ctrl.profileService, 'updatePhoneNumber').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.updatePhoneNumbers();
      expect($ctrl.profileService.updatePhoneNumber).toHaveBeenCalled();
      expect($ctrl.phoneNumberError).toBe('updating');
    });

    it('should delete phone number', () => {
      $ctrl.phoneNumbers = [
        {
          self: {
            uri: ''
          },
          delete: true
        }
      ];
      spyOn($ctrl.profileService, 'deletePhoneNumber').and.returnValue(Observable.of('data'));
      spyOn($ctrl, 'resetPhoneNumberForms');
      $ctrl.updatePhoneNumbers();
      expect($ctrl.profileService.deletePhoneNumber).toHaveBeenCalled();
      expect($ctrl.resetPhoneNumberForms).toHaveBeenCalled();
    });

    it('should fail deleting phone number', () => {
      $ctrl.phoneNumbers = [
        {
          self: {
            uri: ''
          },
          delete: true
        }
      ];
      spyOn($ctrl.profileService, 'deletePhoneNumber').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.updatePhoneNumbers();
      expect($ctrl.profileService.deletePhoneNumber).toHaveBeenCalled();
      expect($ctrl.phoneNumberError).toBe('updating');
    });

    it('should add phone number', () => {
      $ctrl.phoneNumbers = [
        {
          self: false,
          delete: false
        }
      ];
      spyOn($ctrl.profileService, 'addPhoneNumber').and.returnValue(Observable.of({
        self: '<new link>',
        'phone-number': '444'
      }));
      $ctrl.profileService.addPhoneNumber.calls.saveArgumentsByValue();
      spyOn($ctrl, 'resetPhoneNumberForms');
      $ctrl.updatePhoneNumbers();
      expect($ctrl.profileService.addPhoneNumber).toHaveBeenCalledWith({
        self: false,
        delete: false
      });
      expect($ctrl.resetPhoneNumberForms).toHaveBeenCalled();
      expect($ctrl.phoneNumbers).toEqual([
        {
          self: '<new link>',
          'phone-number': '444',
          delete: false
        }
      ]);
    });

    it('should fail adding phone number', () => {
      $ctrl.phoneNumbers = [
        {
          self: false,
          delete: false
        }
      ];
      spyOn($ctrl.profileService, 'addPhoneNumber').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.updatePhoneNumbers();
      expect($ctrl.profileService.addPhoneNumber).toHaveBeenCalled();
      expect($ctrl.phoneNumberError).toBe('updating');
    });

    it('should handle duplicate phone number error', () => {
      $ctrl.phoneNumbers = [
        {
          self: false,
          delete: false
        }
      ];
      spyOn($ctrl.profileService, 'addPhoneNumber').and.returnValue(Observable.throw({
        data: 'Failed to create phone number because it already exists.'
      }));
      $ctrl.updatePhoneNumbers();
      expect($ctrl.profileService.addPhoneNumber).toHaveBeenCalled();
      expect($ctrl.phoneNumberError).toBe('duplicate');
    });

  });

  describe('deletePhoneNumber()', () => {
    it('should delete phone number from a local list', () => {
      let phone = {
        delete: false
      };
      $ctrl.deletePhoneNumber(phone, 0);
      expect($ctrl.phoneNumberForms[0].phoneNumber.$setValidity).toHaveBeenCalled();
      expect($ctrl.phoneNumberForms[0].$setPristine).toHaveBeenCalled();

      phone.self = {};
      $ctrl.deletePhoneNumber(phone, 0);
      expect($ctrl.phoneNumberForms[0].$setDirty).toHaveBeenCalled();
    });
  });

  describe('invalidPhoneNumbers()', () => {
    it('should return true if at least one phone number form is invalid', () => {
      expect($ctrl.invalidPhoneNumbers()).toBe(false);
      $ctrl.phoneNumberForms[0].$invalid = true;
      expect($ctrl.invalidPhoneNumbers()).toBe(true);
    });
  });

  describe('dirtyPhoneNumbers()', () => {
    it('should return true if at least one phone number is $dirty', () => {
      expect($ctrl.dirtyPhoneNumbers()).toBe(true);
      $ctrl.phoneNumberForms[0].$dirty = false;
      expect($ctrl.dirtyPhoneNumbers()).toBe(false);
    });
  });

  describe('resetPhoneNumberForms()', () => {
    it('should reset phone number forms after update', () => {
      $ctrl.resetPhoneNumberForms();
      expect($ctrl.phoneNumberForms[0].$setPristine).toHaveBeenCalled();
    });
  });

  describe('updateMailingAddress()', () => {
    beforeEach( () => {
      $ctrl.donorDetails = {
        name: {}
      };
      $ctrl.mailingAddress = {
        name: {}
      };
    });
    it('should update mailing address', () => {
      spyOn($ctrl.profileService, 'updateMailingAddress').and.returnValue(Observable.of('data'));
      $ctrl.updateMailingAddress();
      expect($ctrl.mailingAddressForm.$setPristine).toHaveBeenCalled();
    });

    it('should fail updating mailing address', () => {
      spyOn($ctrl.profileService, 'updateMailingAddress').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.updateMailingAddress();
      expect($ctrl.mailingAddressError).toBe('updating');
    });
  });

  describe('saveSpouse()', () => {
    beforeEach(() => {
      $ctrl.donorDetails = {
        self: {
          uri: '/selfservicedonordetails/crugive'
        },
        'spouse-name': {
          'given-name': 'Sarah'
        }
      };
    });
    it('should save spouse info', () => {
      spyOn($ctrl,'updateDonorDetails');
      spyOn($ctrl.profileService, 'addSpouse').and.returnValue(Observable.of('data'));
      $ctrl.saveSpouse();
      expect($ctrl.profileService.addSpouse).toHaveBeenCalledWith('/donordetails/crugive/spousedetails', $ctrl.donorDetails['spouse-name']);
      expect($ctrl.updateDonorDetails).toHaveBeenCalled();

      $ctrl.spouseDetailsForm.title.$dirty = false;
      $ctrl.saveSpouse();
      expect($ctrl.updateDonorDetails).toHaveBeenCalled();
    });

    it('should handle fail of saving spouse info', () => {
      spyOn($ctrl.profileService, 'addSpouse').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.saveSpouse();
      expect($ctrl.donorDetailsError).toBe('saving spouse');
    });
  });

  describe('hasError()', () => {
    it('should return true if there has been an error after hitting end points', () => {
      $ctrl.donorDetailsError = false;
      $ctrl.emailAddressError = false;
      $ctrl.mailingAddressError = false;
      $ctrl.phoneNumberError = false;
      expect($ctrl.hasError()).toBe(false);

      $ctrl.phoneNumberError = true;
      expect($ctrl.hasError()).toBe(true);
    });
  });

  describe('invalid()', () => {
    it('should return true if form data is invalid', () => {
      expect($ctrl.touched()).toBe(true);
      $ctrl.donorEmailForm.$invalid = false;
      $ctrl.spouseEmailForm.$invalid = false;
      $ctrl.donorDetailsForm.$invalid = false;
      $ctrl.spouseDetailsForm.$invalid = false;
      $ctrl.mailingAddressForm.$invalid = false;
      $ctrl.phoneNumberForms[0].$invalid = false;
      $ctrl.addingSpouse = true;
      expect($ctrl.invalid()).toBe(false);

      $ctrl.mailingAddressForm.$invalid = true;
      expect($ctrl.invalid()).toBe(true);

      $ctrl.spouseEmailForm = false;
      $ctrl.addingSpouse = false;
      $ctrl.mailingAddressForm.$invalid = false;
      expect($ctrl.invalid()).toBe(false);
    });
  });

  describe('touched()', () => {
    it('should return true if form data has changed', () => {
      expect($ctrl.touched()).toBe(true);
      $ctrl.donorEmailForm.$dirty = false;
      $ctrl.spouseEmailForm.$dirty = false;
      $ctrl.donorDetailsForm.$dirty = false;
      $ctrl.spouseDetailsForm.$dirty = false;
      $ctrl.mailingAddressForm.$dirty = false;
      $ctrl.phoneNumberForms[0].$dirty = false;
      $ctrl.addingSpouse = true;
      $ctrl.hasSpouse = true;
      expect($ctrl.touched()).toBe(false);

      $ctrl.addingSpouse = false;
      $ctrl.hasSpouse = false;
      expect($ctrl.touched()).toBe(false);
    });
  });

  describe('loading()', () => {
    it('should return true if any of the forms is loading', () => {
      $ctrl.donorDetailsLoading = false;
      $ctrl.emailLoading = false;
      $ctrl.mailingAddressLoading = false;
      $ctrl.phonesLoading = false;
      expect($ctrl.loading()).toBe(false);

      $ctrl.mailingAddressLoading = true;
      expect($ctrl.loading()).toBe(true);
    });
  });

  describe('onSubmit()', () => {
    it('should submit if forms are ready', () => {
      spyOn($ctrl,'updateDonorDetails');
      spyOn($ctrl,'updateEmail');
      spyOn($ctrl,'saveSpouse');
      spyOn($ctrl,'updatePhoneNumbers');
      spyOn($ctrl,'updateMailingAddress');
      $ctrl.$window.scrollTo = jasmine.createSpy('scrollTo');
      $ctrl.donorEmailForm.$dirty = true;
      $ctrl.spouseEmailForm.$dirty = true;
      $ctrl.donorDetailsForm.$dirty = true;
      $ctrl.spouseDetailsForm.$dirty = true;
      $ctrl.mailingAddressForm.$dirty = true;
      $ctrl.phoneNumberForms[0].$dirty = true;
      $ctrl.addingSpouse = undefined;
      $ctrl.spouseDetailsForm.$valid = true;
      $ctrl.onSubmit();
      expect($ctrl.updateDonorDetails).toHaveBeenCalled();
      expect($ctrl.updateEmail).toHaveBeenCalled();
      expect($ctrl.updatePhoneNumbers).toHaveBeenCalled();
      expect($ctrl.updateMailingAddress).toHaveBeenCalled();
      expect($ctrl.$window.scrollTo).toHaveBeenCalled();

      // $ctrl.donorDetailsForm.$dirty = false;
      $ctrl.addingSpouse = true;
      $ctrl.hasSpouse = true;
      $ctrl.onSubmit();
      expect($ctrl.updateEmail).toHaveBeenCalledWith(true);
      expect($ctrl.saveSpouse).toHaveBeenCalled();
    });
  });

});
