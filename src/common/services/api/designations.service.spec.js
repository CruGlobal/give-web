import angular from 'angular';
import 'angular-mocks';
import module from './designations.service';

import searchResponse from 'common/services/api/fixtures/product-search.fixture';

describe('designation service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject((designationsService, $httpBackend) => {
    self.designationsService = designationsService;
    self.$httpBackend = $httpBackend;
  }));

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('productSearch', () => {
    it('should send a request to API and get results', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/search?keyword=steve').respond(200, searchResponse);
      self.designationsService.productSearch({
        keyword: 'steve'
      })
        .subscribe((data) => {
          expect(data.length).toEqual(searchResponse.response.docs.length);
          expect(data[0].designationNumber).toEqual(searchResponse.response.docs[0]['productCode']);
          expect(data[0].name).toEqual(searchResponse.response.docs[0]['productName|en_US|']);
        });
      self.$httpBackend.flush();
    });
  });
});
