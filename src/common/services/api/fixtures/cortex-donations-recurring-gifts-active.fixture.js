export default {
  self: {
    type: 'elasticpath.profiles.profile',
    uri: '/profiles/crugive/gbrdemzygy2geljxg5rtoljugfsgmllbhfstqlldgy2dozddmjsdsmbwmi=?zoom=givingdashboard:managerecurringdonations',
    href: 'https://give-stage2.cru.org/cortex/profiles/crugive/gbrdemzygy2geljxg5rtoljugfsgmllbhfstqlldgy2dozddmjsdsmbwmi=?zoom=givingdashboard:managerecurringdonations'
  },
  links: [{
    rel: 'addresses',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/addresses/crugive',
    href: 'https://give-stage2.cru.org/cortex/addresses/crugive'
  }, {
    rel: 'addspousedetails',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/donordetails/profiles/crugive/gbrdemzygy2geljxg5rtoljugfsgmllbhfstqlldgy2dozddmjsdsmbwmi=/spousedetails',
    href: 'https://give-stage2.cru.org/cortex/donordetails/profiles/crugive/gbrdemzygy2geljxg5rtoljugfsgmllbhfstqlldgy2dozddmjsdsmbwmi=/spousedetails'
  }, {
    rel: 'donordetails',
    type: 'elasticpath.donordetails.donor',
    uri: '/donordetails/profiles/crugive/gbrdemzygy2geljxg5rtoljugfsgmllbhfstqlldgy2dozddmjsdsmbwmi=',
    href: 'https://give-stage2.cru.org/cortex/donordetails/profiles/crugive/gbrdemzygy2geljxg5rtoljugfsgmllbhfstqlldgy2dozddmjsdsmbwmi='
  }, {
    rel: 'emails',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/emails/crugive',
    href: 'https://give-stage2.cru.org/cortex/emails/crugive'
  }, {
    rel: 'givingdashboard',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/giving/crugive',
    href: 'https://give-stage2.cru.org/cortex/giving/crugive'
  }, {
    rel: 'paymentmethods',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/paymentmethods/crugive',
    href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive'
  }, {
    rel: 'phonenumbers',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/phonenumbers/crugive',
    href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive'
  }, {
    rel: 'purchases',
    type: 'elasticpath.collections.links',
    uri: '/purchases/crugive',
    href: 'https://give-stage2.cru.org/cortex/purchases/crugive'
  }, {
    rel: 'selfservicepaymentmethods',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/selfservicepaymentmethods/crugive',
    href: 'https://give-stage2.cru.org/cortex/selfservicepaymentmethods/crugive'
  }, {
    rel: 'wishlists',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/wishlists/crugive',
    href: 'https://give-stage2.cru.org/cortex/wishlists/crugive'
  }],
  _givingdashboard: [{
    _managerecurringdonations: [{
      self: {
        type: 'elasticpath.donations.donations',
        uri: '/donations/recurring/crugive/active',
        href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/active'
      },
      links: [{
        rel: 'element',
        rev: 'list',
        type: 'elasticpath.donations.donation',
        uri: '/donations/recurring/crugive/gewuovswivbdi=',
        href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/gewuovswivbdi='
      }, {
        rel: 'selfservicepaymentmethods',
        uri: '/paymentmethods/crugive',
        href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive'
      }, {
        rel: 'search',
        uri: '/searches/crugive/keywords/form',
        href: 'https://give-stage2.cru.org/cortex/searches/crugive/keywords/form'
      }, {
        rel: 'suggestedrecipients',
        uri: '/donations/historical/crugive/recipient/suggested',
        href: 'https://give-stage2.cru.org/cortex/donations/historical/crugive/recipient/suggested'
      }, {
        rel: 'createrecurringgift',
        uri: '/donations/recurring/crugive/form',
        href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/form'
      }, {
        rel: 'givingdashboard',
        uri: '/giving/crugive',
        href: 'https://give-stage2.cru.org/cortex/giving/crugive'
      }],
      donations: [{
        'donation-lines': [{
          amount: 25,
          'designation-name': 'David and Margo Neibling (0105987)',
          'designation-number': '0105987',
          'donation-line-row-id': '1-GVVEB6',
          'donation-line-status': 'Standard',
          'payment-method-id': 'giydcnzyga=',
          'updated-donation-line-status': '',
          'updated-payment-method-id': '',
          'updated-rate': { recurrence: { interval: '' } },
          'updated-recurring-day-of-month': '',
          'updated-start-month': '',
          'updated-start-year': ''
        }],
        'donation-row-id': '1-GVVEB4',
        'donation-status': 'Active',
        'effective-status': 'Active',
        'next-draw-date': { 'display-value': '2016-01-15', value: 1452816000000 },
        rate: { recurrence: { interval: 'Monthly' } },
        'recurring-day-of-month': '15',
        'start-date': { 'display-value': '2015-09-29', value: 1443484800000 }
      }]
    }]
  }],
  'family-name': 'Hewitt',
  'given-name': 'Robert'
}
