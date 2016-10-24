import angular from 'angular';
import 'angular-mocks';
import module from './profile.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

fdescribe( 'ProfileComponent', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( ( _$componentController_ ) => {
    $ctrl = _$componentController_( module.name, {
      $window: {location: ''}
    }, {
      emailAddressForm: {
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
      phoneNumberForms: [{
        $setPristine: jasmine.createSpy('$setPristine'),
        $setValidity: jasmine.createSpy('$setPristine'),
        $setDirty: jasmine.createSpy('$setPristine'),
        $dirty: true,
        $invalid: false,
        $valid: true
      }]
    } );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
    expect( $ctrl.$window ).toBeDefined();
    expect( $ctrl.$log ).toBeDefined();
    expect( $ctrl.$location ).toBeDefined();
    expect( $ctrl.sessionEnforcerService ).toBeDefined();
    expect( $ctrl.profileService ).toBeDefined();
  } );

  describe( '$onInit()', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'loadDonorDetails' );
      spyOn( $ctrl, 'loadMailingAddress' );
      spyOn( $ctrl, 'loadEmail' );
      spyOn( $ctrl, 'loadPhoneNumbers' );
      spyOn( $ctrl, 'sessionEnforcerService' );
    } );

    describe( 'sessionEnforcerService success', () => {
      it( 'executes success callback', () => {
        $ctrl.$onInit();
        $ctrl.sessionEnforcerService.calls.argsFor( 0 )[1]['sign-in']();
        expect( $ctrl.loadDonorDetails ).toHaveBeenCalled();
        expect( $ctrl.loadMailingAddress ).toHaveBeenCalled();
        expect( $ctrl.loadEmail ).toHaveBeenCalled();
        expect( $ctrl.loadPhoneNumbers ).toHaveBeenCalled();
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

  describe('getDonorDetails()', () => {
    it('should load donor details on $onInit()', () => {
      spyOn($ctrl.profileService, 'getDonorDetails').and.returnValue(Observable.of('donorDetails'));
      $ctrl.loadDonorDetails();
      expect($ctrl.donorDetails).toBe('donorDetails');
      expect($ctrl.profileService.getDonorDetails).toHaveBeenCalled();
    });

    it('should handle and error of loading donor details on $onInit()', () => {
      spyOn($ctrl.profileService, 'getDonorDetails').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.loadDonorDetails();
      expect($ctrl.donorDetailsError).toBe('Failed loading profile details.');
      expect($ctrl.profileService.getDonorDetails).toHaveBeenCalled();
    });
  });

  describe('loadMailingAddress()', () => {
    it('should load mailing address on $onInit()', () => {
      let data = {
        links: [
          {
            rel: 'mailingaddress',
            uri: 'uri'
          }
        ],
        address: {
          'country-name': 'USA'
        }
      }
      spyOn($ctrl.profileService, 'getMailingAddress').and.returnValue(Observable.of(data));
      $ctrl.loadMailingAddress();
      expect($ctrl.profileService.getMailingAddress).toHaveBeenCalled();
    });

    it('should handle and error of loading mailing address on $onInit()', () => {
      spyOn($ctrl.profileService, 'getMailingAddress').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.loadMailingAddress();
      expect($ctrl.mailingAddressError).toBe('Failed loading mailing address.');
      expect($ctrl.profileService.getMailingAddress).toHaveBeenCalled();
    });
  });

  describe('loadEmail()', () => {
    it('should load email on $onInit()', () => {
      spyOn($ctrl.profileService, 'getEmail').and.returnValue(Observable.of('email'));
      $ctrl.loadEmail();
      expect($ctrl.email).toBe('email');
      expect($ctrl.profileService.getEmail).toHaveBeenCalled();
    });

    it('should handle and error of loading email on $onInit()', () => {
      spyOn($ctrl.profileService, 'getEmail').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.loadEmail();
      expect($ctrl.emailAddressError).toBe('Failed loading email.');
      expect($ctrl.profileService.getEmail).toHaveBeenCalled();
    });
  });

  describe('loadPhoneNumbers()', () => {
    it('should load phone numbers on $onInit()', () => {
      spyOn($ctrl.profileService, 'getPhoneNumbers').and.returnValue(Observable.of('phoneNumbers'));
      $ctrl.loadPhoneNumbers();
      expect($ctrl.phoneNumbers).toBe('phoneNumbers');
      expect($ctrl.profileService.getPhoneNumbers).toHaveBeenCalled();
    });

    it('should handle and error of loading phone numbers on $onInit()', () => {
      spyOn($ctrl.profileService, 'getPhoneNumbers').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.loadPhoneNumbers();
      expect($ctrl.phoneNumberError).toBe('Failed loading phone numbers.');
      expect($ctrl.profileService.getPhoneNumbers).toHaveBeenCalled();
    });
  });

  describe('updateEmail()', () => {
    it('should update email', () => {
      spyOn($ctrl.profileService, 'updateEmail').and.returnValue(Observable.of({email: 'new email'}));
      $ctrl.updateEmail();
      expect($ctrl.email).toBe('new email');
      expect($ctrl.profileService.updateEmail).toHaveBeenCalled();
    });

    it('should handle and error of updating email', () => {
      spyOn($ctrl.profileService, 'updateEmail').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.updateEmail();
      expect($ctrl.emailAddressError).toBe('Failed updating email address.');
      expect($ctrl.profileService.updateEmail).toHaveBeenCalled();
    });
  });

  describe('addPhoneNumber()', () => {
    it('should add blank phone number to the list', () => {
      $ctrl.phoneNumbers = [];
      $ctrl.addPhoneNumber();
      expect($ctrl.phoneNumbers.length).toBe(1);
    });
  });

  describe('updatePhoneNumbers()', () => {
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
      expect($ctrl.phoneNumberError).toBe('Failed updating phone numbers.')
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
      expect($ctrl.phoneNumberError).toBe('Failed deleting phone numbers.')
    });

    it('should add phone number', () => {
      $ctrl.phoneNumbers = [
        {
          self: false,
          delete: false
        }
      ];
      spyOn($ctrl.profileService, 'addPhoneNumber').and.returnValue(Observable.of('data'));
      spyOn($ctrl, 'resetPhoneNumberForms');
      $ctrl.updatePhoneNumbers();
      expect($ctrl.profileService.addPhoneNumber).toHaveBeenCalled();
      expect($ctrl.resetPhoneNumberForms).toHaveBeenCalled();
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
      expect($ctrl.phoneNumberError).toBe('Failed adding phone numbers.')
    });

  });

  describe('deletePhoneNumber()', () => {
    it('should delete phone number from a local list', () => {
      let phone = {
        delete: false
      };
      $ctrl.deletePhoneNumber(phone, $ctrl.phoneNumberForms[0]);
      expect($ctrl.phoneNumberForms[0].$setValidity).toHaveBeenCalled();
      expect($ctrl.phoneNumberForms[0].$setPristine).toHaveBeenCalled();

      phone.self = {};
      $ctrl.deletePhoneNumber(phone, $ctrl.phoneNumberForms[0]);
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
    it('should update mailing address', () => {
      spyOn($ctrl.profileService, 'updateMailingAddress').and.returnValue(Observable.of('data'));
      $ctrl.updateMailingAddress();
      expect($ctrl.profileService.updateMailingAddress).toHaveBeenCalled();
    });

    it('should fail updating mailing address', () => {
      spyOn($ctrl.profileService, 'updateMailingAddress').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.updateMailingAddress();
      expect($ctrl.mailingAddressError).toBe('Failed loading mailing address.');
    });
  });

  describe('notReadyToSubmit()', () => {
    it('should return true if form is invalid or untouched', () => {
      expect($ctrl.notReadyToSubmit()).toBe(false);
      $ctrl.emailAddressForm.$dirty = false;
      $ctrl.donorDetailsForm.$dirty = false;
      $ctrl.mailingAddressForm.$dirty = false;
      $ctrl.phoneNumberForms[0].$dirty = false;
      expect($ctrl.notReadyToSubmit()).toBe(true);
    });
  });

  describe('onSubmit()', () => {
    it('should submit if forms are ready', () => {
      spyOn($ctrl,'updateDonorDetails');
      spyOn($ctrl,'updateEmail');
      spyOn($ctrl,'updatePhoneNumbers');
      spyOn($ctrl,'updateMailingAddress');
      $ctrl.emailAddressForm.$dirty = true;
      $ctrl.donorDetailsForm.$dirty = true;
      $ctrl.mailingAddressForm.$dirty = true;
      $ctrl.phoneNumberForms[0].$dirty = true;
      $ctrl.onSubmit();
      expect($ctrl.updateDonorDetails).toHaveBeenCalled();
      expect($ctrl.updateEmail).toHaveBeenCalled();
      expect($ctrl.updatePhoneNumbers).toHaveBeenCalled();
      expect($ctrl.updateMailingAddress).toHaveBeenCalled();
    });
  });

});
