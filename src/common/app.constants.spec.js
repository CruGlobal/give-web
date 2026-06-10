import { phoneNumberRegex } from 'common/app.constants';

describe('app.constants', () => {
  describe('phoneNumberRegex', () => {
    describe('valid phone numbers', () => {
      it.each([
        ['4075551234'],
        ['407-555-1234'],
        ['(407) 555-1234'],
        ['+1 407 555 1234'],
        ['541-967-0010'],
        ['555-555-5555'],
        ['(909) 337-2433'],
        ['1234567890'],
        ['(111) 111-111'],
        ['011 44 20 7946 0958'],
        ['407.555.1234'],
      ])('should match %s', (number) => {
        expect(phoneNumberRegex.test(number)).toEqual(true);
      });
    });

    describe('valid phone numbers with extensions', () => {
      it.each([
        ['407-555-1234 ext. 5678'],
        ['407-555-1234 ext 5678'],
        ['407-555-1234 extension 22'],
        ['4075551234x99'],
        ['4075551234 x. 99'],
        ['4075551234 #99'],
      ])('should match %s', (number) => {
        expect(phoneNumberRegex.test(number)).toEqual(true);
      });
    });

    describe('malformed input', () => {
      it.each([
        ['abc!!!1234567'],
        ['call me at 5551234'],
        ['5551234 is my number'],
        ['-------'],
        ['- - - - - - -'],
        ['   -   -   '],
        ['123-abc-7890'],
        [''],
        ['123456'], // fewer than 7 digits
        ['1234567890123456'], // more than 15 digits
        ['407-555-1234 ext.'], // extension marker without digits
      ])('should not match %s', (number) => {
        expect(phoneNumberRegex.test(number)).toEqual(false);
      });
    });
  });
});
