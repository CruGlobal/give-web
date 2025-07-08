import formatAddressForCortex from './formatAddressForCortex';

describe('formatAddressForCortex', () => {
  it('should take a US address and convert it to kebab case', () => {
    expect(
      formatAddressForCortex({
        country: 'US',
        streetAddress: '123 First St',
        extendedAddress: 'Apt 123',
        locality: 'Sacramento',
        postalCode: '12345',
        region: 'CA',
        intAddressLine3: 'Old Line 3', // Making sure these fields don't appear in the output
        intAddressLine4: 'Old Line 4',
      }),
    ).toEqual({
      'country-name': 'US',
      'street-address': '123 First St',
      'extended-address': 'Apt 123',
      locality: 'Sacramento',
      'postal-code': '12345',
      region: 'CA',
    });
  });

  it('should take an international address, convert it to kebab case, and merge all address lines into street-address', () => {
    expect(
      formatAddressForCortex({
        country: 'CA',
        streetAddress: '123 First St',
        extendedAddress: 'Apt 123',
        intAddressLine3: 'Line 3',
        intAddressLine4: 'Line 4',
        locality: 'Old Locality', // Making sure these fields don't appear in the output
        postalCode: 'Old Postal Code',
        region: 'Old Region',
      }),
    ).toEqual({
      'country-name': 'CA',
      'street-address': '123 First St||Apt 123||Line 3||Line 4',
      'extended-address': '',
      locality: '',
      'postal-code': '',
      region: '',
    });
  });
});
