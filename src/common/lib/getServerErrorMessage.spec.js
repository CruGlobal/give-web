import getServerErrorMessage from './getServerErrorMessage';

describe('getServerErrorMessage', () => {
  it('returns the string body for a 4xx error', () => {
    expect(
      getServerErrorMessage({ status: 400, data: 'Invalid phone number' }),
    ).toBe('Invalid phone number');
  });

  it('returns null for a 5xx error', () => {
    expect(getServerErrorMessage({ status: 500, data: 'boom' })).toBeNull();
  });

  it('returns null when there is no status', () => {
    expect(getServerErrorMessage({ data: 'some error' })).toBeNull();
  });

  it('returns null for a blank string body', () => {
    expect(getServerErrorMessage({ status: 400, data: '   ' })).toBeNull();
  });

  it('returns null for a non-string body', () => {
    expect(
      getServerErrorMessage({ status: 400, data: { message: 'Bad value' } }),
    ).toBeNull();
  });

  it('returns null for a null/undefined error', () => {
    expect(getServerErrorMessage(null)).toBeNull();
    expect(getServerErrorMessage(undefined)).toBeNull();
  });
});
