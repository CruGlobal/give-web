// These CCP keys are used as backup keys if a network request for one fails.
// They should be updated annually (around mid-April) as CCP rotates encryption keys.
// Last updated 06/22/2017
const ccpKey = '-----BEGIN PUBLIC KEY-----' +
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnY7iTAnM/B1uFZ2AH0yj' +
  'pmwiBzzk7p6aFBfScpJ9ZMPwD3PjujTzobZpRm2pXF2XoaWqccZQyQ02TW6IfnFT' +
  '/+6/y/hmsMv2E3Lr7kILpJbHwAitFt2jNCXFYH25o0azq46Cy429tTHyVYDzrm27' +
  'pAvHwblPLTiS+/urMAOoBeq4Quk8P/9xP0Ia5z7hrL85sPxBRSIqzOtNmw2ce/V4' +
  'LsYri8058wDNaeLPSUamUtjI6g7CP1UcLFB69NM3ZeCauUTp1BTUuLykOfu9GTF3' +
  'UjMD24Ez0avvTzMHqPEBPXfslqulqSERQ7b1E6CwXonFwYMEEcek8CWYd7YJGQ8b' +
  'HQIDAQAB' +
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
