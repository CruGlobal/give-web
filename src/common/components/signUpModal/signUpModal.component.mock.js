export const user = {
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  accountType: 'accountType',
  streetAddress: 'streetAddress',
  city: 'city',
  state: 'state',
  zipCode: 'zipCode',
  countryCode: 'countryCode',
  primaryPhone: 'primaryPhone',
  organizationName: 'organizationName'
}

export const accountTypeFieldSchema = {
  name: 'accountType',
  type: 'select',
  options: {
    Household: 'Household',
    Organization: 'Organization'
  },
  'label-top': true,
  label: 'Account Type',
  required: true,
  wide: true,
  value: 'Household'
}

export const organizationNameFieldSchema = {
  name: 'organizationName',
  type: 'text',
  'label-top': true,
  label: 'Organization Name',
  required: true,
  maxLength: 50,
  value: ''
}

export const schema = [
  {
    name: 'given-name',
    required: true,
    label: 'First Name',
    type: 'text',
    value: ''
  },
  {
    name: 'family-name',
    required: true,
    label: 'Last Name',
    type: 'text',
    value: ''
  },
  {
    name: 'email',
    required: true,
    label: 'Email Address',
    type: 'email',
    value: ''
  },
  {
    name: 'street-address',
    required: true,
    label: 'Street Address',
    type: 'text',
    value: ''
  },
  {
    name: 'city',
    required: true,
    label: 'City',
    type: 'text',
    value: ''
  },
  {
    name: 'state',
    required: true,
    label: 'State',
    type: 'text',
    value: ''
  },
  {
    name: 'zip-code',
    required: true,
    label: 'Zip Code',
    type: 'text',
    value: ''
  },
  {
    name: 'country-code',
    required: true,
    label: 'Country Code',
    type: 'select',
    options: {
      US: 'United States'
    },
    value: ''
  },
  {
    name: 'phone-number',
    required: false,
    label: 'Primary phone',
    type: 'text',
    value: ''
  },
  {
    name: 'password',
    required: true,
    label: 'Password',
    type: 'password'
  }
]
