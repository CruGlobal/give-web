import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {Sessions} from 'common/services/session/session.service';
import {cortexRole} from 'common/services/session/fixtures/cortex-role';
import {cruProfile} from 'common/services/session/fixtures/cru-profile';
import {SignInEvent} from 'common/services/session/session.service';

import module from './contactInfo.component.js';

describe('contactInfo', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function($componentController) {
    self.controller = $componentController(module.name, {}, {
      detailsForm: {
        $valid: false,
        $setSubmitted: jasmine.createSpy('$setSubmitted')
      },
      onSubmit: jasmine.createSpy('onSubmit')
    });
  }));

  describe('$onInit', () => {
    it('load the necessary data', () => {
      spyOn(self.controller, 'loadDonorDetails');
      spyOn(self.controller, 'waitForFormInitialization');
      self.controller.$onInit();
      expect(self.controller.loadDonorDetails).toHaveBeenCalled();
      expect(self.controller.waitForFormInitialization).toHaveBeenCalled();
    });
    it('should call loadDonorDetails on sign in', () => {
      spyOn(self.controller, 'loadDonorDetails');
      self.controller.$onInit();
      expect(self.controller.loadDonorDetails).toHaveBeenCalled();
      self.controller.loadDonorDetails.calls.reset();
      self.controller.$scope.$broadcast(SignInEvent);
      expect(self.controller.loadDonorDetails).toHaveBeenCalled();
    });
  });

  describe('$onChanges', () => {
    it('should call submitDetails when submitted changes true', () => {
      spyOn(self.controller, 'submitDetails');
      self.controller.$onChanges({
        submitted: {
          currentValue: true
        }
      });
      expect(self.controller.submitDetails).toHaveBeenCalled();
    });
  });

  describe( 'waitForFormInitialization()', () => {
    it( 'should wait for the form to become available and then call addCustomValidators()', ( done ) => {
      spyOn( self.controller, 'addCustomValidators' );
      delete self.controller.detailsForm;
      self.controller.waitForFormInitialization();
      self.controller.$scope.$digest();
      expect( self.controller.addCustomValidators ).not.toHaveBeenCalled();
      self.controller.detailsForm = {
        phoneNumber: {}
      };
      self.controller.$scope.$digest();
      expect( self.controller.addCustomValidators ).toHaveBeenCalled();
      done();
    } );
  } );

  describe( 'addCustomValidators()', () => {
    it( 'should create validators', () => {
      self.controller.detailsForm.phoneNumber = {
        $validators: {}
      };
      self.controller.addCustomValidators();
      expect( self.controller.detailsForm.phoneNumber.$validators.phone( '541-967-0010' ) ).toEqual( true );
      expect( self.controller.detailsForm.phoneNumber.$validators.phone( '' ) ).toEqual( true );
      expect( self.controller.detailsForm.phoneNumber.$validators.phone( '123-456-7890' ) ).toEqual( false );
    } );
  } );

  describe('loadDonorDetails', () => {
    it('should get the donor\'s details', () => {
      spyOn(self.controller.orderService, 'getDonorDetails').and.callFake(() => Observable.of({ 'donor-type': 'Organization', 'spouse-name': {}, staff: false }));
      self.controller.loadDonorDetails();
      expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled();
      expect(self.controller.loadingDonorDetailsError).toEqual(false);
      expect(self.controller.loadingDonorDetails).toEqual(false);
      expect(self.controller.donorDetails).toEqual({ 'donor-type': 'Organization', 'spouse-name': {}, staff: false });
      expect(self.controller.nameFieldsDisabled).toEqual(false);
      expect(self.controller.spouseFieldsDisabled).toEqual(false);
    });
    it('should disable name fields if the user\'s registration state is completed', () => {
      spyOn(self.controller.orderService, 'spouseEditableForOrder').and.returnValue(false);
      let donorDetails = {
        'donor-type': 'Organization',
        'name': {
          'given-name': 'Joe',
          'family-name': 'Smith'
        },
        'spouse-name': {
          'given-name': 'Julie',
          'family-name': 'Smith'
        },
        'email': 'joe.smith@example.com',
        'registration-state': 'COMPLETED'
      };
      spyOn(self.controller.orderService, 'getDonorDetails').and.callFake(() => Observable.of(donorDetails));
      self.controller.loadDonorDetails();
      expect(self.controller.loadingDonorDetailsError).toEqual(false);
      expect(self.controller.loadingDonorDetails).toEqual(false);
      expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled();
      expect(self.controller.donorDetails).toEqual(donorDetails);
      expect(self.controller.nameFieldsDisabled).toEqual(true);
      expect(self.controller.spouseFieldsDisabled).toEqual(true);
      expect(self.controller.orderService.spouseEditableForOrder).toHaveBeenCalledWith(donorDetails);
    });
    it('should set the donor type if it is an empty string', () => {
      spyOn(self.controller.orderService, 'getDonorDetails').and.callFake(() => Observable.of({ 'donor-type': '', 'spouse-name': {} }));
      self.controller.loadDonorDetails();
      expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled();
      expect(self.controller.donorDetails).toEqual({ 'donor-type': 'Household', 'spouse-name': {} });
    });

    describe('pre-populate from session', () => {
      let $cookies;
      beforeEach(inject((_$cookies_, $rootScope) => {
        $cookies = _$cookies_;
        $cookies.put(Sessions.role, cortexRole.registered);
        $cookies.put(Sessions.profile, cruProfile);
        $rootScope.$digest();
      }));

      afterEach( () => {
        $cookies.remove( Sessions.role );
        $cookies.remove( Sessions.profile );
      } );

      it('should set given, family and name to session values', () => {
        spyOn(self.controller.orderService, 'getDonorDetails').and.callFake(() => Observable.of({
          'donor-type': 'Household',
          'name': {
            'given-name': '',
            'family-name': ''
          },
          'spouse-name': {},
          'email': undefined,
          'registration-state': 'NEW'
        }));
        self.controller.loadDonorDetails();
        expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled();
        expect(self.controller.donorDetails).toEqual({
          'donor-type': 'Household',
          'name': {
            'given-name': 'Charles',
            'family-name': 'Xavier'
          },
          'spouse-name': {},
          'email': 'professorx@xavier.edu',
          'registration-state': 'NEW'
        });
      });
    });

    it('should log an error on failure', () => {
      spyOn(self.controller.orderService, 'getDonorDetails').and.returnValue(Observable.throw('some error'));
      self.controller.loadDonorDetails();
      expect(self.controller.loadingDonorDetailsError).toEqual(true);
      expect(self.controller.loadingDonorDetails).toEqual(false);
      expect(self.controller.$log.error.logs[0]).toEqual(['Error loading donorDetails.', 'some error']);
    });
  });

  describe('submitDetails', () => {
    it('should call onSubmit binding if there are errors', () => {
      self.controller.detailsForm.$valid = false;
      spyOn(self.controller.orderService, 'updateDonorDetails');
      spyOn(self.controller.orderService, 'addEmail');
      self.controller.submitDetails();
      expect(self.controller.detailsForm.$setSubmitted).toHaveBeenCalled();
      expect(self.controller.orderService.updateDonorDetails).not.toHaveBeenCalled();
      expect(self.controller.orderService.addEmail).not.toHaveBeenCalled();
      expect(self.controller.onSubmit).toHaveBeenCalledWith({success: false});
    });
    it('should save donor details and email', () => {
      self.controller.detailsForm.$valid = true;
      self.controller.donorDetails = {
        'given-name': 'Fname',
        email: 'someone@asdf.com',
        emailFormUri: '/emails/crugive'
      };
      spyOn(self.controller.orderService, 'updateDonorDetails').and.returnValue(Observable.of('donor details success'));
      spyOn(self.controller.orderService, 'addEmail').and.returnValue(Observable.of('email success'));
      self.controller.submitDetails();
      expect(self.controller.detailsForm.$setSubmitted).toHaveBeenCalled();
      expect(self.controller.orderService.updateDonorDetails).toHaveBeenCalledWith({
        'given-name': 'Fname',
        email: 'someone@asdf.com',
        emailFormUri: '/emails/crugive'
      });
      expect(self.controller.orderService.addEmail).toHaveBeenCalledWith('someone@asdf.com', '/emails/crugive');
      expect(self.controller.onSubmit).toHaveBeenCalledWith({success: true});
    });
    it('should handle an error saving donor details', () => {
      self.controller.detailsForm.$valid = true;
      self.controller.donorDetails = {
        'given-name': 'Fname'
      };
      spyOn(self.controller.orderService, 'updateDonorDetails').and.returnValue(Observable.throw({ data: 'donor details error' }));
      self.controller.submitDetails();
      expect(self.controller.detailsForm.$setSubmitted).toHaveBeenCalled();
      expect(self.controller.orderService.updateDonorDetails).toHaveBeenCalledWith({
        'given-name': 'Fname'
      });
      expect(self.controller.$log.warn.logs[0]).toEqual(['Error saving donor contact info', { data: 'donor details error' }]);
      expect(self.controller.submissionError).toEqual('donor details error');
      expect(self.controller.onSubmit).toHaveBeenCalledWith({success: false});
    });
    it('should handle an error saving email', () => {
      self.controller.detailsForm.$valid = true;
      self.controller.donorDetails = {
        'given-name': 'Fname',
        email: 'a@a',
        emailFormUri: '/emails/crugive'
      };
      spyOn(self.controller.orderService, 'updateDonorDetails').and.returnValue(Observable.of('success'));
      spyOn(self.controller.orderService, 'addEmail').and.returnValue(Observable.throw({ data: 'Invalid email address: a@a' }));
      self.controller.submitDetails();
      expect(self.controller.detailsForm.$setSubmitted).toHaveBeenCalled();
      expect(self.controller.orderService.updateDonorDetails).toHaveBeenCalledWith({
        'given-name': 'Fname',
        email: 'a@a',
        emailFormUri: '/emails/crugive'
      });
      expect(self.controller.orderService.addEmail).toHaveBeenCalledWith('a@a', '/emails/crugive');
      expect(self.controller.$log.warn.logs[0]).toEqual(['Error saving donor contact info', { data: 'Invalid email address: a@a' }]);
      expect(self.controller.submissionError).toEqual('Invalid email address');
      expect(self.controller.onSubmit).toHaveBeenCalledWith({success: false});
    });
  });
});
