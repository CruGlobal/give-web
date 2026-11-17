import {
  hasSpouseNamePart,
  isSpouseNameComplete,
  isSpouseNamePartial,
  isSpouseNamePartRequired,
} from './spouseName';

const spouseName = (givenName, familyName) => ({
  'given-name': givenName,
  'family-name': familyName,
});

describe('spouseName helpers', () => {
  describe('hasSpouseNamePart', () => {
    it('should be true for a filled in name', () => {
      expect(hasSpouseNamePart(spouseName('Julie', ''), 'given-name')).toBe(
        true,
      );
    });

    it('should treat blank, whitespace-only and missing names as empty', () => {
      expect(hasSpouseNamePart(spouseName('', null), 'given-name')).toBe(false);
      expect(hasSpouseNamePart(spouseName('', null), 'family-name')).toBe(
        false,
      );
      expect(hasSpouseNamePart(spouseName('   ', 'x'), 'given-name')).toBe(
        false,
      );
      expect(hasSpouseNamePart(undefined, 'given-name')).toBe(false);
    });
  });

  describe('isSpouseNameComplete', () => {
    it('should be true only when both names are filled in', () => {
      expect(isSpouseNameComplete(spouseName('Julie', 'Smith'))).toBe(true);
      expect(isSpouseNameComplete(spouseName('Julie', ' '))).toBe(false);
      expect(isSpouseNameComplete(spouseName('', ''))).toBe(false);
      expect(isSpouseNameComplete(undefined)).toBe(false);
    });
  });

  describe('isSpouseNamePartial', () => {
    it('should be true only when exactly one name is filled in', () => {
      expect(isSpouseNamePartial(spouseName('Julie', ''))).toBe(true);
      expect(isSpouseNamePartial(spouseName('  ', 'Smith'))).toBe(true);
      expect(isSpouseNamePartial(spouseName('Julie', 'Smith'))).toBe(false);
      expect(isSpouseNamePartial(spouseName('', ''))).toBe(false);
    });
  });

  describe('isSpouseNamePartRequired', () => {
    it('should require a name when the other name is filled in', () => {
      const name = spouseName('Julie', '');

      expect(isSpouseNamePartRequired(name, 'family-name')).toBe(true);
      expect(isSpouseNamePartRequired(name, 'given-name')).toBe(false);
    });

    it('should not require either name when both are blank', () => {
      const name = spouseName('', '  ');

      expect(isSpouseNamePartRequired(name, 'given-name')).toBe(false);
      expect(isSpouseNamePartRequired(name, 'family-name')).toBe(false);
    });
  });
});
