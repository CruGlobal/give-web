import isString from 'lodash/isString';

/**
 * Extracts a user-presentable message from a client (4xx) error response.
 *
 * Backends send the descriptive reason for a 4xx either as a raw string body
 * or as an object with a `message` property on `error.data`. Server (5xx) and
 * non-HTTP errors return null so callers can fall back to a generic, translated
 * message rather than surfacing internal details.
 *
 * @param {object} error - the rejected HTTP error (expects `status` and `data`)
 * @returns {string|null} a trimmed message to display, or null
 */
export default function getClientErrorMessage(error) {
  if (!error || !(error.status >= 400 && error.status < 500)) {
    return null;
  }
  const data = error.data;
  if (isString(data) && data.trim()) {
    return data;
  }
  if (data && isString(data.message) && data.message.trim()) {
    return data.message;
  }
  return null;
}
