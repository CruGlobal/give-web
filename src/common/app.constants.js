// These CCP keys are used as backup keys if a network request for one fails.
// They should be updated annually (around mid-April) as CCP rotates encryption keys.
// Last updated 07/01/2021
const ccpKey =
  '-----BEGIN PUBLIC KEY-----' +
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvmjduk8T8riKsMGoX3Hm' +
  'eQxCtUcRYqAUlsr5sVVu8ZFWAZC-JPbaNIGrzngZZin6J6E4DByk_rjKU9yKnSAo' +
  'qJrl3ad7aYyCEQOoa3zi7JOFxA9s4hFs4w8UFkGS35aOEZ0m3l7tA7CV0lCeZ8IQ' +
  '_Niltz72ulfW6RdTrCkL30zmx2f_UdaSwtgnHVi-YkV4VZUGu42jLFYGVjQsXRNq' +
  'KRv92Y1vZ7FXlyTra5sije4ywxHmPntEKPEoKQbcdPmO8bUR9NwM_pvyx1SDysye' +
  '4vS1vJn6VV80tudOegMT3jeQqY8xOLSZcr9Vx5lK0UDY1cAKGyA14TLgXB0qtdC7' +
  'LQIDAQAB' +
  '-----END PUBLIC KEY-----';

const ccpStagingKey =
  '-----BEGIN PUBLIC KEY-----' +
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn7LClo93AYVUhsWlPyo1' +
  'hT5xWKDtH8yjjPUyMRGanZQS2ZMypqDbzDD4a1fwK6YaA1OXeURaJs2Z9xUZW5Fr' +
  'DxQSlJkocASRnUNvlSao4RGbZJmzdjPWBwKYGUno0BeCEVmABwe4dvmpyY-SNL1P' +
  'mDB07t9X-XBj-a07Libf3RYB-1TDqdtmqPn93ERn1BoweZQXBBAIDlnI_s6ug5IK' +
  'z7Ye8G7B_sKQ5w9kbLR8RaTRACm3i00TnCIWAKUmr9LxQSsXxXnYhIjrjEZ314-O' +
  'y8obUvshcr8TckfhXtrisla1jorLCHA7h1CoPf8B52CGkihQVSTxFTvUde5IZhOJ' +
  '_QIDAQAB' +
  '-----END PUBLIC KEY-----';

const cortexScope = 'crugive';

const mobileBreakpoint = 575;

// Generic phone number regex, matches + and 011 prefixes.
// See https://stackoverflow.com/a/19592342/2860048
const phoneNumberRegex =
  /([0-9\s-]{7,})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;

// See envServiceProvider.config in common/app.config.js for url configurations

export {
  ccpKey,
  ccpStagingKey,
  cortexScope,
  mobileBreakpoint,
  phoneNumberRegex,
};
