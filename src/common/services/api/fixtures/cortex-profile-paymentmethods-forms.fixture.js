export default {
  self: {
    type: 'elasticpath.profiles.profile',
    uri: '/profiles/crugive/gnrdkojsge4dsljxhazwmljugmztillcgu3gkljqgm3tkytdmm3dmzrxme=?zoom=selfservicepaymentinstruments:createbankaccountform,selfservicepaymentinstruments:createcreditcardform',
    href: 'https://give-stage2.cru.org/cortex/profiles/crugive/gnrdkojsge4dsljxhazwmljugmztillcgu3gkljqgm3tkytdmm3dmzrxme=?zoom=selfservicepaymentinstruments:createbankaccountform,selfservicepaymentinstruments:createcreditcardform'
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
    uri: '/donordetails/profiles/crugive/gnrdkojsge4dsljxhazwmljugmztillcgu3gkljqgm3tkytdmm3dmzrxme=/spousedetails',
    href: 'https://give-stage2.cru.org/cortex/donordetails/profiles/crugive/gnrdkojsge4dsljxhazwmljugmztillcgu3gkljqgm3tkytdmm3dmzrxme=/spousedetails'
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
    rel: 'selfservicepaymentinstruments',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/selfservicepaymentinstruments/crugive',
    href: 'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/crugive'
  }, {
    rel: 'wishlists',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/wishlists/crugive',
    href: 'https://give-stage2.cru.org/cortex/wishlists/crugive'
  }],
  _selfservicepaymentinstruments: [{
    _createbankaccountform: [{
      self: {
        type: 'elasticpath.bankaccounts.bank-account',
        uri: '/bankaccounts/selfservicepaymentinstruments/crugive/form',
        href: 'https://give-stage2.cru.org/cortex/bankaccounts/selfservicepaymentinstruments/crugive/form'
      },
      links: [{
        rel: 'createbankaccountaction',
        uri: '/bankaccounts/selfservicepaymentinstruments/crugive',
        href: 'https://give-stage2.cru.org/cortex/bankaccounts/selfservicepaymentinstruments/crugive'
      }, {
        rel: 'selfservicepaymentinstruments',
        uri: '/selfservicepaymentinstruments/crugive',
        href: 'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/crugive'
      }],
      'account-type': '',
      'bank-name': '',
      'encrypted-account-number': '',
      'routing-number': ''
    }],
    _createcreditcardform: [{
      self: {
        type: 'cru.creditcards.named-credit-card',
        uri: '/creditcards/selfservicepaymentinstruments/crugive/form',
        href: 'https://give-stage2.cru.org/cortex/creditcards/selfservicepaymentinstruments/crugive/form'
      },
      links: [{
        rel: 'createcreditcardaction',
        uri: '/creditcards/selfservicepaymentinstruments/crugive',
        href: 'https://give-stage2.cru.org/cortex/creditcards/selfservicepaymentinstruments/crugive'
      }, {
        rel: 'selfservicepaymentinstruments',
        uri: '/selfservicepaymentinstruments/crugive',
        href: 'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/crugive'
      }],
      address: {
        'country-name': '',
        'extended-address': '',
        locality: '',
        'postal-code': '',
        region: '',
        'street-address': ''
      },
      'card-number': '',
      'cardholder-name': '',
      'expiry-month': '',
      'expiry-year': ''
    }]
  }],
  'family-name': 'Lname',
  'given-name': 'Fname'
}
