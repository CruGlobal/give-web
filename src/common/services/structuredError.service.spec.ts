import * as structuredErrorService from './structuredError.service';

describe('structuredErrorService', () => {
  describe('getErrorMessage', () => {
    it('should handle a single error message properly', () => {
      const expectedMessage =
        'RECIPIENT_COMMENTS Value is too long. Max value is 250 characters.';
      const error = {
        config: {},
        data: {
          messages: [
            {
              data: {
                'field-name': 'RECIPIENT_COMMENTS',
                'invalid-value': 'Some wrong value',
                max: 250,
                min: 0,
              },
              'debug-message': expectedMessage,
              id: 'field.invalid.length',
              type: 'error',
            },
          ],
        },
      };

      expect(structuredErrorService.getErrorMessage(error)).toEqual(
        expectedMessage,
      );
    });

    it('should handle a single error message properly', () => {
      const recipientCommentsMessage =
        'RECIPIENT_COMMENTS Value is too long. Max value is 250 characters.';
      const amountMessage = 'AMOUNT Value must be a valid decimal.';
      const expectedMessage = `${recipientCommentsMessage}<br />${amountMessage}`;
      const error = {
        config: {},
        data: {
          messages: [
            {
              data: {
                'field-name': 'RECIPIENT_COMMENTS',
                'invalid-value': 'Some wrong value',
                max: 250,
                min: 0,
              },
              'debug-message': recipientCommentsMessage,
              id: 'field.invalid.length',
              type: 'error',
            },
            {
              data: {
                'field-name': 'AMOUNT',
                'invalid-value': '$1.1.1',
              },
              'debug-message': amountMessage,
              id: 'field.invalid.decimal',
              type: 'error',
            },
          ],
        },
      };

      expect(structuredErrorService.getErrorMessage(error)).toEqual(
        expectedMessage,
      );
    });

    it('should handle a non-structured error message', () => {
      const error = {
        data: 'Some error message',
      };
      expect(structuredErrorService.getErrorMessage(error)).not.toBeDefined();
    });
  });

  describe('getErrors', () => {
    const needinfo = {
      data: {},
      'debug-message': 'Need more info',
      id: 'need.email',
      type: 'needinfo',
    };
    const promotion = {
      data: {},
      'debug-message': 'A promotion was applied',
      id: 'promotion.applied',
      type: 'promotion',
    };
    const commentsError = {
      data: { 'field-name': 'RECIPIENT_COMMENTS' },
      'debug-message':
        'RECIPIENT_COMMENTS Value is too long. Max value is 250 characters.',
      id: 'field.invalid.length',
      type: 'error',
    };
    const amountError = {
      data: { 'field-name': 'AMOUNT' },
      'debug-message': 'AMOUNT Value must be a valid decimal.',
      id: 'field.invalid.decimal',
      type: 'error',
    };

    it('should return every error in the order the API sent them', () => {
      const error = { data: { messages: [commentsError, amountError] } };

      expect(structuredErrorService.getErrors(error)).toEqual([
        {
          id: 'field.invalid.length',
          message:
            'RECIPIENT_COMMENTS Value is too long. Max value is 250 characters.',
          fieldName: 'RECIPIENT_COMMENTS',
        },
        {
          id: 'field.invalid.decimal',
          message: 'AMOUNT Value must be a valid decimal.',
          fieldName: 'AMOUNT',
        },
      ]);
    });

    it('should leave the field name undefined when the data map is empty', () => {
      const error = {
        data: {
          messages: [
            {
              data: {},
              'debug-message': 'Missing bank account fields',
              id: 'selfservicepaymentinstruments.validation.failure',
              type: 'error',
            },
          ],
        },
      };

      expect(structuredErrorService.getErrors(error)).toEqual([
        {
          id: 'selfservicepaymentinstruments.validation.failure',
          message: 'Missing bank account fields',
          fieldName: undefined,
        },
      ]);
    });

    it('should treat a message carrying no type as an error', () => {
      const error = {
        data: {
          messages: [
            {
              data: { 'field-name': 'AMOUNT' },
              id: 'field.invalid.decimal.format',
              'debug-message':
                'Amount must be a valid decimal number without dollar signs or commas.',
            },
          ],
        },
      };

      expect(structuredErrorService.getErrors(error)).toEqual([
        {
          id: 'field.invalid.decimal.format',
          message:
            'Amount must be a valid decimal number without dollar signs or commas.',
          fieldName: 'AMOUNT',
        },
      ]);
    });

    it('should drop non-error messages wherever they sit', () => {
      const error = {
        data: { messages: [needinfo, commentsError, promotion, amountError] },
      };

      expect(
        structuredErrorService.getErrors(error).map((message) => message.id),
      ).toEqual(['field.invalid.length', 'field.invalid.decimal']);
    });

    it('should be empty when the body carries no errors', () => {
      expect(
        structuredErrorService.getErrors({
          data: { messages: [needinfo, promotion] },
        }),
      ).toEqual([]);
      expect(
        structuredErrorService.getErrors({ data: 'Some error message' }),
      ).toEqual([]);
      expect(structuredErrorService.getErrors({ data: {} })).toEqual([]);
      expect(
        structuredErrorService.getErrors({
          data: { messages: 'not an array' },
        }),
      ).toEqual([]);
      expect(structuredErrorService.getErrors(null)).toEqual([]);
    });
  });

  describe('findError', () => {
    const error = {
      data: {
        messages: [
          {
            data: {},
            'debug-message': 'Need more info',
            id: 'need.email',
            type: 'needinfo',
          },
          {
            data: { 'field-name': 'RECIPIENT_COMMENTS' },
            'debug-message':
              'RECIPIENT_COMMENTS Value is too long. Max value is 250 characters.',
            id: 'field.invalid.length',
            type: 'error',
          },
          {
            data: { 'field-name': 'name.given-name' },
            'debug-message': "can't change field from 'Ep' to 'xxxxxx'",
            id: 'donordetails.field.change-disallowed',
            type: 'error',
          },
        ],
      },
    };

    it('should find an error by id wherever it sits in the body', () => {
      expect(
        structuredErrorService.findError(
          error,
          'donordetails.field.change-disallowed',
        ),
      ).toEqual({
        id: 'donordetails.field.change-disallowed',
        message: "can't change field from 'Ep' to 'xxxxxx'",
        fieldName: 'name.given-name',
      });
    });

    it('should not be defined when no error carries the id', () => {
      expect(
        structuredErrorService.findError(error, 'donordetails.name.required'),
      ).not.toBeDefined();
    });

    it('should not match a non-error message that carries the id', () => {
      expect(
        structuredErrorService.findError(error, 'need.email'),
      ).not.toBeDefined();
    });
  });

  describe('getErrorMessage with mixed messages', () => {
    it('should join only the errors', () => {
      const error = {
        data: {
          messages: [
            {
              data: {},
              'debug-message': 'Need more info',
              id: 'need.email',
              type: 'needinfo',
            },
            {
              data: { 'field-name': 'AMOUNT' },
              'debug-message': 'AMOUNT Value must be a valid decimal.',
              id: 'field.invalid.decimal',
              type: 'error',
            },
          ],
        },
      };

      expect(structuredErrorService.getErrorMessage(error)).toEqual(
        'AMOUNT Value must be a valid decimal.',
      );
    });

    it('should not be defined when every message is a non-error', () => {
      const error = {
        data: {
          messages: [
            {
              data: {},
              'debug-message': 'Need more info',
              id: 'need.email',
              type: 'needinfo',
            },
          ],
        },
      };

      expect(structuredErrorService.getErrorMessage(error)).not.toBeDefined();
    });
  });
});
