import * as structuredErrorService from './structuredError.service';

describe('structuredErrorService', () => {
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
});
