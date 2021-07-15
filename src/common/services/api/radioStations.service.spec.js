import angular from 'angular'
import 'angular-mocks'
import module from './radioStations.service'

describe('radio station service', () => {
  beforeEach(angular.mock.module(module.name))
  var self = {}

  beforeEach(inject(function (radioStationService, $httpBackend) {
    self.radioStationService = radioStationService
    self.$httpBackend = $httpBackend
  }))

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation()
    self.$httpBackend.verifyNoOutstandingRequest()
  })

  it('getRadioStations', () => {
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
