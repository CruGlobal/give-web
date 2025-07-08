export default {
  self: {
    type: 'elasticpath.collections.links',
    uri: '/donations/historical/crugive/2015/8?zoom=element,element:paymentmethod',
    href: 'https://give-stage2.cru.org/cortex/donations/historical/crugive/2015/8?zoom=element,element:paymentmethod',
  },
  links: [
    {
      rel: 'element',
      rev: 'list',
      type: 'elasticpath.donations.historical-donation',
      uri: '/donations/historical/crugive/gewums2kgjmew=',
      href: 'https://give-stage2.cru.org/cortex/donations/historical/crugive/gewums2kgjmew=',
    },
    {
      rel: 'givingdashboard',
      uri: '/giving/crugive',
      href: 'https://give-stage2.cru.org/cortex/giving/crugive',
    },
  ],
  _element: [
    {
      self: {
        type: 'elasticpath.donations.historical-donation',
        uri: '/donations/historical/crugive/gewums2kgjmew=',
        href: 'https://give-stage2.cru.org/cortex/donations/historical/crugive/gewums2kgjmew=',
      },
      links: [
        {
          rel: 'paymentmethod',
          uri: '/paymentmethods/crugive/giydgnbsha=',
          href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive/giydgnbsha=',
        },
      ],
      _paymentmethod: [
        {
          self: {
            type: 'cru.creditcards.named-credit-card',
            uri: '/paymentmethods/crugive/giydgnbsha=',
            href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive/giydgnbsha=',
          },
          links: [
            {
              rel: 'list',
              type: 'elasticpath.collections.links',
              uri: '/paymentmethods/crugive',
              href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive',
            },
          ],
          address: {
            'extended-address': '',
            locality: '',
            'postal-code': '',
            region: '',
            'street-address': '',
          },
          'card-number': '4735',
          'card-type': 'MasterCard',
          description: 'MasterCard - 4735',
          'expiry-month': '11',
          'expiry-year': '2019',
        },
      ],
      'donation-row-id': '1-FKJ2XK',
      'donation-status': 'Completed',
      'historical-donation-line': {
        amount: 40,
        anonymous: false,
        'campaign-code': '000000',
        completed: true,
        'designation-active': false,
        'designation-name': 'Mitch and Terri Wiley (0580560)',
        'designation-number': '0580560',
        'given-through-description': 'Tubbs, Mark L. and Julia Q.(447072430)',
        'master-account': false,
        'pass-through': false,
        'payment-method-id': '203428',
        'payment-type': 'MasterCard',
        'related-account-description': 'Tubbs, Mark L. and Julia Q.(447072430)',
        'transaction-date': {
          'display-value': '2015-08-17',
          value: 1439769600000,
        },
        'transaction-sub-type': 'Credit Card',
      },
    },
    {
      self: {
        type: 'elasticpath.donations.historical-donation',
        uri: '/donations/historical/crugive/gewusqkqkfdvm=',
        href: 'https://give-stage2.cru.org/cortex/donations/historical/crugive/gewusqkqkfdvm=',
      },
      links: [
        {
          rel: 'recurringdonationelement',
          rev: 'recurringdonationlist',
          type: 'elasticpath.donations.donation',
          uri: '/donations/recurring/crugive/gewukr2vjjbdi=',
          href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/gewukr2vjjbdi=',
        },
        {
          rel: 'paymentmethod',
          uri: '/paymentmethods/crugive/giydgnbsha=',
          href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive/giydgnbsha=',
        },
        {
          rel: 'giveagift',
          type: 'elasticpath.items.item',
          uri: '/items/crugive/gizdqojzheyq=',
          href: 'https://give-stage2.cru.org/cortex/items/crugive/gizdqojzheyq=',
        },
      ],
      _paymentmethod: [
        {
          self: {
            type: 'cru.creditcards.named-credit-card',
            uri: '/paymentmethods/crugive/giydgnbsha=',
            href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive/giydgnbsha=',
          },
          links: [
            {
              rel: 'list',
              type: 'elasticpath.collections.links',
              uri: '/paymentmethods/crugive',
              href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive',
            },
          ],
          address: {
            'extended-address': '',
            locality: '',
            'postal-code': '',
            region: '',
            'street-address': '',
          },
          'card-number': '4735',
          'card-type': 'MasterCard',
          description: 'MasterCard - 4735',
          'expiry-month': '11',
          'expiry-year': '2019',
        },
      ],
      _recurringdonationelement: [
        {
          self: {
            type: 'donations.recurring',
            uri: '/donations/recurring/crugive/gewukr2vjjbdi=',
            href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/gewukr2vjjbdi=',
          },
          links: [
            {
              rel: 'paymentmethods',
              uri: '/paymentmethods/crugive',
              href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive',
            },
            {
              rel: 'paymentmethod',
              uri: '/paymentmethods/crugive/m5uxszdhnzrhg2dbhu=',
              href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive/m5uxszdhnzrhg2dbhu=',
            },
          ],
          'donation-lines': [
            {
              amount: 40,
              'designation-name': 'General Staff Fund (2289991)',
              'designation-number': '2289991',
              'donation-line-row-id': '1-EGUJB8',
              'donation-line-status': 'Standard',
              'payment-method-id': 'giydgnbsha=',
              'updated-donation-line-status': '',
              'updated-payment-method-id': '',
              'updated-rate': { recurrence: { interval: '' } },
              'updated-recurring-day-of-month': '',
              'updated-start-month': '',
              'updated-start-year': '',
            },
          ],
          'donation-row-id': '1-EGUJB4',
          'donation-status': 'Active',
          'effective-status': 'Active',
          'next-draw-date': {
            'display-value': '2016-01-15',
            value: 1452816000000,
          },
          rate: { recurrence: { interval: 'Monthly' } },
          'recurring-day-of-month': '15',
          'start-date': { 'display-value': '2015-07-16', value: 1437004800000 },
        },
      ],
      'donation-row-id': '1-IAPQGV',
      'donation-status': 'Completed',
      'historical-donation-line': {
        amount: 40,
        anonymous: false,
        'campaign-code': '000000',
        completed: true,
        'designation-active': true,
        'designation-name': 'General Staff Fund (2289991)',
        'designation-number': '2289991',
        'given-through-description': 'Tubbs, Mark L. and Julia Q.(447072430)',
        'master-account': false,
        'pass-through': false,
        'payment-method-id': '203428',
        'payment-type': 'MasterCard',
        'related-account-description': 'Tubbs, Mark L. and Julia Q.(447072430)',
        'transaction-date': {
          'display-value': '2015-11-16',
          value: 1447632000000,
        },
        'transaction-sub-type': 'Credit Card',
      },
    },
  ],
};
