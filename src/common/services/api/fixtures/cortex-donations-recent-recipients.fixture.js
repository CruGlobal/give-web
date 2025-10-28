export default {
  self: {
    type: 'elasticpath.profiles.profile',
    uri: '/profiles/crugive/myywkmtcga2diljyme3tkljugfqtollbgzrdeljqmq2tknrtgu2tamtbga=?zoom=givingdashboard:recentdonations',
    href: 'https://give-stage2.cru.org/cortex/profiles/crugive/myywkmtcga2diljyme3tkljugfqtollbgzrdeljqmq2tknrtgu2tamtbga=?zoom=givingdashboard:recentdonations',
  },
  links: [
    {
      rel: 'addresses',
      rev: 'profile',
      type: 'elasticpath.collections.links',
      uri: '/addresses/crugive',
      href: 'https://give-stage2.cru.org/cortex/addresses/crugive',
    },
    {
      rel: 'addspousedetails',
      rev: 'profile',
      type: 'elasticpath.collections.links',
      uri: '/donordetails/profiles/crugive/myywkmtcga2diljyme3tkljugfqtollbgzrdeljqmq2tknrtgu2tamtbga=/spousedetails',
      href: 'https://give-stage2.cru.org/cortex/donordetails/profiles/crugive/myywkmtcga2diljyme3tkljugfqtollbgzrdeljqmq2tknrtgu2tamtbga=/spousedetails',
    },
    {
      rel: 'donordetails',
      type: 'elasticpath.donordetails.donor',
      uri: '/donordetails/profiles/crugive/myywkmtcga2diljyme3tkljugfqtollbgzrdeljqmq2tknrtgu2tamtbga=',
      href: 'https://give-stage2.cru.org/cortex/donordetails/profiles/crugive/myywkmtcga2diljyme3tkljugfqtollbgzrdeljqmq2tknrtgu2tamtbga=',
    },
    {
      rel: 'emails',
      rev: 'profile',
      type: 'elasticpath.collections.links',
      uri: '/emails/crugive',
      href: 'https://give-stage2.cru.org/cortex/emails/crugive',
    },
    {
      rel: 'givingdashboard',
      rev: 'profile',
      type: 'elasticpath.collections.links',
      uri: '/giving/crugive',
      href: 'https://give-stage2.cru.org/cortex/giving/crugive',
    },
    {
      rel: 'paymentmethods',
      rev: 'profile',
      type: 'elasticpath.collections.links',
      uri: '/paymentmethods/crugive',
      href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive',
    },
    {
      rel: 'phonenumbers',
      rev: 'profile',
      type: 'elasticpath.collections.links',
      uri: '/phonenumbers/crugive',
      href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive',
    },
    {
      rel: 'profiletype',
      rev: 'profile',
      type: 'cru.profile.type',
      uri: '/profiletype/crugive',
      href: 'https://give-stage2.cru.org/cortex/profiletype/crugive',
    },
    {
      rel: 'purchases',
      type: 'elasticpath.collections.links',
      uri: '/purchases/crugive',
      href: 'https://give-stage2.cru.org/cortex/purchases/crugive',
    },
    {
      rel: 'selfservicedonordetails',
      type: 'cru.selfservicedonor.self-service-donor',
      uri: '/selfservicedonordetails/profiles/crugive/myywkmtcga2diljyme3tkljugfqtollbgzrdeljqmq2tknrtgu2tamtbga=',
      href: 'https://give-stage2.cru.org/cortex/selfservicedonordetails/profiles/crugive/myywkmtcga2diljyme3tkljugfqtollbgzrdeljqmq2tknrtgu2tamtbga=',
    },
    {
      rel: 'selfservicepaymentinstruments',
      rev: 'profile',
      type: 'elasticpath.collections.links',
      uri: '/selfservicepaymentinstruments/crugive',
      href: 'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/crugive',
    },
    {
      rel: 'wishlists',
      rev: 'profile',
      type: 'elasticpath.collections.links',
      uri: '/wishlists/crugive',
      href: 'https://give-stage2.cru.org/cortex/wishlists/crugive',
    },
  ],
  _givingdashboard: [
    {
      _recentdonations: [
        {
          self: {
            type: 'elasticpath.donations.recipient-donation-history-list',
            uri: '/donations/historical/crugive/recipient/recent',
            href: 'https://give-stage2.cru.org/cortex/donations/historical/crugive/recipient/recent',
          },
          links: [
            {
              rel: 'givingdashboard',
              uri: '/giving/crugive',
              href: 'https://give-stage2.cru.org/cortex/giving/crugive',
            },
          ],
          'donation-summaries': [
            {
              'designation-active': true,
              'designation-name': 'Brian and Jennifer Richardson (0679537)',
              'designation-number': '0679537',
              donations: [
                {
                  'donation-row-id': '1-YMKKB4',
                  'donation-status': 'Closed',
                  'historical-donation-line': {
                    amount: 100,
                    anonymous: false,
                    'campaign-code': '000000',
                    completed: false,
                    'designation-active': true,
                    'designation-name':
                      'Brian and Jennifer Richardson (0679537)',
                    'designation-number': '0679537',
                    'given-through-description':
                      'Hewitt, Robert S. and Susan(439531631)',
                    'master-account': false,
                    'pass-through': false,
                    'payment-method-id': 'giydknjsg4=',
                    'payment-type': 'MasterCard',
                    'related-account-description':
                      'Hewitt, Robert S. and Susan(439531631)',
                    'transaction-date': {
                      'display-value': '2017-02-20',
                      value: 1487548800000,
                    },
                    'transaction-sub-type': 'Credit Card',
                  },
                  'payment-instrument-link': {
                    rel: 'paymentmethod',
                    type: 'elasticpath.paymentmethods.payment-method',
                    uri: '/paymentmethods/crugive/giydknjsg4=',
                  },
                },
              ],
              'most-recent-donation': {
                'donation-row-id': '1-YMKKB4',
                'donation-status': 'Closed',
                'historical-donation-line': {
                  amount: 100,
                  anonymous: false,
                  'campaign-code': '000000',
                  completed: false,
                  'designation-active': true,
                  'designation-name': 'Brian and Jennifer Richardson (0679537)',
                  'designation-number': '0679537',
                  'given-through-description':
                    'Hewitt, Robert S. and Susan(439531631)',
                  'master-account': false,
                  'pass-through': false,
                  'payment-method-id': 'giydknjsg4=',
                  'payment-type': 'MasterCard',
                  'related-account-description':
                    'Hewitt, Robert S. and Susan(439531631)',
                  'transaction-date': {
                    'display-value': '2017-02-20',
                    value: 1487548800000,
                  },
                  'transaction-sub-type': 'Credit Card',
                },
                'payment-instrument-link': {
                  rel: 'paymentmethod',
                  type: 'elasticpath.paymentmethods.payment-method',
                  uri: '/paymentmethods/crugive/giydknjsg4=',
                },
              },
              'recurring-donations-link': {
                rel: 'recurringdonations',
                uri: '/donations/recurring/crugive/recipient/ga3doojvgm3q=',
              },
              'year-to-date-amount': 100,
            },
            {
              'designation-active': true,
              'designation-name': 'Steve Lamie (5460173)',
              'designation-number': '5460173',
              donations: [
                {
                  'donation-row-id': '1-YL3W8T',
                  'donation-status': 'Closed',
                  'historical-donation-line': {
                    amount: 50,
                    anonymous: false,
                    'campaign-code': '000000',
                    completed: false,
                    'designation-active': true,
                    'designation-name': 'Steve Lamie (5460173)',
                    'designation-number': '5460173',
                    'given-through-description':
                      'Hewitt, Robert S. and Susan(439531631)',
                    'master-account': false,
                    'pass-through': false,
                    'payment-method-id': 'giydimbvg4=',
                    'payment-type': 'Visa',
                    'related-account-description':
                      'Hewitt, Robert S. and Susan(439531631)',
                    'transaction-date': {
                      'display-value': '2017-02-16',
                      value: 1487203200000,
                    },
                    'transaction-sub-type': 'Credit Card',
                  },
                  'payment-instrument-link': {
                    rel: 'paymentmethod',
                    type: 'elasticpath.paymentmethods.payment-method',
                    uri: '/paymentmethods/crugive/giydimbvg4=',
                  },
                },
              ],
              'most-recent-donation': {
                'donation-row-id': '1-YL3W8T',
                'donation-status': 'Closed',
                'historical-donation-line': {
                  amount: 50,
                  anonymous: false,
                  'campaign-code': '000000',
                  completed: false,
                  'designation-active': true,
                  'designation-name': 'Steve Lamie (5460173)',
                  'designation-number': '5460173',
                  'given-through-description':
                    'Hewitt, Robert S. and Susan(439531631)',
                  'master-account': false,
                  'pass-through': false,
                  'payment-method-id': 'giydimbvg4=',
                  'payment-type': 'Visa',
                  'related-account-description':
                    'Hewitt, Robert S. and Susan(439531631)',
                  'transaction-date': {
                    'display-value': '2017-02-16',
                    value: 1487203200000,
                  },
                  'transaction-sub-type': 'Credit Card',
                },
                'payment-instrument-link': {
                  rel: 'paymentmethod',
                  type: 'elasticpath.paymentmethods.payment-method',
                  uri: '/paymentmethods/crugive/giydimbvg4=',
                },
              },
              'recurring-donations-link': {
                rel: 'recurringdonations',
                uri: '/donations/recurring/crugive/recipient/gu2dmmbrg4zq=',
              },
              'year-to-date-amount': 50,
            },
          ],
        },
      ],
    },
  ],
  'family-name': 'Hewitt',
  'given-name': 'Robert',
};
