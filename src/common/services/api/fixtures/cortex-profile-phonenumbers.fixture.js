export default {
  self: {
    type: 'elasticpath.collections.links',
    uri: '/phonenumbers/crugive?zoom=element,spouse',
    href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive?zoom=element,spouse',
  },
  links: [
    {
      rel: 'profile',
      rev: 'phonenumbers',
      type: 'elasticpath.profiles.profile',
      uri: '/profiles/crugive/mu2wgyrrgntgmljqheztiljugq2tallcha3gkllemi2deyzvhbrtomzzmu=',
      href: 'https://give-stage2.cru.org/cortex/profiles/crugive/mu2wgyrrgntgmljqheztiljugq2tallcha3gkllemi2deyzvhbrtomzzmu=',
    },
    {
      rel: 'phonenumberform',
      type: 'elasticpath.phonenumbers.phone-number',
      uri: '/phonenumbers/crugive/form',
      href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive/form',
    },
    {
      rel: 'spousephonenumberform',
      type: 'elasticpath.phonenumbers.phone-number',
      uri: '/phonenumbers/crugive/spouse/form',
      href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive/spouse/form',
    },
    {
      rel: 'element',
      rev: 'list',
      type: 'elasticpath.phonenumbers.phone-number',
      uri: '/phonenumbers/crugive/gewuwmktgjivi=',
      href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive/gewuwmktgjivi=',
    },
    {
      rel: 'spouse',
      rev: 'list',
      type: 'elasticpath.phonenumbers.phone-number',
      uri: '/phonenumbers/crugive/gewuwmktgjjfq=',
      href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive/gewuwmktgjjfq=',
    },
  ],
  _element: [
    {
      self: {
        type: 'elasticpath.phonenumbers.phone-number',
        uri: '/phonenumbers/crugive/gewuwmktgjivi=',
        href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive/gewuwmktgjivi=',
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
      'phone-number': '(343) 454-3344',
      'phone-number-type': 'Mobile',
      primary: false,
    },
  ],
  _spouse: [
    {
      self: {
        type: 'elasticpath.phonenumbers.phone-number',
        uri: '/phonenumbers/crugive/gewuwmktgjjfq=',
        href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive/gewuwmktgjjfq=',
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
      'phone-number': '(565) 777-5656',
      'phone-number-type': 'Mobile',
      primary: false,
    },
  ],
};
