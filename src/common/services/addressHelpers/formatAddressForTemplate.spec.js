import formatAddressForTemplate from './formatAddressForTemplate';

describe('formatAddressForTemplate', () => {
  it('should take a US address object and convert it to camel case', () => {
    expect(
      formatAddressForTemplate({
        'country-name': 'US',
        'street-address': '123 First St',
        'extended-address': 'Apt 123',
        locality: 'Sacramento',
        'postal-code': '12345',
        region: 'CA',
      }),
    ).toEqual({
      country: 'US',
      streetAddress: '123 First St',
      extendedAddress: 'Apt 123',
      locality: 'Sacramento',
      postalCode: '12345',
      region: 'CA',
    });
  });

  it('should take an international address object, convert it to camel case and split the street-address into its individual address lines', () => {
    expect(
      formatAddressForTemplate({
        'country-name': 'CA',
        'street-address': '123 First St||Apt 123||Line 3||Line 4',
        'extended-address': '',
        locality: '',
        'postal-code': '',
        region: '',
      }),
    ).toEqual({
      country: 'CA',
      streetAddress: '123 First St',
      extendedAddress: 'Apt 123',
      intAddressLine3: 'Line 3',
      intAddressLine4: 'Line 4',
    });
  });
});
