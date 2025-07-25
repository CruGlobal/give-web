import angular from 'angular';
import 'angular-mocks';
import module from './designations.service';

import searchResponse from 'common/services/api/fixtures/product-search.fixture';
import lookupResponse from 'common/services/api/fixtures/product-lookup.fixture';
import bulkLookupResponse from 'common/services/api/fixtures/product-lookup-bulk.fixture';
import campaignResponse from '../fixtures/campaign.infinity.fixture';
import designationResponse from '../fixtures/designation.infinity.fixture';

describe('designation service', () => {
  beforeEach(angular.mock.module(module.name));
  const self = {};

  beforeEach(inject((designationsService, $httpBackend, $location) => {
    self.designationsService = designationsService;
    self.$httpBackend = $httpBackend;
    self.$location = $location;
  }));

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('productSearch', () => {
    it('should send a request to API and get results', (done) => {
      self.$httpBackend
        .expectGET('https://give-stage2.cru.org/search?keyword=steve')
        .respond(200, searchResponse);
      self.designationsService
        .productSearch({
          keyword: 'steve',
        })
        .subscribe((data) => {
          expect(data).toEqual([
            expect.objectContaining({
              designationNumber: '0559826',
              replacementDesignationNumber: '0559827',
              name: 'John and Jane Doe',
              type: 'Staff',
            }),
          ]);
          done();
        }, done);
      self.$httpBackend.flush();
    });

    it('should handle undefined fields', (done) => {
      self.$httpBackend
        .expectGET('https://give-stage2.cru.org/search?keyword=steve')
        .respond(200, { hits: [{}] });
      self.designationsService
        .productSearch({
          keyword: 'steve',
        })
        .subscribe((data) => {
          expect(data).toEqual([
            expect.objectContaining({
              designationNumber: null,
              replacementDesignationNumber: null,
              name: null,
              type: null,
            }),
          ]);
          done();
        }, done);
      self.$httpBackend.flush();
    });
  });

  describe('productLookup', () => {
    const expectedResponse = {
      uri: 'carts/items/crugive/a5t4fmspmfpwpqvqli7teksyhu=/form',
      frequencies: [
        {
          name: 'QUARTERLY',
          display: 'Quarterly',
          selectAction:
            '/itemselections/crugive/a5t4fmspmfpwpqvqli7teksyhu=/options/izzgk4lvmvxgg6i=/values/kfkucusuivjeywi=/selector',
        },
        {
          name: 'SEMIANNUAL',
          display: 'Semi-Annually',
          selectAction:
            '/itemselections/crugive/a5t4fmspmfpwpqvqli7teksyhu=/options/izzgk4lvmvxgg6i=/values/kncu2skbjzhfkqkm=/selector',
        },
        {
          name: 'MON',
          display: 'Monthly',
          selectAction:
            '/itemselections/crugive/a5t4fmspmfpwpqvqli7teksyhu=/options/izzgk4lvmvxgg6i=/values/jvhu4=/selector',
        },
        {
          name: 'ANNUAL',
          display: 'Annually',
          selectAction:
            '/itemselections/crugive/a5t4fmspmfpwpqvqli7teksyhu=/options/izzgk4lvmvxgg6i=/values/ifhe4vkbjq=/selector',
        },
        { name: 'NA', display: 'Single', selectAction: '' },
      ],
      frequency: 'NA',
      displayName: 'Steve Peck',
      designationType: 'Staff',
      orgId: 'STAFF',
      code: '0354433',
      designationNumber: '0354433',
    };
    it('should get product details for a designation number', (done) => {
      self.$httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/items/crugive/lookups/form?FollowLocation=true&zoom=code,offer:code,definition,definition:options:element:selector:choice,definition:options:element:selector:choice:description,definition:options:element:selector:choice:selectaction,definition:options:element:selector:chosen,definition:options:element:selector:chosen:description',
          { code: '0354433' },
        )
        .respond(200, lookupResponse);
      self.designationsService.productLookup('0354433').subscribe((data) => {
        expect(data).toEqual(expectedResponse);
        done();
      }, done);
      self.$httpBackend.flush();
    });

    it('should get product details for a uri', (done) => {
      self.$httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/itemselections/crugive/a5t4fmspmhbkez6cwbnd6mrkla74hdgcupbl4xjb=/options/izzgk4lvmvxgg6i=/values/jzaq=/selector?FollowLocation=true&zoom=code,offer:code,definition,definition:options:element:selector:choice,definition:options:element:selector:choice:description,definition:options:element:selector:choice:selectaction,definition:options:element:selector:chosen,definition:options:element:selector:chosen:description',
        )
        .respond(200, lookupResponse);
      self.designationsService
        .productLookup(
          '/itemselections/crugive/a5t4fmspmhbkez6cwbnd6mrkla74hdgcupbl4xjb=/options/izzgk4lvmvxgg6i=/values/jzaq=/selector',
          true,
        )
        .subscribe((data) => {
          expect(data).toEqual(expectedResponse);
          done();
        }, done);
      self.$httpBackend.flush();
    });

    it('should handle an empty response', (done) => {
      self.$httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/itemselections/crugive/a5t4fmspmhbkez6cwbnd6mrkla74hdgcupbl4xjb=/options/izzgk4lvmvxgg6i=/values/jzaq=/selector?FollowLocation=true&zoom=code,offer:code,definition,definition:options:element:selector:choice,definition:options:element:selector:choice:description,definition:options:element:selector:choice:selectaction,definition:options:element:selector:chosen,definition:options:element:selector:chosen:description',
        )
        .respond(200, '');
      self.designationsService
        .productLookup(
          '/itemselections/crugive/a5t4fmspmhbkez6cwbnd6mrkla74hdgcupbl4xjb=/options/izzgk4lvmvxgg6i=/values/jzaq=/selector',
          true,
        )
        .subscribe(
          () => {
            done('success should not have been called');
          },
          (error) => {
            expect(error.message).toEqual(
              'Product lookup response contains no code data',
            );
            done();
          },
        );
      self.$httpBackend.flush();
    });
  });

  describe('bulkLookup', () => {
    it('should take an array of designation numbers and return corresponding links for items', (done) => {
      self.$httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/items/crugive/lookups/batches/form?FollowLocation=true',
          { codes: ['0123456', '1234567'] },
        )
        .respond(200, bulkLookupResponse);
      self.designationsService
        .bulkLookup(['0123456', '1234567'])
        .subscribe((data) => {
          expect(data).toEqual(bulkLookupResponse);
          done();
        }, done);
      self.$httpBackend.flush();
    });
  });

  describe('suggestedAmounts', () => {
    it('should load suggested amounts', (done) => {
      const itemConfig = { amount: 50, 'campaign-page': 9876 };
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/content/give/us/en/campaigns/0/1/2/3/4/0123456/9876.infinity.json',
        )
        .respond(200, campaignResponse);
      self.designationsService
        .suggestedAmounts('0123456', itemConfig)
        .subscribe((suggestedAmounts) => {
          expect(suggestedAmounts).toEqual([
            { amount: 25, label: 'for 10 Bibles', order: 1 },
            { amount: 100, label: 'for 40 Bibles', order: 2 },
          ]);

          expect(itemConfig['default-campaign-code']).toEqual('867EM1');
          expect(itemConfig['jcr-title']).toEqual(
            'PowerPacksTM for Inner City Children',
          );
          done();
        }, done);
      self.$httpBackend.flush();
    });

    it('should handle an invalid campaign page', (done) => {
      const itemConfig = { amount: 50, 'campaign-page': 9876 };
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/content/give/us/en/campaigns/0/1/2/3/4/0123456/9876.infinity.json',
        )
        .respond(400, {});
      self.designationsService
        .suggestedAmounts('0123456', itemConfig)
        .subscribe((suggestedAmounts) => {
          expect(suggestedAmounts).toEqual([]);
          expect(itemConfig['default-campaign-code']).toBeUndefined();
          expect(itemConfig['jcr-title']).toBeUndefined();
          done();
        }, done);
      self.$httpBackend.flush();
    });

    it('should handle no campaign page', (done) => {
      const itemConfig = { amount: 50 };
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/content/give/us/en/designations/0/1/2/3/4/0123456.infinity.json',
        )
        .respond(200, designationResponse);
      self.designationsService
        .suggestedAmounts('0123456', itemConfig)
        .subscribe((suggestedAmounts) => {
          expect(suggestedAmounts).toEqual([]);
          expect(itemConfig['default-campaign-code']).toEqual('867EM1');
          expect(itemConfig['jcr-title']).toEqual(
            'PowerPacksTM for Inner City Children',
          );
          done();
        }, done);
      self.$httpBackend.flush();
    });
  });

  describe('facebookPixel', () => {
    it('should load facebook pixel id from JCR', (done) => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/content/give/us/en/designations/0/1/2/3/4/0123456.infinity.json',
        )
        .respond(200, designationResponse);
      self.designationsService.facebookPixel('0123456').subscribe((pixelId) => {
        expect(pixelId).toEqual('123456');
        done();
      }, done);
      self.$httpBackend.flush();
    });
  });

  describe('givingLinks', () => {
    it('should load givingLinks from JCR', (done) => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/content/give/us/en/designations/0/1/2/3/4/0123456.infinity.json',
        )
        .respond(200, designationResponse);
      self.designationsService
        .givingLinks('0123456')
        .subscribe((givingLinks) => {
          expect(givingLinks).toEqual([
            { name: 'Name', url: 'https://example.com', order: 0 },
          ]);
          done();
        }, done);
      self.$httpBackend.flush();
    });

    it('should ignore givingLinks without names or urls', (done) => {
      const response = angular.copy(designationResponse);
      response['jcr:content'].givingLinks.item1 = {
        'jcr:primaryType': 'nt:unstructured',
      };
      response['jcr:content'].givingLinks.item2 = {
        'jcr:primaryType': 'nt:unstructured',
        url: 'https://example2.com',
        name: 'Name 2',
      };
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/content/give/us/en/designations/0/1/2/3/4/0123456.infinity.json',
        )
        .respond(200, response);
      self.designationsService
        .givingLinks('0123456')
        .subscribe((givingLinks) => {
          expect(givingLinks).toEqual([
            { name: 'Name', url: 'https://example.com', order: 0 },
            { name: 'Name 2', url: 'https://example2.com', order: 2 },
          ]);
          done();
        }, done);
      self.$httpBackend.flush();
    });
  });

  describe('generatePath', () => {
    it('should return the proper path for one time gift to non-campaign', () => {
      const productCode = '0123456';

      const path = self.designationsService.generatePath(productCode);
      expect(path).toEqual(
        '/content/give/us/en/designations/0/1/2/3/4/0123456.infinity.json',
      );
    });

    it('should return the proper path for one time gift to campaign', () => {
      const productCode = '0123456';
      const campaignPage = 'some-campaign';

      const path = self.designationsService.generatePath(
        productCode,
        campaignPage,
      );
      expect(path).toEqual(
        '/content/give/us/en/campaigns/0/1/2/3/4/0123456/some-campaign.infinity.json',
      );
    });

    it('should return the proper path for recurring gift to non-campaign', () => {
      const productCode = '0123456_mon';

      const path = self.designationsService.generatePath(productCode);
      expect(path).toEqual(
        '/content/give/us/en/designations/0/1/2/3/4/0123456.infinity.json',
      );
    });

    it('should return the proper path for recurring gift to campaign', () => {
      const productCode = '0123456_mon';
      const campaignPage = 'some-campaign';

      const path = self.designationsService.generatePath(
        productCode,
        campaignPage,
      );
      expect(path).toEqual(
        '/content/give/us/en/campaigns/0/1/2/3/4/0123456/some-campaign.infinity.json',
      );
    });
  });

  describe('ministriesList', () => {
    it('should return a list of ministries', (done) => {
      jest
        .spyOn(self.$location, 'protocol')
        .mockImplementationOnce(() => 'https');
      jest
        .spyOn(self.$location, 'host')
        .mockImplementationOnce(() => 'give-stage-cloud.cru.org');
      const pagePath = 'page.html';
      const ministriesResponse = {
        ministries: [
          JSON.stringify({
            name: 'Some Ministry',
            designationNumber: '0123456',
            path: '/some-vanity',
            extra: 'something-else',
          }),
        ],
      };
      self.$httpBackend
        .expectGET(
          `https://give-stage-cloud.cru.org/${pagePath}/jcr:content/content-parsys/designation_search_r.json`,
        )
        .respond(200, ministriesResponse);

      const expectedResult = [
        {
          name: 'Some Ministry',
          designationNumber: '0123456',
          facet: null,
          path: '/some-vanity',
        },
      ];
      self.designationsService
        .ministriesList(pagePath)
        .subscribe((actualResult) => {
          expect(actualResult).toEqual(expectedResult);
          done();
        }, done);
      self.$httpBackend.flush();
    });
  });
});
