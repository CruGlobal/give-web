function formatAddressForCortex(address) {
  const isUsAddress = address.country === 'US' || ''; // Becomes true or empty string
  const internationalAddressLines = [
    address.streetAddress,
    address.extendedAddress,
    address.intAddressLine3,
    address.intAddressLine4,
  ];
  return {
    'country-name': address.country,
    'street-address': isUsAddress
      ? address.streetAddress
      : internationalAddressLines.join('||'),
    'extended-address': isUsAddress && address.extendedAddress,
    locality: isUsAddress && address.locality,
    'postal-code': isUsAddress && address.postalCode,
    region: isUsAddress && address.region,
  };
}

export default formatAddressForCortex;
