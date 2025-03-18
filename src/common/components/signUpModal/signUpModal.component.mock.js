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
    name: 'userProfile.firstName',
    required: true,
    label: 'First Name',
    type: 'text',
    value: ''
  },
  {
    name: 'userProfile.lastName',
    required: true,
    label: 'Last Name',
    type: 'text',
    value: ''
  },
  {
    name: 'userProfile.email',
    required: true,
    label: 'Email Address',
    type: 'email',
    value: ''
  },
  {
    name: 'credentials.passcode',
    required: true,
    label: 'Password',
    type: 'password',
    value: ''
  }
]
