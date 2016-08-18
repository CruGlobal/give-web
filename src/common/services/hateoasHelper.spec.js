import angular from 'angular';
import 'angular-mocks';
import module from './hateoasHelper.service';

import cartResponse from 'common/services/api/fixtures/cortex-cart-paymentmethodinfo-forms.fixture.js';

describe('HATEOAS helper service', function() {
  beforeEach(angular.mock.module(module.name));
  let self = {};

  beforeEach(inject(function(hateoasHelperService) {
    self.hateoasHelperService = hateoasHelperService;

    self.zoom = {
      bankaccountform: 'order:paymentmethodinfo:bankaccountform',
      creditcardform: 'order:paymentmethodinfo:creditcardform'
    };

  }));

  describe('getLink', () => {
    it('should find the uri for a relationship', () => {
      expect(self.hateoasHelperService.getLink(cartResponse, 'order')).toEqual('/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=');
    });
    it('should return undefined for an unknown relationship', () => {
      expect(self.hateoasHelperService.getLink(cartResponse, 'nonexistent')).toBeUndefined();
    });
  });

  describe('getElement', () => {
    it('should get the object specified by a path array', () => {
      expect(self.hateoasHelperService.getElement(cartResponse, ['order', 'paymentmethodinfo', 'bankaccountform'])).toEqual(cartResponse._order[0]._paymentmethodinfo[0]._bankaccountform[0]);
    });
    it('should get the object specified by a path string', () => {
      expect(self.hateoasHelperService.getElement(cartResponse, 'order')).toEqual(cartResponse._order[0]);
    });
    it('should get the array specified by a path string', () => {
      cartResponse._order.push('item 2');
      expect(self.hateoasHelperService.getElement(cartResponse, 'order')).toEqual([cartResponse._order[0], 'item 2']);
    });
    it('should return undefined for an unknown element', () => {
      expect(self.hateoasHelperService.getElement(cartResponse, ['order', 'nonexistent'])).toBeUndefined();
    });
  });

  describe('serializeZoom', () => {
    it('should join all zoom strings with a comma', () => {
      expect(self.hateoasHelperService.serializeZoom(self.zoom)).toEqual('order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform');
    });
  });

  describe('mapZoomElements', () => {
    it('should use the zoom keys as keys and find the corresponding objects', () => {
      expect(self.hateoasHelperService.mapZoomElements(cartResponse, self.zoom)).toEqual({
        bankaccountform: cartResponse._order[0]._paymentmethodinfo[0]._bankaccountform[0],
        creditcardform: cartResponse._order[0]._paymentmethodinfo[0]._creditcardform[0],
        rawData: cartResponse
      });
    });
  });
});
