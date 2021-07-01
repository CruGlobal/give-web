// These CCP keys are used as backup keys if a network request for one fails.
// They should be updated annually (around mid-April) as CCP rotates encryption keys.
// Last updated 07/01/2021
const ccpKey = '-----BEGIN PUBLIC KEY-----' +
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvmjduk8T8riKsMGoX3Hm' +
  'eQxCtUcRYqAUlsr5sVVu8ZFWAZC-JPbaNIGrzngZZin6J6E4DByk_rjKU9yKnSAo' +
  'qJrl3ad7aYyCEQOoa3zi7JOFxA9s4hFs4w8UFkGS35aOEZ0m3l7tA7CV0lCeZ8IQ' +
  '_Niltz72ulfW6RdTrCkL30zmx2f_UdaSwtgnHVi-YkV4VZUGu42jLFYGVjQsXRNq' +
  'KRv92Y1vZ7FXlyTra5sije4ywxHmPntEKPEoKQbcdPmO8bUR9NwM_pvyx1SDysye' +
  '4vS1vJn6VV80tudOegMT3jeQqY8xOLSZcr9Vx5lK0UDY1cAKGyA14TLgXB0qtdC7' +
  'LQIDAQAB' +
  '-----END PUBLIC KEY-----'

const ccpStagingKey = '-----BEGIN PUBLIC KEY-----' +
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1wOCSLbKrlAJKa21iWZa' +
  '4KwkEbTW1DIJLZ7kULHqOq//0TOUjIfW6DX4dULSND25uWi2hHQA2+q8uuaYCVfC' +
  'h2IvOUygOwJyNRTwpQtlIKgq1C7xnsnO4COA8hmnkr2aAxTX1aynGWw/3gvsx2y/' +
  'pML4UM+LeiHdrVv7zSaW92MZd+bhf4Lu3CA2doyY6uobq/+P087dLqBXS61OZSAR' +
  'xMCKF2BquwQfEq8GyblHpjWI2SXWmB276NdKrCp/ZKH3vFoBSlLoPdVT4Qbd4sKi' +
  'PNnKvxIBooLPQLBOO0QGv6AIgyL4Jss+dAvn5O6lckwip9QRMfINNBX3Clhq53xE' +
  'FwIDAQAB' +
  '-----END PUBLIC KEY-----'

const cortexScope = 'crugive'

const mobileBreakpoint = 575

// Generic phone number regex, matches + and 011 prefixes.
// See https://stackoverflow.com/a/19592342/2860048
const phoneNumberRegex = /([0-9\s-]{7,})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/

// See envServiceProvider.config in common/app.config.js for url configurations

export {
  ccpKey,
  ccpStagingKey,
  cortexScope,
  mobileBreakpoint,
  phoneNumberRegex
}
