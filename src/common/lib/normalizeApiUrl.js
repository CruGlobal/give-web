// Normalizes an API URL into a protocol-relative URL without trailing slashes,
// e.g. 'https://give.domain.com/' or 'give.domain.com' -> '//give.domain.com'
export default function normalizeApiUrl(url) {
  if (!url) {
    return url;
  }

  // Remove trailing slashes
  url = url.replace(/\/+$/, '');

  // Remove protocol if present
  url = url.replace(/^https?:/, '');

  // Remove slash before query parameters if present
  url = url.replace(/\/\?/, '?');

  return url.startsWith('//') ? url : '//' + url;
}
