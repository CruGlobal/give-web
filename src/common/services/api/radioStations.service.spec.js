import angular from 'angular';
import 'angular-mocks';

import module from './radioStations.service';

describe('radio station service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject((radioStationsService, $httpBackend) => {
    self.radioStationsService = radioStationsService;
    self.$httpBackend = $httpBackend;
  }));

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getRadioStations', () => {
    it('returns a list of radio stations', (done) => {
      const expectedRadioStations = {
        WXYZ: 'Radio Station',
        ZYXW: 'Other Station',
      };

      self.$httpBackend
        .expectGET('https://api.domain.com/getStations/33333')
        .respond(200, expectedRadioStations);
      self.radioStationsService
        .getRadioStations('https://api.domain.com/getStations', '33333')
        .subscribe((data) => {
          expect(data).toEqual(expectedRadioStations);
          done();
        });
      self.$httpBackend.flush();
    });
  });
});
