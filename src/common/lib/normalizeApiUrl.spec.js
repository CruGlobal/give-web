import normalizeApiUrl from './normalizeApiUrl';

describe('normalizeApiUrl', () => {
  it('should handle URLs with https:// protocol', () => {
    const result = normalizeApiUrl('https://give.domain.com');
    expect(result).toEqual('//give.domain.com');
  });

  it('should handle URLs with http:// protocol', () => {
    const result = normalizeApiUrl('http://give.domain.com');
    expect(result).toEqual('//give.domain.com');
  });

  it('should handle URLs without protocol', () => {
    const result = normalizeApiUrl('give.domain.com');
    expect(result).toEqual('//give.domain.com');
  });

  it('should handle URLs already in protocol-relative format', () => {
    const result = normalizeApiUrl('//give.domain.com');
    expect(result).toEqual('//give.domain.com');
  });

  it('should remove trailing slashes', () => {
    const result = normalizeApiUrl('https://give.domain.com/');
    expect(result).toEqual('//give.domain.com');
  });

  it('should remove multiple trailing slashes', () => {
    const result = normalizeApiUrl('https://give.domain.com///');
    expect(result).toEqual('//give.domain.com');
  });

  it('should preserve port in URL', () => {
    const result = normalizeApiUrl('http://give.domain.com:3000/');
    expect(result).toEqual('//give.domain.com:3000');
  });

  it('should preserve query parameters', () => {
    const result = normalizeApiUrl('https://give.domain.com/?ref=abc');
    expect(result).toEqual('//give.domain.com?ref=abc');
  });
});
