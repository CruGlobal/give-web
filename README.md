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

For other components, replace all instances of `checkout` with the name of another component. Current components are `cart`, `checkout`, `productConfig`, `signIn`, and `searchResults`.

### Importing CSS

Import the following:
```
<link rel="stylesheet" href="https://cru-givestage.s3.amazonaws.com/give.min.css">
```
This currently includes all cru.org styling from cru.scss.

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

### Adding dependencies

- Use `npm install <package-name> --save` or `npm i -D <package-name>` to install tooling (gulp plugins, css tooling, etc)
- Use `jspm install <package-name>`, `jspm install npm:<package-name>`, or `jspm install github:<repo-name>` to install app dependencies depending on where the package is located
- Use `jspm install <package-name> --dev` to install dev dependencies that are run in the browser when SystemJS imports modules or when karma is running tests
