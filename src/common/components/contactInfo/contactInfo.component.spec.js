import angular from 'angular';
import 'angular-mocks';
import find from 'lodash/find';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import countriesResponse from 'common/services/api/fixtures/cortex-countries.fixture.js';

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
      spyOn(self.controller, 'loadCountries');
      spyOn(self.controller, 'loadDonorDetails');
      self.controller.$onInit();
      expect(self.controller.loadCountries).toHaveBeenCalled();
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

  describe('loadDonorDetails', () => {
    it('should get the donor\'s details', () => {
      spyOn(self.controller.orderService, 'getDonorDetails').and.callFake(() => Observable.of({ 'donor-type': 'Organization' }));
      self.controller.loadDonorDetails();
      expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled();
      expect(self.controller.donorDetails).toEqual({ 'donor-type': 'Organization' });
    });
    it('should set the donor type if it is an empty string', () => {
      spyOn(self.controller.orderService, 'getDonorDetails').and.callFake(() => Observable.of({ 'donor-type': '' }));
      self.controller.loadDonorDetails();
      expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled();
      expect(self.controller.donorDetails).toEqual({ 'donor-type': 'Household' });
    });
  });

  describe('loadCountries', () => {
    it('should get the list of countries', () => {
      spyOn(self.controller.geographiesService, 'getCountries').and.callFake(() => Observable.of(['country1', 'country2']));
      spyOn(self.controller, 'refreshRegions');
      self.controller.loadCountries();
      expect(self.controller.countries).toEqual(['country1', 'country2']);
      expect(self.controller.refreshRegions).toHaveBeenCalled();
    });
  });

  describe('refreshRegions', () => {
    it('should get the list of regions of a given country', () => {
      self.controller.countries = countriesResponse._element;
      spyOn(self.controller.geographiesService, 'getRegions').and.callFake(() => Observable.of(['region1', 'region2']));
      self.controller.refreshRegions('US');
      expect(self.controller.geographiesService.getRegions).toHaveBeenCalledWith(find(countriesResponse._element, { name: 'US' }));
      expect(self.controller.regions).toEqual(['region1', 'region2']);
    });
    it('should do nothing if the country doesn\'t exist in the loaded list of countries', () => {
      self.controller.countries = countriesResponse._element;
      spyOn(self.controller.geographiesService, 'getRegions');
      self.controller.refreshRegions('USA');
      expect(self.controller.geographiesService.getRegions).not.toHaveBeenCalled();
      expect(self.controller.regions).toBeUndefined();
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
        email: 'someone@asdf.com'
      };
      spyOn(self.controller.orderService, 'updateDonorDetails').and.returnValue(Observable.of('donor details success'));
      spyOn(self.controller.orderService, 'addEmail').and.returnValue(Observable.of('email success'));
      self.controller.submitDetails();
      expect(self.controller.detailsForm.$setSubmitted).toHaveBeenCalled();
      expect(self.controller.orderService.updateDonorDetails).toHaveBeenCalledWith({
        'given-name': 'Fname',
        email: 'someone@asdf.com'
      });
      expect(self.controller.orderService.addEmail).toHaveBeenCalledWith('someone@asdf.com');
      expect(self.controller.onSubmit).toHaveBeenCalledWith({success: true});
    });
    it('should handle an error saving donor details or email', () => {
      self.controller.detailsForm.$valid = true;
      self.controller.donorDetails = {
        'given-name': 'Fname',
        email: 'someone@asdf.com'
      };
      spyOn(self.controller.orderService, 'updateDonorDetails').and.returnValue(Observable.throw({ data: 'donor details error' }));
      spyOn(self.controller.orderService, 'addEmail').and.returnValue(Observable.throw({ data: 'email error' }));
      self.controller.submitDetails();
      expect(self.controller.detailsForm.$setSubmitted).toHaveBeenCalled();
      expect(self.controller.orderService.updateDonorDetails).toHaveBeenCalledWith({
        'given-name': 'Fname',
        email: 'someone@asdf.com'
      });
      expect(self.controller.orderService.addEmail).toHaveBeenCalledWith('someone@asdf.com');
      expect(self.controller.$log.warn.logs[0]).toEqual(['Error saving donor contact info', { data: 'donor details error' }]);
      expect(self.controller.submissionError).toEqual('donor details error');
      expect(self.controller.onSubmit).toHaveBeenCalledWith({success: false});
    });
  });
});
