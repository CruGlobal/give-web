import angular from 'angular';
import 'angular-mocks';
import module from './geographies.service';
import find from 'lodash/find';
import map from 'lodash/map';

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
    it('should send a request to get the list of countries and sort them alphabetically', (done) => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/geographies/crugive/countries?zoom=element',
        )
        .respond(200, countriesResponse);
      self.geographiesService.getCountries().subscribe((data) => {
        expect(map(data, 'display-name')).toEqual([
          'Australia',
          'Austria',
          'Belgium',
          'Canada',
          'China',
          'Czech Republic',
          'Denmark',
          'Finland',
          'France',
          'Germany',
          'Great Britain (UK)',
          'Greece',
          'Hong Kong',
          'Hungary',
          'Iceland',
          'India',
          'Indonesia',
          'Ireland',
          'Israel',
          'Italy',
          'Japan',
          'Korea (South)',
          'Netherlands',
          'New Zealand',
          'Norway',
          'Pakistan',
          'Poland',
          'Portugal',
          'Romania',
          'Russian Federation',
          'Singapore',
          'South Africa',
          'Spain',
          'Sweden',
          'Switzerland',
          'Taiwan',
          'Ukraine',
          'United States',
          'Uzbekistan',
        ]);
        done();
      }, done);
      self.$httpBackend.flush();
    });
  });

  describe('getRegions', () => {
    it('should send a request to get the list of regions for a country and sort them alphabetically', (done) => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/geographies/crugive/countries/kvjq=/regions?zoom=element',
        )
        .respond(200, regionsResponse);
      const us = find(countriesResponse._element, { name: 'US' });
      self.geographiesService.getRegions(us).subscribe((data) => {
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              'display-name': 'California',
              name: 'CA',
            }),
            expect.objectContaining({ 'display-name': 'Florida', name: 'FL' }),
          ]),
        );

        expect(map(data, 'display-name')).toEqual([
          'Alabama',
          'Alaska',
          'Arizona',
          'Arkansas',
          'Armed Forces Americas (AA)',
          'Armed Forces Europe (AE)',
          'Armed Forces Pacific (AP)',
          'California',
          'Colorado',
          'Connecticut',
          'Delaware',
          'District Of Columbia',
          'Florida',
          'Georgia',
          'Hawaii',
          'Idaho',
          'Illinois',
          'Indiana',
          'Iowa',
          'Kansas',
          'Kentucky',
          'Louisiana',
          'Maine',
          'Maryland',
          'Massachusetts',
          'Michigan',
          'Minnesota',
          'Mississippi',
          'Missouri',
          'Montana',
          'Nebraska',
          'Nevada',
          'New Hampshire',
          'New Jersey',
          'New Mexico',
          'New York',
          'North Carolina',
          'North Dakota',
          'Ohio',
          'Oklahoma',
          'Oregon',
          'Pennsylvania',
          'Rhode Island',
          'South Carolina',
          'South Dakota',
          'Tennessee',
          'Texas',
          'Utah',
          'Vermont',
          'Virginia',
          'Washington',
          'West Virginia',
          'Wisconsin',
          'Wyoming',
        ]);

        done();
      }, done);
      self.$httpBackend.flush();
    });

    it('should rename the armed services regions to a better display name', () => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/geographies/crugive/countries/kvjq=/regions?zoom=element',
        )
        .respond(200, regionsResponse);
      const us = find(countriesResponse._element, { name: 'US' });
      self.geographiesService.getRegions(us).subscribe((data) => {
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              'display-name': 'Armed Forces Americas (AA)',
              name: 'AA',
            }),
            expect.objectContaining({
              'display-name': 'Armed Forces Europe (AE)',
              name: 'AE',
            }),
            expect.objectContaining({
              'display-name': 'Armed Forces Pacific (AP)',
              name: 'AP',
            }),
          ]),
        );
      });
      self.$httpBackend.flush();
    });

    it('should not rename any non US regions', () => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/geographies/crugive/countries/inaq=/regions?zoom=element',
        )
        .respond(200, {
          _element: [{ 'display-name': 'Do not rename', name: 'AA' }],
        });
      const ca = find(countriesResponse._element, { name: 'CA' });
      self.geographiesService.getRegions(ca).subscribe((data) => {
        expect(data).toEqual([{ 'display-name': 'Do not rename', name: 'AA' }]);
      });
      self.$httpBackend.flush();
    });
  });
});
