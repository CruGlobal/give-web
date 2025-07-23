export default {
  self: {
    type: 'elasticpath.carts.cart',
    uri: '/carts/crugive/my2gmmlfhaygkllbmu4deljumq3diljzgfsdellcge3wizbyhazwemtggm=?zoom=order:paymentinstrumentselector:chosen:description',
    href: 'https://give-stage2.cru.org/cortex/carts/crugive/my2gmmlfhaygkllbmu4deljumq3diljzgfsdellcge3wizbyhazwemtggm=?zoom=order:paymentinstrumentselector:chosen:description',
  },
  links: [
    {
      rel: 'lineitems',
      rev: 'cart',
      type: 'elasticpath.collections.links',
      uri: '/carts/crugive/my2gmmlfhaygkllbmu4deljumq3diljzgfsdellcge3wizbyhazwemtggm=/lineitems',
      href: 'https://give-stage2.cru.org/cortex/carts/crugive/my2gmmlfhaygkllbmu4deljumq3diljzgfsdellcge3wizbyhazwemtggm=/lineitems',
    },
    {
      rel: 'discount',
      type: 'elasticpath.discounts.discount',
      uri: '/discounts/carts/crugive/my2gmmlfhaygkllbmu4deljumq3diljzgfsdellcge3wizbyhazwemtggm=',
      href: 'https://give-stage2.cru.org/cortex/discounts/carts/crugive/my2gmmlfhaygkllbmu4deljumq3diljzgfsdellcge3wizbyhazwemtggm=',
    },
    {
      rel: 'order',
      rev: 'cart',
      type: 'elasticpath.orders.order',
      uri: '/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq=',
      href: 'https://give-stage2.cru.org/cortex/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq=',
    },
    {
      rel: 'appliedpromotions',
      type: 'elasticpath.collections.links',
      uri: '/promotions/carts/crugive/my2gmmlfhaygkllbmu4deljumq3diljzgfsdellcge3wizbyhazwemtggm=/applied',
      href: 'https://give-stage2.cru.org/cortex/promotions/carts/crugive/my2gmmlfhaygkllbmu4deljumq3diljzgfsdellcge3wizbyhazwemtggm=/applied',
    },
    {
      rel: 'ratetotals',
      type: 'elasticpath.ratetotals.rate-total',
      uri: '/ratetotals/carts/crugive/my2gmmlfhaygkllbmu4deljumq3diljzgfsdellcge3wizbyhazwemtggm=',
      href: 'https://give-stage2.cru.org/cortex/ratetotals/carts/crugive/my2gmmlfhaygkllbmu4deljumq3diljzgfsdellcge3wizbyhazwemtggm=',
    },
    {
      rel: 'total',
      rev: 'cart',
      type: 'elasticpath.totals.total',
      uri: '/totals/carts/crugive/my2gmmlfhaygkllbmu4deljumq3diljzgfsdellcge3wizbyhazwemtggm=',
      href: 'https://give-stage2.cru.org/cortex/totals/carts/crugive/my2gmmlfhaygkllbmu4deljumq3diljzgfsdellcge3wizbyhazwemtggm=',
    },
  ],
  _order: [
    {
      _paymentinstrumentselector: [
        {
          _chosen: [
            {
              _description: [
                {
                  self: {
                    type: 'paymentinstruments.payment-instrument',
                    uri: '/paymentmethods/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq=',
                    href: 'https://give-stage2.cru.org/cortex/paymentmethods/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq=',
                  },
                  messages: [],
                  links: [],
                  'default-on-profile': false,
                  'limit-amount': {
                    amount: 0,
                    currency: 'USD',
                    display: '$0.00',
                  },
                  name: 'Cru Payment Instrument',
                  'payment-instrument-identification-attributes': {
                    'last-four-digits': '1118',
                    'card-type': 'MasterCard',
                    'cardholder-name': 'Test Person',
                    description: 'MasterCard - 1118',
                    'expiry-month': '08',
                    'expiry-year': '2020',
                    'country-name': 'US',
                    'extended-address': '',
                    locality: 'Sacramento',
                    'postal-code': '12345',
                    region: 'CA',
                    'street-address': '1234 First Street',
                  },
                  'saved-on-profile': true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  'total-quantity': 7,
};
