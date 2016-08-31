# give-web
## Angular front-end components for [give.cru.org](https://give.cru.org) for use in AEM

[![Build Status](https://travis-ci.org/CruGlobal/give-web.svg?branch=master)](https://travis-ci.org/CruGlobal/give-web)
[![codecov](https://codecov.io/gh/CruGlobal/give-web/branch/master/graph/badge.svg)](https://codecov.io/gh/CruGlobal/give-web)

## Usage

### Importing JS and HTML templates

To use the `checkout` component, include this code on your page:
```
<checkout ng-cloak ng-app="checkout"></checkout>

<script src="https://cru-givestage.s3.amazonaws.com/common.js"></script>
<script src="https://cru-givestage.s3.amazonaws.com/checkout.js"></script>

<script>
  System.import('app/checkout/checkout.component');
</script>
```

For other components, replace all instances of `checkout` with the name of another component. Current components are `cart` and `checkout`.

### Importing CSS

TODO: Update this. Currently the process is to import the following:
```
<link rel="stylesheet" href="https://www.cru.org/css/cru.min.css">
<link rel="stylesheet" href="https://raw.githubusercontent.com/CruGlobal/Give_Front-end/checkout/assets/css/give.css">
```


## Development

### Install & Run

1. `npm install` (This also runs `jspm install` for installing front-end components)
2. `npm start` or `gulp serve`
3. Browse to [`http://localhost:9000`](http://localhost:9000)

### Gulp Tasks

- `gulp test` to run karma tests
- `gulp webdriver-standalone` and `gulp sauce-test` to run e2e test - these tests have not been implemented yet
- `gulp lint` to run eslint
- `gulp release` to bundle and minify. These files are output to `/dist`.
