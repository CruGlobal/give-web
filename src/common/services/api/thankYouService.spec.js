import angular from 'angular'
import 'angular-mocks'
import module from './thankYou.service'
import thankYouResponse from './fixtures/thank-you.fixture'

describe('thank you service', () => {
  beforeEach(angular.mock.module(module.name))
  const self = {}

  beforeEach(inject((thankYouService, $httpBackend) => {
    self.thankYouService = thankYouService
    self.$httpBackend = $httpBackend
  }))

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation()
    self.$httpBackend.verifyNoOutstandingRequest()
  })

  describe('getDefaultThankYouImage', () => {
    it('should get the default thank you page image', () => {
      self.thankYouService.$location = {
        $$path: '/thank-you.html'
      }
      self.$httpBackend.expectGET(`https://give-stage2.cru.org${self.thankYouService.jsonDataPath}`)
        .respond(200, thankYouResponse)
      self.thankYouService.getDefaultThankYouImage()
        .subscribe((defaultImage) => {
          expect(defaultImage).toEqual(thankYouResponse.defaultImage)
        })
      self.$httpBackend.flush()
    })
  })
})
