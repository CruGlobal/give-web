export const customFields = {
  accountType: {
    name: 'accountType',
    type: 'select',
    options: {
      Household: 'Give as an Individual',
      Organization: 'Give as an Organization'
    },
    'label-top': true,
    label: 'Account Type',
    required: true,
    wide: true,
    value: 'Household'
  },
  organizationName: {
    name: 'organizationName',
    type: 'text',
    'label-top': true,
    label: 'Organization Name',
    required: true,
    maxLength: 50,
    showWhen: {
      accountType: 'Organization'
    }
  },
  countryCode: {
    inputId: 'countryCodeInput',
    name: 'userProfile.countryCode',
    type: 'select',
    label: 'Country code',
    required: true,
    options: {},
    'label-top': true,
    multirowError: true,
    'data-se': 'o-form-fieldset-userProfile.countryCode',
    wide: true
  },
  streetAddress: {
    name: 'userProfile.streetAddress',
    type: 'text',
    label: 'Street address',
    required: true,
    'label-top': true,
    multirowError: true,
    'data-se': 'o-form-fieldset-userProfile.streetAddress',
    maxLength: 200
  },
  streetAddressExtended: {
    name: 'userProfile.streetAddressExtended',
    type: 'text',
    label: 'Street address line 2',
    required: false,
    'label-top': true,
    multirowError: true,
    'data-se': 'o-form-fieldset-userProfile.streetAddressExtended',
    maxLength: 100
  },
  internationalAddressLine3: {
    name: 'userProfile.internationalAddressLine3',
    type: 'text',
    label: 'Address line 3',
    required: false,
    'label-top': true,
    multirowError: true,
    'data-se': 'o-form-fieldset-userProfile.internationalAddressLine3',
    maxLength: 100,
    showWhen: {
      'userProfile.countryCode': function (value) {
        return value !== 'US'
      }
    }
  },
  internationalAddressLine4: {
    name: 'userProfile.internationalAddressLine4',
    type: 'text',
    label: 'Address line 4',
    required: false,
    'label-top': true,
    multirowError: true,
    'data-se': 'o-form-fieldset-userProfile.internationalAddressLine4',
    maxLength: 100,
    showWhen: {
      'userProfile.countryCode': function (value) {
        return value !== 'US'
      }
    }
  },
  city: {
    name: 'userProfile.city',
    type: 'text',
    label: 'City',
    required: true,
    'label-top': true,
    multirowError: true,
    'data-se': 'o-form-fieldset-userProfile.city',
    maxLength: 50,
    showWhen: {
      'userProfile.countryCode': 'US'
    }
  },
  state: {
    name: 'userProfile.state',
    type: 'select',
    label: 'State',
    required: true,
    options: {},
    'label-top': true,
    multirowError: true,
    'data-se': 'o-form-fieldset-userProfile.state',
    wide: true,
    showWhen: {
      'userProfile.countryCode': 'US'
    }
  },
  zipCode: {
    name: 'userProfile.zipCode',
    type: 'text',
    label: 'ZIP Code',
    required: true,
    'label-top': true,
    multirowError: true,
    'data-se': 'o-form-fieldset-userProfile.zipCode',
    showWhen: {
      'userProfile.countryCode': 'US'
    }
  },
  primaryPhone: {
    name: 'userProfile.primaryPhone',
    type: 'text',
    label: 'Primary phone',
    required: false,
    maxLength: 100,
    'label-top': true,
    multirowError: true,
    'data-se': 'o-form-fieldset-userProfile.primaryPhone',
    sublabel: 'Optional'
  }
}
