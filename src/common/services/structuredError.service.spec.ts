import * as structuredErrorService from './structuredError.service'

describe('structuredErrorService', () => {
  describe('getErrorMessage', () => {
    it('should handle a single error message properly', () => {
      const expectedMessage = 'RECIPIENT_COMMENTS Value is too long. Max value is 250 characters.'
      const error = {
        config: {},
        data: {
          messages: [
            {
              data: {
                'field-name': 'RECIPIENT_COMMENTS',
                'invalid-value': 'Some wrong value',
                max: 250,
                min: 0
              },
              'debug-message': expectedMessage,
              id: 'field.invalid.length',
              type: 'error'
            }
          ]
        }
      }

      expect(structuredErrorService.getErrorMessage(error)).toEqual(expectedMessage)
    })

    it('should handle a single error message properly', () => {
      const recipientCommentsMessage = 'RECIPIENT_COMMENTS Value is too long. Max value is 250 characters.'
      const amountMessage = 'AMOUNT Value must be a valid decimal.'
      const expectedMessage = `${recipientCommentsMessage}<br />${amountMessage}`
      const error = {
        config: {},
        data: {
          messages: [
            {
              data: {
                'field-name': 'RECIPIENT_COMMENTS',
                'invalid-value': 'Some wrong value',
                max: 250,
                min: 0
              },
              'debug-message': recipientCommentsMessage,
              id: 'field.invalid.length',
              type: 'error'
            },
            {
              data: {
                'field-name': 'AMOUNT',
                'invalid-value': '$1.1.1'
              },
              'debug-message': amountMessage,
              id: 'field.invalid.decimal',
              type: 'error'
            }
          ]
        }
      }

      expect(structuredErrorService.getErrorMessage(error)).toEqual(expectedMessage)
    })

    it('should handle a non-structured error message', () => {
      const error = {
        data: 'Some error message'
      }
      expect(structuredErrorService.getErrorMessage(error)).not.toBeDefined()
    })
  })
})
