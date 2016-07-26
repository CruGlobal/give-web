import angular from 'angular';
import 'angular-mocks';
import module from './hateoasHelper.service';

describe('HATEOAS helper service', function() {
  beforeEach(angular.mock.module(module.name));
  let self = {};

  beforeEach(inject(function(hateoasHelperService) {
    self.hateoasHelperService = hateoasHelperService;

    self.cartResponse = {
      "self": {
        "type": "elasticpath.carts.cart",
        "uri": "/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=?zoom=order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform",
        "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=?zoom=order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform"
      },
      "links": [
        {
          "rel": "lineitems",
          "rev": "cart",
          "type": "elasticpath.collections.links",
          "uri": "/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=/lineitems",
          "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=/lineitems"
        },
        {
          "rel": "discount",
          "type": "elasticpath.discounts.discount",
          "uri": "/discounts/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=",
          "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/discounts/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga="
        },
        {
          "rel": "order",
          "rev": "cart",
          "type": "elasticpath.orders.order",
          "uri": "/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=",
          "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq="
        },
        {
          "rel": "appliedpromotions",
          "type": "elasticpath.collections.links",
          "uri": "/promotions/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=/applied",
          "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/promotions/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=/applied"
        },
        {
          "rel": "ratetotals",
          "type": "elasticpath.ratetotals.rate-total",
          "uri": "/ratetotals/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=",
          "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/ratetotals/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga="
        },
        {
          "rel": "total",
          "rev": "cart",
          "type": "elasticpath.totals.total",
          "uri": "/totals/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=",
          "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/totals/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga="
        }
      ],
      "_order": [
        {
          "_paymentmethodinfo": [
            {
              "_bankaccountform": [
                {
                  "self": {
                    "type": "training.bankaccounts.bank-account",
                    "uri": "/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=/form",
                    "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=/form"
                  },
                  "links": [
                    {
                      "rel": "createbankaccountfororderaction",
                      "uri": "/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=",
                      "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq="
                    }
                  ],
                  "account-type": "",
                  "bank-name": "",
                  "display-account-number": "",
                  "encrypted-account-number": "",
                  "routing-number": ""
                }
              ],
              "_creditcardform": [
                {
                  "self": {
                    "type": "cru.creditcards.named-credit-card",
                    "uri": "/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=/form",
                    "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=/form"
                  },
                  "links": [
                    {
                      "rel": "createcreditcardfororderaction",
                      "uri": "/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=",
                      "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq="
                    }
                  ],
                  "card-number": "",
                  "card-type": "",
                  "cardholder-name": "",
                  "expiry-month": "",
                  "expiry-year": "",
                  "issue-number": 0,
                  "start-month": "",
                  "start-year": ""
                }
              ]
            }
          ]
        }
      ],
      "total-quantity": 0
    };

    self.zoom = {
      bankaccountform: 'order:paymentmethodinfo:bankaccountform',
      creditcardform: 'order:paymentmethodinfo:creditcardform'
    };

  }));

  it('to be defined', () => {
    expect(self.hateoasHelperService).toBeDefined();
  });

  describe('getLink', () => {
    it('should find the uri for a relationship', () => {
      expect(self.hateoasHelperService.getLink(self.cartResponse, 'order')).toEqual('/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=');
    });
    it('should return undefined for an unknown relationship', () => {
      expect(self.hateoasHelperService.getLink(self.cartResponse, 'nonexistent')).toBeUndefined();
    });
  });

  describe('getElement', () => {
    it('should get the object specified by a path array', () => {
      expect(self.hateoasHelperService.getElement(self.cartResponse, ['order', 'paymentmethodinfo', 'bankaccountform'])).toEqual(self.cartResponse._order[0]._paymentmethodinfo[0]._bankaccountform[0]);
    });
    it('should get the object specified by a path string', () => {
      expect(self.hateoasHelperService.getElement(self.cartResponse, 'order')).toEqual(self.cartResponse._order[0]);
    });
    it('should return undefined for an unknown element', () => {
      expect(self.hateoasHelperService.getElement(self.cartResponse, ['order', 'nonexistent'])).toBeUndefined();
    });
  });

  describe('serializeZoom', () => {
    it('should join all zoom strings with a comma', () => {
      expect(self.hateoasHelperService.serializeZoom(self.zoom)).toEqual('order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform');
    });
  });

  describe('mapZoomElements', () => {
    it('should use the zoom keys as keys and find the corresponding objects', () => {
      expect(self.hateoasHelperService.mapZoomElements(self.cartResponse, self.zoom)).toEqual({
        bankaccountform: self.cartResponse._order[0]._paymentmethodinfo[0]._bankaccountform[0],
        creditcardform: self.cartResponse._order[0]._paymentmethodinfo[0]._creditcardform[0],
        rawData: self.cartResponse
      });
    });
  });
});
