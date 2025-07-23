export default {
  self: {
    type: 'elasticpath.profiles.profile',
    uri: '/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=?zoom=addresses:mailingaddress,addspousedetails,donordetails,emails:element,givingdashboard:yeartodateamount,phonenumbers:element',
    href: 'https://give-stage2.cru.org/cortex/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=?zoom=addresses:mailingaddress,addspousedetails,donordetails,emails:element,givingdashboard:yeartodateamount,phonenumbers:element',
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
      uri: '/donordetails/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=',
      href: 'https://give-stage2.cru.org/cortex/donordetails/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=',
    },
    {
      rel: 'addspousedetails',
      rev: 'profile',
      type: 'elasticpath.collections.links',
      uri: '/donordetails/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=/spousedetails',
      href: 'https://give-stage2.cru.org/cortex/donordetails/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=/spousedetails',
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
  _addresses: [
    {
      _mailingaddress: [
        {
          self: {
            type: 'elasticpath.addresses.address',
            uri: '/addresses/crugive/gewtcusniq3ds=',
            href: 'https://give-stage2.cru.org/cortex/addresses/crugive/gewtcusniq3ds=',
          },
          links: [
            {
              rel: 'profile',
              rev: 'addresses',
              type: 'elasticpath.profiles.profile',
              uri: '/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=',
              href: 'https://give-stage2.cru.org/cortex/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=',
            },
            {
              rel: 'list',
              type: 'elasticpath.collections.links',
              uri: '/addresses/crugive',
              href: 'https://give-stage2.cru.org/cortex/addresses/crugive',
            },
          ],
          address: {
            'country-name': 'US',
            locality: 'Post Falls',
            'postal-code': '83854-6674',
            region: 'ID',
            'street-address': '2100 N Palisades Dr',
          },
          name: {},
        },
      ],
    },
  ],
  _addspousedetails: [
    {
      self: {
        type: 'elasticpath.donordetails.donor-name',
        uri: '/donordetails/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=/spousedetails',
        href: 'https://give-stage2.cru.org/cortex/donordetails/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=/spousedetails',
      },
      links: [
        {
          rel: 'profile',
          rev: 'addspousedetails',
          type: 'elasticpath.profiles.profile',
          uri: '/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=',
          href: 'https://give-stage2.cru.org/cortex/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=',
        },
      ],
      'family-name': 'Tubbs',
      'given-name': 'Julia',
      'middle-initial': 'Q',
      suffix: '',
      title: 'Mrs',
    },
  ],
  _donordetails: [
    {
      self: {
        type: 'elasticpath.donordetails.donor',
        uri: '/donordetails/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=',
        href: 'https://give-stage2.cru.org/cortex/donordetails/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=',
      },
      links: [
        {
          rel: 'profile',
          rev: 'donordetails',
          type: 'elasticpath.profiles.profile',
          uri: '/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=',
          href: 'https://give-stage2.cru.org/cortex/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=',
        },
        {
          rel: 'donormatchesform',
          uri: '/donormatches/crugive/form',
          href: 'https://give-stage2.cru.org/cortex/donormatches/crugive/form',
        },
      ],
      'donor-number': '447072430',
      'donor-type': 'Household',
      'mailing-address': {
        'country-name': 'US',
        'extended-address': '',
        locality: 'Post Falls',
        'postal-code': '83854-6674',
        region: 'ID',
        'street-address': '2100 N Palisades Dr',
      },
      name: {
        'family-name': 'Tubbs',
        'given-name': 'Mark',
        'middle-initial': 'L',
        suffix: '',
        title: 'Mr',
      },
      'organization-name': '',
      'phone-number': '(909) 337-2433',
      'registration-state': 'COMPLETED',
      'spouse-name': {
        'family-name': 'Tubbs',
        'given-name': 'Julia',
        'middle-initial': 'Q',
        suffix: '',
        title: 'Mrs',
      },
    },
  ],
  _emails: [
    {
      _element: [
        {
          self: {
            type: 'elasticpath.emails.email',
            uri: '/emails/crugive/nv2eazlymfwxa3dffzrw63i=',
            href: 'https://give-stage2.cru.org/cortex/emails/crugive/nv2eazlymfwxa3dffzrw63i=',
          },
          links: [
            {
              rel: 'list',
              type: 'elasticpath.collections.links',
              uri: '/emails/crugive',
              href: 'https://give-stage2.cru.org/cortex/emails/crugive',
            },
            {
              rel: 'profile',
              type: 'elasticpath.profiles.profile',
              uri: '/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=',
              href: 'https://give-stage2.cru.org/cortex/profiles/crugive/mi2dozrtga2gmljxgbrdiljume4tiljzgvtgkljxgq2dkobygnqtsy3ggi=',
            },
          ],
          email: 'mt@example.com',
        },
      ],
    },
  ],
  _givingdashboard: [
    {
      _yeartodateamount: [
        {
          self: {
            type: 'elasticpath.donations.year-to-date',
            uri: '/donations/historical/crugive/yeartodate',
            href: 'https://give-stage2.cru.org/cortex/donations/historical/crugive/yeartodate',
          },
          links: [
            {
              rel: 'givingdashboard',
              uri: '/giving/crugive',
              href: 'https://give-stage2.cru.org/cortex/giving/crugive',
            },
          ],
          'year-to-date-amount': 0,
        },
      ],
    },
  ],
  _phonenumbers: [
    {
      _element: [
        {
          self: {
            type: 'elasticpath.phonenumbers.phone-number',
            uri: '/phonenumbers/crugive/gewuewcjfu3tsobr=',
            href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive/gewuewcjfu3tsobr=',
          },
          links: [
            {
              rel: 'list',
              type: 'elasticpath.collections.links',
              uri: '/phonenumbers/crugive',
              href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive',
            },
          ],
          locked: false,
          'phone-number': '(909) 337-2433',
          'phone-number-type': 'Home',
          primary: true,
        },
      ],
    },
  ],
  'family-name': 'Tubbs',
  'given-name': 'Mark',
};
