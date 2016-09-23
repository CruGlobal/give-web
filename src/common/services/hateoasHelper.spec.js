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
      expect(self.hateoasHelperService.getElement(cartResponse, 'order', true)).toEqual([cartResponse._order[0], 'item 2']);
    });
    it('should try the path without a prefixed underscore if it couldn\'t find the path with an underscore', () => {
      expect(self.hateoasHelperService.getElement({ test: ['some value'] }, 'test')).toEqual('some value');
    });
    it('should return undefined for an unknown element', () => {
      expect(self.hateoasHelperService.getElement(cartResponse, ['order', 'nonexistent'])).toBeUndefined();
    });
  });

  describe('serializeZoom', () => {
    it('should join all zoom strings with a comma', () => {
      expect(self.hateoasHelperService.serializeZoom(self.zoom)).toEqual('order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform');
    });
    it('should join all zoom strings with a comma and remove array indicators', () => {
      self.zoom.bankaccountform += '[]';
      self.zoom.creditcardform += '[]';
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
    it('should map nested objects', () => {
      let response = {
        _order: [
          {
            _items: [
              {
                name: 'toy car',
                _instock: [
                  {
                    count: 10
                  }
                ]
              },
              {
                name: 'toy airplane',
                _instock: [
                  {
                    count: 20
                  }
                ]
              }
            ]
          }
        ]
      };
      let zoom = {
        items: 'order:items[],order:items:instock'
      };
      expect(self.hateoasHelperService.mapZoomElements(response, zoom)).toEqual({
        items: [
          {
            name: 'toy car',
            instock: {
              count: 10
            }
          },
          {
            name: 'toy airplane',
            instock: {
              count: 20
            }
          }
        ],
        rawData: response
      });
    });
    it('should return undefined if the zoom isn\'t found', () => {
      self.zoom.creditcardform += '[]';
      expect(self.hateoasHelperService.mapZoomElements({}, self.zoom)).toEqual({
        bankaccountform: undefined,
        creditcardform: undefined,
        rawData: {}
      });
    });
  });

  describe('mapChildZoomElements', () => {
    beforeEach(() => {
      this.element = {
        _code: [
          {
            someKey: 'someValue'
          }
        ],
        _rates: [
          {
            someKey: 'someValue'
          }
        ],
        paymentmeans: [
          {
            _creditcard: [
              {
                someKey: 'someValue'
              }
            ]
          }
        ]
      };
      this.zoomString = 'lineitems:element';
      this.childZoomStrings = ['lineitems:element:code', 'lineitems:element:rates[]', 'lineitems:element:paymentmeans:creditcard'];
    });

    it('should take an element and map the child zoom strings to keys', () => {
      expect(self.hateoasHelperService.mapChildZoomElements(this.element, this.zoomString, this.childZoomStrings)).toEqual({
        code: {
          someKey: 'someValue'
        },
        rates: [
          {
            someKey: 'someValue'
          }
        ],
        paymentmeansCreditcard: {
          someKey: 'someValue'
        }
      });
    });
    it('should return undefined if the zoom isn\'t found', () => {
      this.childZoomStrings = ['lineitems:element:code2', 'lineitems:element:rates2[]'];
      expect(self.hateoasHelperService.mapChildZoomElements(this.element, this.zoomString, this.childZoomStrings)).toEqual({
        _code: [
          {
            someKey: 'someValue'
          }
        ],
        _rates: [
          {
            someKey: 'someValue'
          }
        ],
        paymentmeans: [
          {
            _creditcard: [
              {
                someKey: 'someValue'
              }
            ]
          }
        ],
        code2: undefined,
        rates2: undefined
      });
    });
  });

  describe('stripArrayIndicators', () => {
    it('should leave the string untouched if there are no square brackets', () => {
      expect(self.hateoasHelperService.stripArrayIndicators('sadf:jhksad:qwer!@#$%^&*()_+')).toEqual('sadf:jhksad:qwer!@#$%^&*()_+');
    });
    it('should remove square brackets from the string', () => {
      expect(self.hateoasHelperService.stripArrayIndicators('sadf:jhksad:qwer[]')).toEqual('sadf:jhksad:qwer');
      expect(self.hateoasHelperService.stripArrayIndicators(']sa[df:jhk]sad:qwer[]')).toEqual('sadf:jhksad:qwer');
    });
  });
});
