export const user = {
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  accountType: 'Household',
  streetAddress: 'streetAddress',
  extendedAddress: 'streetAddressExtended',
  city: 'city',
  state: 'state',
  zipCode: '11111',
  countryCode: 'US',
  organizationName: 'organizationName'
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
  }
]
