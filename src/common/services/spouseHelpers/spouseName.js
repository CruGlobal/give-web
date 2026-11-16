const otherNameField = {
  'given-name': 'family-name',
  'family-name': 'given-name',
};

export function hasSpouseNamePart(spouseName, field) {
  return !!spouseName?.[field]?.trim();
}

export function isSpouseNameComplete(spouseName) {
  return (
    hasSpouseNamePart(spouseName, 'given-name') &&
    hasSpouseNamePart(spouseName, 'family-name')
  );
}

export function isSpouseNamePartial(spouseName) {
  return (
    hasSpouseNamePart(spouseName, 'given-name') !==
    hasSpouseNamePart(spouseName, 'family-name')
  );
}

export function isSpouseNamePartRequired(spouseName, field) {
  return hasSpouseNamePart(spouseName, otherNameField[field]);
}
