'use strict';

import '@testing-library/jest-dom';

// textangularjs expects document.styleSheets to be an array, jest/jsdom don't set this, so we stub it here
// https://github.com/textAngular/textAngular/issues/1553
Object.defineProperty(document, 'styleSheets', {
  value: [],
});
