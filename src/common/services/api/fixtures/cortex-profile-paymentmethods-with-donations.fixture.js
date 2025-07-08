export default {
  self: {
    type: 'elasticpath.profiles.profile',
    uri: '/profiles/crugive/mi4tozbwgm4tqljwgjqtmljugmzgcljyg4ydiljtge2tkmdfgiztkzldgy=?zoom=selfservicepaymentinstruments:element,selfservicepaymentinstruments:element:recurringgifts',
    href: 'https://give-stage2.cru.org/cortex/profiles/crugive/mi4tozbwgm4tqljwgjqtmljugmzgcljyg4ydiljtge2tkmdfgiztkzldgy=?zoom=selfservicepaymentinstruments:element,selfservicepaymentinstruments:element:recurringgifts',
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
      rel: 'donordetails',
      type: 'elasticpath.donordetails.donor',
      uri: '/donordetails/profiles/crugive/mi4tozbwgm4tqljwgjqtmljugmzgcljyg4ydiljtge2tkmdfgiztkzldgy=',
      href: 'https://give-stage2.cru.org/cortex/donordetails/profiles/crugive/mi4tozbwgm4tqljwgjqtmljugmzgcljyg4ydiljtge2tkmdfgiztkzldgy=',
    },
    {
      rel: 'addspousedetails',
      rev: 'profile',
      type: 'elasticpath.collections.links',
      uri: '/donordetails/profiles/crugive/mi4tozbwgm4tqljwgjqtmljugmzgcljyg4ydiljtge2tkmdfgiztkzldgy=/spousedetails',
      href: 'https://give-stage2.cru.org/cortex/donordetails/profiles/crugive/mi4tozbwgm4tqljwgjqtmljugmzgcljyg4ydiljtge2tkmdfgiztkzldgy=/spousedetails',
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
      rel: 'purchases',
      type: 'elasticpath.collections.links',
      uri: '/purchases/crugive',
      href: 'https://give-stage2.cru.org/cortex/purchases/crugive',
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
  _selfservicepaymentinstruments: [
    {
      _element: [
        {
          self: {
            type: 'elasticpath.bankaccounts.bank-account',
            uri: '/selfservicepaymentinstruments/crugive/giydgobwgq=',
            href: 'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/crugive/giydgobwgq=',
          },
          links: [
            {
              rel: 'list',
              uri: '/selfservicepaymentinstruments/crugive',
              href: 'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/crugive',
            },
            {
              rel: 'recurringgifts',
              uri: '/donations/recurring/crugive/paymentmethods/giydgobwgq=',
              href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/paymentmethods/giydgobwgq=',
            },
          ],
          _recurringgifts: [
            {
              self: {
                type: 'elasticpath.donations.donations',
                uri: '/donations/recurring/crugive/paymentmethods/giydgobwgq=',
                href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/paymentmethods/giydgobwgq=',
              },
              links: [
                {
                  rel: 'givingdashboard',
                  uri: '/giving/crugive',
                  href: 'https://give-stage2.cru.org/cortex/giving/crugive',
                },
                {
                  rel: 'selfservicepaymentinstruments',
                  uri: '/selfservicepaymentinstruments/crugive/giydgobwgq=',
                  href: 'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/crugive/giydgobwgq=',
                },
              ],
              donations: [],
            },
          ],
          'account-type': 'Checking',
          'bank-name': '021000021',
          description: '021000021 - 434',
          'display-account-number': '434',
          'encrypted-account-number': '',
          'routing-number': '021000021',
        },
        {
          self: {
            type: 'elasticpath.bankaccounts.bank-account',
            uri: '/selfservicepaymentinstruments/crugive/giydimjtgq=',
            href: 'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/crugive/giydimjtgq=',
          },
          links: [
            {
              rel: 'list',
              uri: '/selfservicepaymentinstruments/crugive',
              href: 'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/crugive',
            },
            {
              rel: 'element',
              rev: 'list',
              type: 'elasticpath.donations.donation',
              uri: '/donations/recurring/crugive/gewuuws2ljhvq=',
              href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/gewuuws2ljhvq=',
            },
            {
              rel: 'element',
              rev: 'list',
              type: 'elasticpath.donations.donation',
              uri: '/donations/recurring/crugive/gewuuws2ljida=',
              href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/gewuuws2ljida=',
            },
            {
              rel: 'recurringgifts',
              uri: '/donations/recurring/crugive/paymentmethods/giydimjtgq=',
              href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/paymentmethods/giydimjtgq=',
            },
          ],
          _recurringgifts: [
            {
              self: {
                type: 'elasticpath.donations.donations',
                uri: '/donations/recurring/crugive/paymentmethods/giydimjtgq=',
                href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/paymentmethods/giydimjtgq=',
              },
              links: [
                {
                  rel: 'element',
                  rev: 'list',
                  type: 'elasticpath.donations.donation',
                  uri: '/donations/recurring/crugive/gewuuws2ljhvq=',
                  href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/gewuuws2ljhvq=',
                },
                {
                  rel: 'element',
                  rev: 'list',
                  type: 'elasticpath.donations.donation',
                  uri: '/donations/recurring/crugive/gewuuws2ljida=',
                  href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/gewuuws2ljida=',
                },
                {
                  rel: 'givingdashboard',
                  uri: '/giving/crugive',
                  href: 'https://give-stage2.cru.org/cortex/giving/crugive',
                },
                {
                  rel: 'selfservicepaymentinstruments',
                  uri: '/selfservicepaymentinstruments/crugive/giydimjtgq=',
                  href: 'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/crugive/giydimjtgq=',
                },
              ],
              donations: [
                {
                  'donation-lines': [
                    {
                      amount: 50,
                      'designation-name':
                        'Gerald and Christine Mantlo (0429149)',
                      'designation-number': '0429149',
                      'donation-line-row-id': '1-JZZZOZ',
                      'donation-line-status': 'Standard',
                      'payment-method-id': 'giydimjtgq=',
                      'updated-donation-line-status': '',
                      'updated-payment-method-id': '',
                      'updated-rate': {
                        recurrence: {
                          interval: '',
                        },
                      },
                      'updated-recurring-day-of-month': '',
                      'updated-start-month': '',
                      'updated-start-year': '',
                    },
                  ],
                  'donation-row-id': '1-JZZZOX',
                  'donation-status': 'Active',
                  'effective-status': 'Active',
                  'next-draw-date': {
                    'display-value': '2016-10-10',
                    value: 1476057600000,
                  },
                  rate: {
                    recurrence: {
                      interval: 'Monthly',
                    },
                  },
                  'recurring-day-of-month': '10',
                  'start-date': {
                    'display-value': '2016-10-04',
                    value: 1475539200000,
                  },
                },
                {
                  'donation-lines': [
                    {
                      amount: 21,
                      'designation-name': 'FamilyLife (2294554)',
                      'designation-number': '2294554',
                      'donation-line-row-id': '1-JZZZP2',
                      'donation-line-status': 'Standard',
                      'payment-method-id': 'giydimjtgq=',
                      'updated-donation-line-status': '',
                      'updated-payment-method-id': '',
                      'updated-rate': {
                        recurrence: {
                          interval: '',
                        },
                      },
                      'updated-recurring-day-of-month': '',
                      'updated-start-month': '',
                      'updated-start-year': '',
                    },
                  ],
                  'donation-row-id': '1-JZZZP0',
                  'donation-status': 'Active',
                  'effective-status': 'Active',
                  'next-draw-date': {
                    'display-value': '2016-10-15',
                    value: 1476489600000,
                  },
                  rate: {
                    recurrence: {
                      interval: 'Monthly',
                    },
                  },
                  'recurring-day-of-month': '15',
                  'start-date': {
                    'display-value': '2016-10-04',
                    value: 1475539200000,
                  },
                },
              ],
            },
          ],
          'account-type': 'Checking',
          'bank-name': 'Chase Bank',
          description: 'Chase Bank - 5674',
          'display-account-number': '5674',
          'encrypted-account-number': '',
          'routing-number': '011401533',
        },
      ],
    },
  ],
  'family-name': 'Kopa',
  'given-name': 'Roger',
};
