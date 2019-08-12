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
      self.$httpBackend.expectGET('https://give-stage2.cru.org/search?keyword=steve').respond(200, searchResponse);
      self.designationsService.productSearch({
        keyword: 'steve'
      })
        .subscribe((data) => {
          expect(data).toEqual([expect.objectContaining({
            'designationNumber': '0559826',
            'replacementDesignationNumber': '0559827',
            'name': 'John and Jane Doe',
            'type': 'Staff'
          })]);
        });
      self.$httpBackend.flush();
    });

    it('should handle undefined fields', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/search?keyword=steve').respond(200, {hits:[{}]});
      self.designationsService.productSearch({
        keyword: 'steve'
      })
        .subscribe((data) => {
          expect(data).toEqual([expect.objectContaining({
            designationNumber: null,
            replacementDesignationNumber: null,
            name: null,
            type: null
          })]);
        });
      self.$httpBackend.flush();
    });
  });

  describe('productLookup', () => {
    const expectedResponse = {
      uri: 'items/crugive/a5t4fmspmfpwpqvqli7teksyhu=',
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
      code: '0354433',
      designationNumber: '0354433',
    };
    it('should get product details for a designation number', () => {
      self.$httpBackend.expectPOST('https://give-stage2.cru.org/cortex/lookups/crugive/items?followLocation=true&zoom=code,definition,definition:options:element:selector:choice,definition:options:element:selector:choice:description,definition:options:element:selector:choice:selectaction,definition:options:element:selector:chosen,definition:options:element:selector:chosen:description',
        {code: '0354433'})
        .respond(200, lookupResponse);
      self.designationsService.productLookup('0354433')
        .subscribe((data) => {
          expect(data).toEqual(expectedResponse);
        });
      self.$httpBackend.flush();
    });

    it('should get product details for a uri', () => {
      self.$httpBackend.expectPOST('https://give-stage2.cru.org/cortex/itemselections/crugive/a5t4fmspmhbkez6cwbnd6mrkla74hdgcupbl4xjb=/options/izzgk4lvmvxgg6i=/values/jzaq=/selector?followLocation=true&zoom=code,definition,definition:options:element:selector:choice,definition:options:element:selector:choice:description,definition:options:element:selector:choice:selectaction,definition:options:element:selector:chosen,definition:options:element:selector:chosen:description')
        .respond(200, lookupResponse);
      self.designationsService.productLookup('/itemselections/crugive/a5t4fmspmhbkez6cwbnd6mrkla74hdgcupbl4xjb=/options/izzgk4lvmvxgg6i=/values/jzaq=/selector', true)
        .subscribe(data => {
          expect(data).toEqual(expectedResponse);
        });
      self.$httpBackend.flush();
    });

    it('should handle an empty response', () => {
      self.$httpBackend.expectPOST('https://give-stage2.cru.org/cortex/itemselections/crugive/a5t4fmspmhbkez6cwbnd6mrkla74hdgcupbl4xjb=/options/izzgk4lvmvxgg6i=/values/jzaq=/selector?followLocation=true&zoom=code,definition,definition:options:element:selector:choice,definition:options:element:selector:choice:description,definition:options:element:selector:choice:selectaction,definition:options:element:selector:chosen,definition:options:element:selector:chosen:description')
        .respond(200, '');
      self.designationsService.productLookup('/itemselections/crugive/a5t4fmspmhbkez6cwbnd6mrkla74hdgcupbl4xjb=/options/izzgk4lvmvxgg6i=/values/jzaq=/selector', true)
        .subscribe(() => {
          fail('success should not have been called');
        }, error => {
          expect(error).toEqual('Product lookup response contains no code data');
        });
      self.$httpBackend.flush();
    });
  });

  describe('bulkLookup', () => {
    it('should take an array of designation numbers and return corresponding links for items', () => {
      self.$httpBackend.expectPOST('https://give-stage2.cru.org/cortex/lookups/crugive/batches/items?followLocation=true',
        { codes: ['0123456', '1234567'] })
        .respond(200, bulkLookupResponse);
      self.designationsService.bulkLookup(['0123456', '1234567'])
        .subscribe(data => {
          expect(data).toEqual(bulkLookupResponse);
        });
      self.$httpBackend.flush();
    });
  });

  describe('suggestedAmounts', () => {
    it('should load suggested amounts', () => {
      const itemConfig = {amount: 50, 'campaign-page': 9876};
      self.$httpBackend.expectGET('https://give-stage2.cru.org/content/give/us/en/campaigns/0/1/2/3/4/0123456/9876.infinity.json')
        .respond(200, campaignResponse);
      self.designationsService.suggestedAmounts('0123456', itemConfig)
        .subscribe(suggestedAmounts => {
          expect( suggestedAmounts ).toEqual( [
            {amount: 25, label: "for 10 Bibles", order: 1},
            {amount: 100, label: "for 40 Bibles", order: 2}
          ] );

          expect( itemConfig['default-campaign-code'] ).toEqual( '867EM1' );
          expect( itemConfig['jcr-title'] ).toEqual( 'PowerPacksTM for Inner City Children' );
        });
      self.$httpBackend.flush();
    });

    it('should handle an invalid campaign page', () => {
      const itemConfig = {amount: 50, 'campaign-page': 9876};
      self.$httpBackend.expectGET('https://give-stage2.cru.org/content/give/us/en/campaigns/0/1/2/3/4/0123456/9876.infinity.json')
        .respond(400, {});
      self.designationsService.suggestedAmounts('0123456', itemConfig)
        .subscribe(suggestedAmounts => {
          expect( suggestedAmounts ).toEqual( [] );
          expect( itemConfig['default-campaign-code'] ).toBeUndefined();
          expect( itemConfig['jcr-title'] ).toBeUndefined();
        });
      self.$httpBackend.flush();
    });

    it('should handle no campaign page', () => {
      const itemConfig = {amount: 50};
      self.$httpBackend.expectGET('https://give-stage2.cru.org/content/give/us/en/designations/0/1/2/3/4/0123456.infinity.json')
        .respond(200, designationResponse);
      self.designationsService.suggestedAmounts('0123456', itemConfig)
        .subscribe(suggestedAmounts => {
          expect( suggestedAmounts ).toEqual( [] );
          expect( itemConfig['default-campaign-code'] ).toEqual( '867EM1' );
          expect( itemConfig['jcr-title'] ).toEqual( 'PowerPacksTM for Inner City Children' );
        });
      self.$httpBackend.flush();
    });
  });

  describe('facebookPixel', () => {
    it('should load facebook pixel id from JCR', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/content/give/us/en/designations/0/1/2/3/4/0123456.infinity.json')
        .respond(200, designationResponse);
      self.designationsService.facebookPixel('0123456')
        .subscribe(pixelId => {
          expect(pixelId).toEqual('123456');
        });
      self.$httpBackend.flush();
    });
  });
});
