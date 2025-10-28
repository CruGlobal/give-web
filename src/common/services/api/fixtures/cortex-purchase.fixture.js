export default {
  self: {
    type: 'elasticpath.purchases.purchase',
    uri: '/purchases/crugive/giydanju=?zoom=donordetails,lineitems:element,lineitems:element:item:code,lineitems:element:item:offer:code,lineitems:element:rate,paymentinstruments:element,ratetotals:element,billingaddress',
    href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=?zoom=donordetails,lineitems:element,lineitems:element:item:code,lineitems:element:item:offer:code,lineitems:element:rate,paymentinstruments:element,ratetotals:element,billingaddress',
  },
  links: [
    {
      rel: 'list',
      type: 'elasticpath.collections.links',
      uri: '/purchases/crugive',
      href: 'https://give-stage2.cru.org/cortex/purchases/crugive',
    },
    {
      rel: 'coupons',
      type: 'elasticpath.collections.links',
      uri: '/coupons/purchases/crugive/giydanju=',
      href: 'https://give-stage2.cru.org/cortex/coupons/purchases/crugive/giydanju=',
    },
    {
      rel: 'discount',
      type: 'elasticpath.discounts.discount',
      uri: '/discounts/purchases/crugive/giydanju=',
      href: 'https://give-stage2.cru.org/cortex/discounts/purchases/crugive/giydanju=',
    },
    {
      rel: 'donordetails',
      type: 'elasticpath.donordetails.donor',
      uri: '/donordetails/purchases/crugive/giydanju=',
      href: 'https://give-stage2.cru.org/cortex/donordetails/purchases/crugive/giydanju=',
    },
    {
      rel: 'appliedpromotions',
      type: 'elasticpath.collections.links',
      uri: '/promotions/purchases/crugive/giydanju=/applied',
      href: 'https://give-stage2.cru.org/cortex/promotions/purchases/crugive/giydanju=/applied',
    },
    {
      rel: 'lineitems',
      rev: 'purchase',
      type: 'elasticpath.collections.links',
      uri: '/purchases/crugive/giydanju=/lineitems',
      href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems',
    },
    {
      rel: 'billingaddress',
      rev: 'purchase',
      type: 'elasticpath.addresses.address',
      uri: '/purchases/crugive/giydanju=/billingaddress',
      href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/billingaddress',
    },
    {
      rel: 'paymentinstruments',
      type: 'paymentinstruments.purchase-payment-instruments',
      href: 'https://give-stage2.cru.org/cortex/paymentinstruments/purchases/crugive/giydanju=/purchasepaymentinstrument',
    },
    {
      rel: 'ratetotals',
      type: 'elasticpath.ratetotals.rate-total',
      uri: '/ratetotals/purchases/crugive/giydanju=',
      href: 'https://give-stage2.cru.org/cortex/ratetotals/purchases/crugive/giydanju=',
    },
    {
      rel: 'shipments',
      rev: 'purchase',
      type: 'elasticpath.collections.links',
      uri: '/shipments/purchases/crugive/giydanju=',
      href: 'https://give-stage2.cru.org/cortex/shipments/purchases/crugive/giydanju=',
    },
  ],
  _billingaddress: [
    {
      self: {
        type: 'purchases.purchase-billingaddress',
        uri: '/purchases/crugive/giydcnzv=/billingaddress',
        href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydcnzv=/billingaddress',
      },
      messages: [],
      links: [
        {
          rel: 'purchase',
          type: 'purchases.purchase',
          href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydcnzv=',
        },
      ],
      address: {
        'country-name': 'US',
        'extended-address': 'Apt 45',
        locality: 'State',
        'postal-code': '12345',
        region: 'AL',
        'street-address': '123 Asdf St',
      },
      name: {
        'family-name': 'Lname',
        'given-name': 'Fname',
      },
      organization: null,
      'phone-number': null,
    },
  ],
  _donordetails: [
    {
      self: {
        type: 'elasticpath.donordetails.donor',
        uri: '/donordetails/purchases/crugive/giydanju=',
        href: 'https://give-stage2.cru.org/cortex/donordetails/purchases/crugive/giydanju=',
      },
      links: [
        {
          rel: 'purchase',
          rev: 'donordetails',
          type: 'elasticpath.purchases.purchase',
          uri: '/purchases/crugive/giydanju=',
          href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=',
        },
        {
          rel: 'donormatchesform',
          uri: '/donormatches/form',
          href: 'https://give-stage2.cru.org/cortex/donormatches/form',
        },
      ],
      'donor-type': 'Household',
      'mailing-address': {
        'country-name': 'US',
        locality: 'sdaf',
        'postal-code': '12345',
        region: 'CA',
        'street-address': 'sg',
      },
      name: {
        'family-name': 'Lname',
        'given-name': 'Fname',
        'middle-initial': 'm',
        suffix: 'Jr.',
        title: 'Mr.',
      },
      'organization-name': 'myorg',
      'phone-number': '1234567890',
      'registration-state': 'MATCHED',
      'spouse-name': {
        'family-name': 'rewq',
        'given-name': 'qwer',
        'middle-initial': 'a',
        suffix: 'IV',
        title: 'Mrs.',
      },
    },
  ],
  _lineitems: [
    {
      _element: [
        {
          self: {
            type: 'elasticpath.purchases.line-item',
            uri: '/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=',
            href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=',
          },
          links: [
            {
              rel: 'purchase',
              type: 'elasticpath.purchases.purchase',
              uri: '/purchases/crugive/giydanju=',
              href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=',
            },
            {
              rel: 'list',
              type: 'elasticpath.collections.links',
              uri: '/purchases/crugive/giydanju=/lineitems',
              href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems',
            },
            {
              rel: 'options',
              rev: 'lineitem',
              type: 'elasticpath.collections.links',
              uri: '/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=/options',
              href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=/options',
            },
            {
              rel: 'rate',
              rev: 'lineitem',
              type: 'elasticpath.rates.rate',
              uri: '/rates/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=',
              href: 'https://give-stage2.cru.org/cortex/rates/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=',
            },
          ],
          _rate: [
            {
              self: {
                type: 'rate.purchase-rate',
                uri: '/rates/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=',
                href: 'https://give-stage2.cru.org/cortex/rates/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=',
              },
              links: [
                {
                  rel: 'lineitem',
                  rev: 'rate',
                  type: 'elasticpath.purchases.line-item',
                  uri: '/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=',
                  href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=',
                },
              ],
              cost: [
                {
                  amount: 50.0,
                  'amount-with-fees': 51.2,
                  currency: 'USD',
                  display: '$50.00',
                  'display-with-fees': '$51.20',
                },
              ],
              display: '$50.00 One Time',
              recurrence: { display: 'One Time', interval: 'NA' },
            },
          ],
          'line-extension-amount': [
            { amount: 50.0, currency: 'USD', display: '$50.00' },
          ],
          'line-extension-tax': [
            { amount: 0.0, currency: 'USD', display: '$0.00' },
          ],
          'line-extension-total': [
            { amount: 50.0, currency: 'USD', display: '$50.00' },
          ],
          name: 'E-Ministry',
          quantity: 1,
          _item: [
            {
              _code: [
                {
                  self: {
                    type: 'items.code-for-item',
                    uri: '/items/code/items/crugive/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=',
                    href: 'https://give-stage2.cru.org/cortex/items/code/items/crugive/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=',
                  },
                  links: [],
                  code: '0798349',
                },
              ],
              _offer: [
                {
                  _code: [
                    {
                      self: {
                        type: 'offers.code-for-offer',
                        uri: '/offers/code/offers/crugive/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=',
                        href: 'https://give-stage2.cru.org/cortex/offers/code/offers/crugive/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=',
                      },
                      messages: [],
                      links: [
                        {
                          rel: 'offer',
                          rev: 'code',
                          type: 'offers.offer',
                          uri: '/offers/code/offers/crugive/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=',
                        },
                      ],
                      code: '0798349',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          self: {
            type: 'elasticpath.purchases.line-item',
            uri: '/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
            href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
          },
          links: [
            {
              rel: 'purchase',
              type: 'elasticpath.purchases.purchase',
              uri: '/purchases/crugive/giydanju=',
              href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=',
            },
            {
              rel: 'list',
              type: 'elasticpath.collections.links',
              uri: '/purchases/crugive/giydanju=/lineitems',
              href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems',
            },
            {
              rel: 'code',
              type: 'elasticpath.extlookups.product-code',
              uri: '/productcodes/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
              href: 'https://give-stage2.cru.org/cortex/productcodes/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
            },
            {
              rel: 'options',
              rev: 'lineitem',
              type: 'elasticpath.collections.links',
              uri: '/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=/options',
              href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=/options',
            },
            {
              rel: 'rate',
              rev: 'lineitem',
              type: 'elasticpath.rates.rate',
              uri: '/rates/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
              href: 'https://give-stage2.cru.org/cortex/rates/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
            },
          ],
          _rate: [
            {
              self: {
                type: 'elasticpath.rates.rate',
                uri: '/rates/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
                href: 'https://give-stage2.cru.org/cortex/rates/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
              },
              links: [
                {
                  rel: 'lineitem',
                  rev: 'rate',
                  type: 'elasticpath.purchases.line-item',
                  uri: '/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
                  href: 'https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
                },
              ],
              cost: [
                {
                  amount: 50.0,
                  'amount-with-fees': 51.2,
                  currency: 'USD',
                  display: '$50.00',
                  'display-with-fees': '$51.20',
                },
              ],
              display: '$50.00 Monthly',
              recurrence: { display: 'Monthly', interval: 'MON' },
            },
          ],
          'line-extension-amount': [
            { amount: 0.0, currency: 'USD', display: '$0.00' },
          ],
          'line-extension-tax': [
            { amount: 0.0, currency: 'USD', display: '$0.00' },
          ],
          'line-extension-total': [
            { amount: 0.0, currency: 'USD', display: '$0.00' },
          ],
          name: 'Half a Team Motorbike',
          quantity: 1,
          _item: [
            {
              _code: [
                {
                  self: {
                    type: 'items.code-for-item',
                    uri: '/items/code/items/crugive/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
                    href: 'https://give-stage2.cru.org/cortex/items/code/items/crugive/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
                  },
                  links: [],
                  code: '0775813_mon',
                },
              ],
              _offer: [
                {
                  _code: [
                    {
                      self: {
                        type: 'offers.code-for-offer',
                        uri: '/offers/code/offers/crugive/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
                        href: 'https://give-stage2.cru.org/cortex/offers/code/offers/crugive/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
                      },
                      messages: [],
                      links: [
                        {
                          rel: 'offer',
                          rev: 'code',
                          type: 'offers.offer',
                          uri: '/offers/code/offers/crugive/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=',
                        },
                      ],
                      code: '0775813',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  _paymentinstruments: [
    {
      _element: [
        {
          self: {
            type: 'paymentinstruments.purchase-payment-instrument',
            uri: '/paymentinstruments/purchases/crugive/giydanju=/purchasepaymentinstrument/giydamzyge=',
            href: 'https://give-stage2.cru.org/cortex/paymentinstruments/purchases/crugive/giydanju=/purchasepaymentinstrument/giydamzyge=',
          },
          links: [
            {
              rel: 'paymentinstruments',
              type: 'paymentinstruments.purchase-payment-instruments',
              href: 'https://give-stage2.cru.org/cortex/paymentinstruments/purchases/crugive/giydanju=/purchasepaymentinstrument',
            },
            {
              rel: 'paymentmethod',
              type: 'paymentinstruments.purchase-payment-method',
              href: 'https://give-stage2.cru.org/cortex/paymentinstruments/purchases/crugive/giydanju=/purchasepaymentinstrument/giydamzyge=/purchasepaymentmethod/g4ygeodbg42tilldha4wiljrgfswellbgvsdmllfgu4wenjxmu2ton3bgm=',
            },
          ],
          name: 'Cru Payment Instrument',
          'payment-instrument-identification-attributes': {
            'card-number': 'aw3afa8af1111',
            'card-type': 'Visa',
            'expiry-month': '12',
            'expiry-year': '2019',
            'cardholder-name': 'sadf',
            description: 'Visa - 1111',
            'last-four-digits': '1111',
          },
        },
      ],
    },
  ],
  _ratetotals: [
    {
      _element: [
        {
          self: {
            type: 'elasticpath.ratetotals.rate-total',
            uri: '/ratetotals/purchases/crugive/giydanju=/a5ve2uj7yoadlqvvku6dckreernmfj6cxvqt6mtooquwyscpppble4jqgnzusp3tfhbkyi3jnhbk46lujmsmhadhykvemv6cwpblg7odrjp4fmwcwjnugwj3lizd65smee=',
            href: 'https://give-stage2.cru.org/cortex/ratetotals/purchases/crugive/giydanju=/a5ve2uj7yoadlqvvku6dckreernmfj6cxvqt6mtooquwyscpppble4jqgnzusp3tfhbkyi3jnhbk46lujmsmhadhykvemv6cwpblg7odrjp4fmwcwjnugwj3lizd65smee=',
          },
          links: [],
          cost: { amount: 50.0, currency: 'USD', display: '$50.00' },
          display: '$50.00 Monthly',
          recurrence: { display: 'Monthly', interval: 'MON' },
        },
        {
          self: {
            type: 'elasticpath.ratetotals.rate-total',
            uri: '/ratetotals/purchases/crugive/giydanju=/a5ve2uj7yoadlqvvku6dckreernmfj6cxvqt6mtooquwyscpppble4jqgnzusp3tfhbkyi3jnhbk46lujmsmhadhykvemv6cwpblg7odrjp4fmwcwjnugwj3lizd65tmee=',
            href: 'https://give-stage2.cru.org/cortex/ratetotals/purchases/crugive/giydanju=/a5ve2uj7yoadlqvvku6dckreernmfj6cxvqt6mtooquwyscpppble4jqgnzusp3tfhbkyi3jnhbk46lujmsmhadhykvemv6cwpblg7odrjp4fmwcwjnugwj3lizd65tmee=',
          },
          links: [],
          cost: {
            amount: 50.0,
            'amount-with-fees': 51.2,
            currency: 'USD',
            display: '$50.00',
            'display-with-fees': '$51.20',
          },
          display: '$50.00 Single',
          recurrence: { display: 'Single', interval: 'NA' },
        },
      ],
    },
  ],
  'monetary-total': [{ amount: 50.0, currency: 'USD', display: '$50.00' }],
  'purchase-date': {
    'display-value': 'September 3, 2016 4:14:33 AM',
    value: 1472876073000,
  },
  'purchase-number': '20054',
  status: 'COMPLETED',
  'tax-total': { amount: 0.0, currency: 'USD', display: '$0.00' },
};
