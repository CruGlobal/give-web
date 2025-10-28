function flattenObject(obj) {
  const flattened = {};

  Object.keys(obj).forEach((key) => {
    if (key === 'payment-instrument-identification-attributes') {
      Object.assign(flattened, flattenObject(obj[key]));
    } else {
      flattened[key] = obj[key];
    }
  });

  return flattened;
}

export default flattenObject;
