import angular from 'angular';
import 'angular-mocks';

import module from './purchases.service';

import purchaseResponse from 'common/services/api/fixtures/cortex-purchase.fixture.js';

describe('purchases service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject((purchasesService, $httpBackend) => {
    self.purchasesService = purchasesService;
    self.$httpBackend = $httpBackend;
  }));

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  let purchaseResponseZoomMapped = {
    donorDetails: purchaseResponse._donordetails[0],
    paymentMeans: purchaseResponse._paymentmeans[0]._element[0],
    lineItems: purchaseResponse._lineitems[0]._element,
    rawData: purchaseResponse
  };

  describe('getPurchase', () => {
    it('should load the purchase specified by the uri', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=?zoom=donordetails,paymentmeans:element,lineitems:element')
        .respond(200, purchaseResponse);
      self.purchasesService.getPurchase('/purchases/crugive/giydanbt=')
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponseZoomMapped);
        });
      self.$httpBackend.flush();
    });
  });
});
