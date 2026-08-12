// Structure of a structured error message from the API:
// {
//   config: {…},
//   data: {
//     links: [],
//     messages: [
//       {
//         data: {
//           "field-name": "FIELD_NAME",
//           "invalid-value": "value goes here",
//           max: "100",
//           min: "0"
//         }
//         "debug-message": "'FIELD_NAME' specific message.",
//         id: "field.invalid.example",
//         type: "error"
//       }
//     ]
//   }
// }

/**
 * One structured message, reduced to the parts a caller renders or matches on. `fieldName` is
 * absent whenever the message carries an empty data map, which is what the API sends for failures
 * that are not attributable to a single field.
 */
interface StructuredErrorMessage {
  id: string;
  message: string;
  fieldName: string | undefined;
}

/**
 * Message types the API sends that are not failures. A `messages` array can mix these with errors —
 * `needinfo` in particular travels on cart and order representations.
 */
const NON_ERROR_TYPES = ['warning', 'information', 'promotion', 'needinfo'];

/**
 * A message counts as an error unless it declares one of the non-error types. Absence of `type` is
 * read as an error rather than skipped: not every body carries the field, and a missing type must
 * not cost the caller a message it would otherwise have shown.
 */
function isError(message: any): boolean {
  return !!message && NON_ERROR_TYPES.indexOf(message.type) === -1;
}

function toStructuredErrorMessage(message: any): StructuredErrorMessage {
  return {
    id: message.id,
    message: message['debug-message'],
    fieldName: message.data ? message.data['field-name'] : undefined,
  };
}

/**
 * Returns every error in a structured API error body, in the order the API sent them, or an empty array when
 * the body is not a structured one — a plain-text body, an unparseable body, or no body at all.
 *
 * Non-error messages are dropped.
 */
export function getErrors(error: any): StructuredErrorMessage[] {
  const messages = error && error.data && error.data.messages;
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages.filter(isError).map(toStructuredErrorMessage);
}

/**
 * Returns the error carrying the given id, or undefined when there is none.
 *
 * Ids are the durable half of the contract: `debug-message` text is kept byte-identical to the
 * wording earlier backends sent as plain text, so it stays matchable across a backend transition, but
 * ids are stable per failure kind and are what long-term matching should key on.
 */
export function findError(
  error: any,
  id: string,
): StructuredErrorMessage | undefined {
  return getErrors(error).filter((message) => message.id === id)[0];
}

/**
 * Returns every error in the body as one string, separated by line breaks for rendering into a single
 * element. Undefined when the body carries no errors, so callers can fall through to their own
 * generic message.
 *
 * The separator is markup: it reaches the page through the `translate` directive, which appends
 * its value as innerHTML. Callers rendering this into an element that escapes markup will show the
 * separator as literal text.
 */
export function getErrorMessage(error: any): string | undefined {
  const errors = getErrors(error);
  if (!errors.length) {
    return undefined;
  }

  return errors.map((message) => message.message).join('<br />');
}
