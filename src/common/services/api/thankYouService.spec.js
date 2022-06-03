import angular from 'angular'
import 'angular-mocks'
import module from './thankYou.service'
import thankYouResponse from './fixtures/thank-you.fixture'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

describe('thank you service', () => {
  beforeEach(angular.mock.module(module.name))
  const self = {}

  beforeEach(inject((thankYouService, $httpBackend) => {
    self.$httpBackend = $httpBackend

    self.thankYouService = thankYouService
    self.$httpBackend.expectGET(`https://give-stage2.cru.org${self.thankYouService.jsonDataPath}`)
      .respond(200, thankYouResponse)
    self.$httpBackend.flush()

    self.thankYouService.thankYouData = Observable.of(thankYouResponse)
  }))

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation()
    self.$httpBackend.verifyNoOutstandingRequest()
  })

  describe('getDefaultThankYouImage', () => {
    it('should get the default thank you page image', () => {
      self.thankYouService.getDefaultThankYouImage()
        .subscribe((defaultImage) => {
          expect(defaultImage).toEqual(thankYouResponse.defaultImage)
        })
    })
  })

  describe('getThankYouData', () => {
    it('should get the thank you data', () => {
      self.thankYouService.$location = {
        $$path: '/thank-you.html'
      }
      self.$httpBackend.expectGET(`https://give-stage2.cru.org${self.thankYouService.jsonDataPath}`)
        .respond(200, thankYouResponse)
      self.thankYouService.getThankYouData()
        .subscribe((thankYouData) => {
          expect(thankYouData).toEqual(thankYouResponse)
        })
      self.$httpBackend.flush()
    })
  })

  describe('shouldShowThankYouImage', () => {
    it('should return the showThankYouImage flag', () => {
      self.thankYouService.shouldShowThankYouImage()
        .subscribe((data) => {
          expect(data).toEqual(thankYouResponse.showThankYouImage)
        })
    })
  })
})
