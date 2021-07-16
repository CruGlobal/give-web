import angular from 'angular'
import 'angular-mocks'

import module from './radioStations.service'

describe('radio station service', () => {
  beforeEach(angular.mock.module(module.name))
  var self = {}

  beforeEach(inject((_radioStationService_, _$httpBackend_) => {
    self.radioStationService = _radioStationService_
    self.$httpBackend = _$httpBackend_
  }))

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation()
    self.$httpBackend.verifyNoOutstandingRequest()
  })

  describe('getRadioStations', () => {
    it('returns list of radio stations', () => {
      const expectedRadioStations = [{ Description: 'Radio Station', MediaId: 'WXYZ' }, { Description: 'Other Station', MediaId: 'ZYXW' }]
  
      self.$httpBackend.expectGET('https://api.domain.com/getStations/333333/100')
        .respond(200, expectedRadioStations)
      self.radioStationsService.getRadioStations('https://api.domain.com/getStations', '33333', '100')
        .subscribe((data) => {
          expect(data).toEqual(expectedRadioStations)
        })
      self.$httpBackend.flush()
    })
  })
})
