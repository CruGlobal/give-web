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
interface StructuredErrorDataWrapper {
  data: StructuredErrorData,
  'debug-message': string,
  id: string,
  type: string
}
interface StructuredErrorData {
  'field-name': string,
  'invalid-value': string,
  max: number | undefined,
  min: number | undefined,
}

interface StructuredError {
  links: Object[],
  messages: StructuredErrorDataWrapper[]
}

export function getErrorMessage (error: any) {
  if (error && error.data && error.data.messages && error.data.messages[0] && error.data.messages[0].data) {
    const structuredError = error.data as StructuredError
    let errorMessage = ''
    structuredError.messages.map((structuredDataWrapper, index) => {
      if (index > 0) {
        errorMessage += '<br />'
      }
      errorMessage += structuredDataWrapper['debug-message']
    })
    return errorMessage
  }
}
