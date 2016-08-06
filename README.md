# give-web
## Angular front-end components for [give.cru.org](https://give.cru.org) for use in AEM

[![Build Status](https://travis-ci.org/CruGlobal/give-web.svg?branch=master)](https://travis-ci.org/CruGlobal/give-web)
[![codecov](https://codecov.io/gh/CruGlobal/give-web/branch/master/graph/badge.svg)](https://codecov.io/gh/CruGlobal/give-web)

### Install & Run

1. `npm install` (This also runs `jspm install` for installing front-end components)
2. `npm start` or `gulp serve`
3. Browse to [`http://localhost:9000`](http://localhost:9000)

### Gulp Tasks

- `gulp test` to run karma tests
- `gulp webdriver-standalone` and `gulp sauce-test` to run e2e test
- `gulp lint` to run eslint
- `gulp release` to bundle and minify
