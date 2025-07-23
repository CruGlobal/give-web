function formatAddressForTemplate(address) {
  const output = {
    country: address['country-name'],
  };
  if (output.country === 'US') {
    output.streetAddress = address['street-address'];
    output.extendedAddress = address['extended-address'];
    output.locality = address.locality;
    output.region = address.region;
    output.postalCode = address['postal-code'];
  } else if (address['street-address']) {
    const intAddress = address['street-address'].split('||');
    output.streetAddress = intAddress[0];
    output.extendedAddress = intAddress[1];
    output.intAddressLine3 = intAddress[2];
    output.intAddressLine4 = intAddress[3];
  }
  return output;
}

export default formatAddressForTemplate;
