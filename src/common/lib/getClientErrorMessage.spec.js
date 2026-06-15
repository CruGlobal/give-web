import getClientErrorMessage from './getClientErrorMessage';

describe('getClientErrorMessage', () => {
  it('returns the string body for a 4xx error', () => {
    expect(
      getClientErrorMessage({ status: 400, data: 'Invalid phone number' }),
    ).toBe('Invalid phone number');
  });

  it('returns data.message for a 4xx object payload', () => {
    expect(
      getClientErrorMessage({ status: 422, data: { message: 'Bad value' } }),
    ).toBe('Bad value');
  });

  it('returns null for a 5xx error', () => {
    expect(getClientErrorMessage({ status: 500, data: 'boom' })).toBeNull();
  });

  it('returns null when there is no status', () => {
    expect(getClientErrorMessage({ data: 'some error' })).toBeNull();
  });

  it('returns null for a blank string body', () => {
    expect(getClientErrorMessage({ status: 400, data: '   ' })).toBeNull();
  });

  it('returns null for an object body without a message', () => {
    expect(
      getClientErrorMessage({ status: 400, data: { code: 'X' } }),
    ).toBeNull();
  });

  it('returns null for a null/undefined error', () => {
    expect(getClientErrorMessage(null)).toBeNull();
    expect(getClientErrorMessage(undefined)).toBeNull();
  });
});
