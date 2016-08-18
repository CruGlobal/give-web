import angular from 'angular';
import 'angular-mocks';
import module from './geographies.service';
import find from 'lodash/find';

import countriesResponse from 'common/services/api/fixtures/cortex-countries.fixture.js';
import regionsResponse from 'common/services/api/fixtures/cortex-regions-us.fixture.js';

describe('geographies service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject((geographiesService, $httpBackend) => {
    self.geographiesService = geographiesService;
    self.$httpBackend = $httpBackend;
  }));

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getCountries', () => {
    it('should send a request to get the list of countries', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/geographies/crugive/countries?zoom=element').respond(200, countriesResponse);
      self.geographiesService.getCountries()
        .subscribe((data) => {
          expect(data).toEqual(countriesResponse._element);
        });
      self.$httpBackend.flush();
    });
  });

  describe('getRegions', () => {
    it('should send a request to get the list of regions for a country', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/geographies/crugive/countries/kvjq=/regions?zoom=element').respond(200, regionsResponse);
      let us = find(countriesResponse._element, { name: 'US' });
      self.geographiesService.getRegions(us)
        .subscribe((data) => {
          expect(data).toEqual(regionsResponse._element);
        });
      self.$httpBackend.flush();
    });
  });
});
