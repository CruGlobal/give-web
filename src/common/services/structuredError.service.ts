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
 * Returns the text to show for a failure, whichever shape the body arrived in: the first structured
 * error's message, or the body itself when it is not structured.
 *
 * For a caller that matched on plain-text bodies and needs to keep matching without knowing which
 * backend answered. Nothing is filtered on status, so a caller sees exactly what it saw before for
 * every body that is not structured.
 */
export function getErrorText(error: any): any {
  const firstError = getErrors(error)[0];
  return firstError ? firstError.message : error && error.data;
}
