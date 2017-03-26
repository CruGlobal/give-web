// require all spec files
const testsContext = require.context('.', true, /(app|common).*\.spec\.js$/);
testsContext.keys().forEach(testsContext);
