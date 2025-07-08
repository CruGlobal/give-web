import angular from 'angular';
import 'angular-mocks';
import find from 'lodash/find';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import countriesResponse from 'common/services/api/fixtures/cortex-countries.fixture.js';

import module from './addressForm.component';

describe('addressForm', function () {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function ($componentController) {
    self.controller = $componentController(
      module.name,
      {},
      {
        detailsForm: {
          $valid: false,
          $setSubmitted: jest.fn(),
        },
        onSubmit: jest.fn(),
        onAddressChanged: jest.fn(),
      },
    );
  }));

  describe('$onInit', () => {
    it('load the necessary data', () => {
      jest.spyOn(self.controller, 'loadCountries').mockImplementation(() => {});
      self.controller.$onInit();

      expect(self.controller.loadCountries).toHaveBeenCalled();
    });
  });

  describe('loadCountries', () => {
    beforeEach(() => {
      jest
        .spyOn(self.controller.geographiesService, 'getCountries')
        .mockImplementation(() => Observable.of(['country1', 'country2']));
      jest
        .spyOn(self.controller, 'refreshRegions')
        .mockImplementation(() => {});
    });

    it('should get the list of countries', () => {
      self.controller.loadCountries();

      expect(self.controller.countries).toEqual(['country1', 'country2']);
      expect(self.controller.refreshRegions).not.toHaveBeenCalled();
      expect(self.controller.loadingCountriesError).toEqual(false);
    });

    it('should also call refreshRegions if a country is defined', () => {
      self.controller.address = {
        country: 'US',
      };
      self.controller.loadCountries();

      expect(self.controller.countries).toEqual(['country1', 'country2']);
      expect(self.controller.refreshRegions).toHaveBeenCalled();
      expect(self.controller.loadingCountriesError).toEqual(false);
    });

    it('should log an error on failure', () => {
      self.controller.geographiesService.getCountries.mockReturnValue(
        Observable.throw('some error'),
      );
      self.controller.loadCountries();

      expect(self.controller.refreshRegions).not.toHaveBeenCalled();
      expect(self.controller.$log.error.logs[0]).toEqual([
        'Error loading countries.',
        'some error',
      ]);
      expect(self.controller.loadingCountriesError).toEqual(true);
    });
  });

  describe('refreshRegions', () => {
    it('should get the list of regions of a given country', () => {
      self.controller.countries = countriesResponse._element;
      jest
        .spyOn(self.controller.geographiesService, 'getRegions')
        .mockImplementation(() => Observable.of(['region1', 'region2']));
      self.controller.refreshRegions('US', true);

      expect(self.controller.loadingRegionsError).toEqual(false);
      expect(
        self.controller.geographiesService.getRegions,
      ).toHaveBeenCalledWith(find(countriesResponse._element, { name: 'US' }));
      expect(self.controller.regions).toEqual(['region1', 'region2']);
    });

    it("should do nothing if the country doesn't exist in the loaded list of countries", () => {
      self.controller.countries = countriesResponse._element;
      jest
        .spyOn(self.controller.geographiesService, 'getRegions')
        .mockImplementation(() => {});
      self.controller.refreshRegions('USA', false);

      expect(self.controller.loadingRegionsError).toEqual(false);
      expect(
        self.controller.geographiesService.getRegions,
      ).not.toHaveBeenCalled();
      expect(self.controller.regions).toBeUndefined();
    });

    it('should clear streetAddress and extendedAddress when switching country', () => {
      self.controller.countries = countriesResponse._element;
      self.controller.address = {
        country: 'VU',
        streetAddress: '123 W East St.',
        extendedAddress: 'Apt #123',
      };
      jest
        .spyOn(self.controller.geographiesService, 'getRegions')
        .mockImplementation(() => Observable.of(['region1', 'region2']));
      self.controller.refreshRegions('US');

      expect(self.controller.loadingRegionsError).toEqual(false);
      expect(
        self.controller.geographiesService.getRegions,
      ).toHaveBeenCalledWith(find(countriesResponse._element, { name: 'US' }));
      expect(self.controller.regions).toEqual(['region1', 'region2']);
      expect(self.controller.address.streetAddress).toEqual('');
      expect(self.controller.address.extendedAddress).toEqual('');
    });

    it('should log an error on failure', () => {
      self.controller.countries = countriesResponse._element;
      jest
        .spyOn(self.controller.geographiesService, 'getRegions')
        .mockReturnValue(Observable.throw('some error'));
      self.controller.refreshRegions('US', true);

      expect(self.controller.$log.error.logs[0]).toEqual([
        'Error loading regions.',
        'some error',
      ]);
      expect(self.controller.loadingRegionsError).toEqual(true);
    });
  });

  describe('onPostalCodeChanged', () => {
    it('should trigger onAddressChanged callback', () => {
      self.controller.countries = countriesResponse._element;
      jest.spyOn(self.controller, 'onAddressChanged');
      self.controller.onPostalCodeChanged();

      expect(self.controller.onAddressChanged).toHaveBeenCalledWith();
    });
  });
});
