export const user = {
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  accountType: 'Household',
  streetAddress: 'streetAddress',
  streetAddressExtended: 'streetAddressExtended',
  city: 'city',
  state: 'state',
  zipCode: '11111',
  countryCode: 'US',
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
]
