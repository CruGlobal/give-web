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
  },
  countryCode: {
    name: "userProfile.countryCode",
    type: "select",
    label: "Country code",
    required: true,
    options: {},
    "label-top": true,
    multirowError: true,
    "data-se": "o-form-fieldset-userProfile.countryCode",
    wide: true
  },
  streetAddress: {
      name: "userProfile.streetAddress",
      type: "text",
      label: "Street address",
      required: true,
      "label-top": true,
      multirowError: true,
      "data-se": "o-form-fieldset-userProfile.streetAddress"
  },
  streetAddressExtended: {
    name: "userProfile.streetAddressExtended",
    type: "text",
    label: "Street address line 2",
    required: false,
    "label-top": true,
    multirowError: true,
    "data-se": "o-form-fieldset-userProfile.streetAddressExtended"
  },
  internationalAddressLine3: {
    name: "userProfile.internationalAddressLine3",
    type: "text",
    label: "Address line 3",
    required: false,
    "label-top": true,
    multirowError: true,
    "data-se": "o-form-fieldset-userProfile.internationalAddressLine3"
  },
  internationalAddressLine4: {
    name: "userProfile.internationalAddressLine4",
    type: "text",
    label: "Address line 4",
    required: false,
    "label-top": true,
    multirowError: true,
    "data-se": "o-form-fieldset-userProfile.internationalAddressLine4"
  },
  city: {
      name: "userProfile.city",
      type: "text",
      label: "City",
      required: true,
      "label-top": true,
      multirowError: true,
      "data-se": "o-form-fieldset-userProfile.city"
  },
  state: {
      name: "userProfile.state",
      type: "select",
      label: "State",
      required: true,
      options: {},
      'label-top': true,
      multirowError: true,
      "data-se": "o-form-fieldset-userProfile.state",
      wide: true,
  },
  zipCode: {
      name: "userProfile.zipCode",
      type: "text",
      label: "ZIP Code",
      required: true,
      'label-top': true,
      multirowError: true,
      "data-se": "o-form-fieldset-userProfile.zipCode"
  },
  primaryPhone: {
      name: "userProfile.primaryPhone",
      type: "text",
      label: "Primary phone",
      required: false,
      maxLength: 100,
      "label-top": true,
      multirowError: true,
      "data-se": "o-form-fieldset-userProfile.primaryPhone",
      sublabel: "Optional"
  }
}
