/**
 * Extracts the user-presentable message the server sends for a client (4xx)
 * error response.
 *
 * Backends send the descriptive reason for a 4xx as a raw string body on
 * `error.data`. Server (5xx) and non-HTTP errors return null so callers can
 * fall back to a generic, translated message rather than surfacing internal
 * details.
 *
 * @param {object} error - the rejected HTTP error (expects `status` and `data`)
 * @returns {string|null} a trimmed message to display, or null
 */
export default function getServerErrorMessage(error) {
  if (!error || !(error.status >= 400 && error.status < 500)) {
    return null;
  }
  const data = error.data;
  if (typeof data === 'string' && data.trim()) {
    return data;
  }
  return null;
}
