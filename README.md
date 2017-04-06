# give-web
## Angular front-end components for use in AEM on [give.cru.org](https://give.cru.org)

[![Build Status](https://travis-ci.org/CruGlobal/give-web.svg?branch=master)](https://travis-ci.org/CruGlobal/give-web)
[![codecov](https://codecov.io/gh/CruGlobal/give-web/branch/master/graph/badge.svg)](https://codecov.io/gh/CruGlobal/give-web)

## Usage

### Importing JS and HTML templates

To use the `checkout` component, include this code on your page:
```
<checkout ng-cloak ng-app="checkout"></checkout>

<script src="https://cru-givestage.s3.amazonaws.com/common.js"></script>
<script src="https://cru-givestage.s3.amazonaws.com/checkout.js"></script>
```

For other components, replace all instances of `checkout` with the name of another component. Current components are `cart`, `checkout`, `thankYou`, `productConfig`, `signIn`, `searchResults`, `homeSignIn`, `yourGiving`, `profile`, `receipts`, `paymentMethods`, and `designationEditor`.

### Importing CSS

Import the following:
```
<link rel="stylesheet" href="https://cru-givestage.s3.amazonaws.com/give.min.css">
<link rel="stylesheet" href="https://cru-givestage.s3.amazonaws.com/nav.min.css">
```
This currently includes all cru.org styling from cru.scss.

## Development

### Installing yarn
Use yarn for faster installs and to update the yarn lock file: https://yarnpkg.com/en/docs/install

### Install & Run

1. `yarn` or `npm install`
2. `yarn start` or `npm start`
3. Browse to [`http://localhost:9000`](http://localhost:9000)
Note: For session cookies to work correctly, add an entry to your hosts file for `localhost.cru.org` pointing to `127.0.0.1` and use [`http://localhost.cru.org:9000`](http://localhost.cru.org:9000) for development

### Development Tasks

- `yarn run test` or `npm run test` to run karma tests
- `yarn run lint` or `npm run lint` to run eslint
- `yarn run build` or `npm run build` to generate minified output files. These files are output to `/dist`. `common.js` must be included before any of the other JS files.
- `yarn run build:analyze` or `npm run build:analyze` to open a visualization of bundle sizes after building

### Adding dependencies

- Use `yarn add <package-name>` or `npm install <package-name> --save` to install app dependencies
- Use `yarn add <package-name> -dev` `npm install <package-name> --save-dev` to install tooling dependencies

### Making queries to Cortex
Use the `cortexApiService` which provides convenience methods for sending requests to Cortex. For more documentation see the [cortexApiService docs](docs/cortexApiService.md).
