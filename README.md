# give-web
## Angular front-end components for use in AEM on [give.cru.org](https://give.cru.org)

[![Build Status](https://github.com/CruGlobal/give-web/actions/workflows/build.yml/badge.svg)](https://github.com/CruGlobal/give-web/actions)
[![codecov](https://codecov.io/gh/CruGlobal/give-web/branch/master/graph/badge.svg)](https://codecov.io/gh/CruGlobal/give-web)

## Usage

### Importing JS and HTML templates

To use the `searchResults` component, include this code on your page:
```html
<search-results ng-app="searchResults"></search-results>

<script src="https://give-static.cru.org/app.js"></script>
```

For other components, replace all instances of `checkout` with the name of another component. Current components are `cart`, `checkout`, `thankYou`, `productConfig`, `signIn`, `searchResults`, `yourGiving`, `profile`, `receipts`, `paymentMethods`, `designationEditor`, and `brandedCheckout`. The element name needs to be kebab case and the ng-app module name needs to be camel case.

### Importing CSS

Import the following:
```html
<link rel="stylesheet" href="https://give-static.cru.org/give.min.css">
```
This includes legacy cru.org styling from cru.scss.

### Branded checkout

#### Branded checkout basic example

Add the following code to your page where appropriate. You must change the value of `designation-number` to the designation number you want users to give to. As part of the setup process Cru should provide a `tsys-device` attribute which matches the TSYS config for your site.
```html
<branded-checkout
    designation-number="0763355"
    api-url="https://brandedcheckout.mydomain.com"
    tsys-device="cru">
</branded-checkout>

<script src="https://give-static.cru.org/branded-checkout.v2.js"></script>
```

#### Branded checkout full example with all attributes

Add the following code to your page where appropriate. See the [Branded checkout config](#branded-checkout-config) section for details on setting these attributes.
```html
<branded-checkout
    designation-number="<designation number>"
    api-url="brandedcheckout.mydomain.com"
    campaign-code="<campaign code>"
    campaign-page="<campaign-page>"
    tsys-device="<tsys-device>"
    amount="<amount>"
    frequency="<frequency>"
    day="<day>"
    default-payment-type="creditCard"
    donor-details="<window variable containing default values for donor's name and contact info>"
    show-cover-fees="true"
    on-order-completed="$event.$window.onOrderCompleted($event.purchase)"
    on-order-failed="$event.$window.onOrderFailed($event.donorDetails)"
    radio-station-api-url="https://api.domain.com/getStations"
    premium-code="BOOKS01"
    premium-name="Books"
    premium-image-url="https://api.images.com/img.png"
    hide-spouse-details="true"
    hide-annual="true"
    hide-quarterly="true">
</branded-checkout>

<script src="https://give-static.cru.org/branded-checkout.v2.js"></script>
<script>
  window.onOrderCompleted = function (purchaseData) {
    console.log('Order completed successfully', purchaseData);
  };
  window.onOrderFailed = function (donorDetails) {
    console.log('Order failed', donorDetails);
  };
</script>
```

#### Branded checkout config

The `<branded-checkout>` element is where the branded checkout Angular app will be loaded. It is configured by providing HTML attributes that will be loaded by Angular. Attributes with values containing angle brackets (such as `<designation number>`) are placeholders and should be replaced with real values or, if not needed, the whole attribute should be omitted. The `<branded-checkout>` element accepts the following attributes:
- `api-url` - Custom API url. This is required to be on the same top level domain as the branded checkout form for use in browsers that block third party cookies. - **Required** if your domain is not a subdomain of cru.org
- `designation-number` - the designation number you would like donors to give to - **Required**
- `campaign-page` - the campaign page you would like to use, used for suggested amounts - *Optional*
- `campaign-code` - the campaign code you would like to use - *Optional*
- `premium-code` - the premium code you would like to use - *Optional* - make sure you use the proper premium code associated with the campaign
- `premium-name` - the name of the premium offered to donors - *Optional*
- `premium-image-url` - the custom image to appear when selecting a premium - *Optional*
- `tsys-device` - the device name that corresponds to the TSYS Merchant Account which will be used for tokenizing your site's credit cards with TSYS - **Required** - Will be provided by DPS when adding your domain to the TSYS whitelist. `cru` is the default and corresponds with Cru's main TSYS Merchant ID
- `amount` - defaults the gift's amount - *Optional*
- `frequency` - defaults the gift's frequency - *Optional* - can be one of the following values:
  - `single` - single gift - this is the default so it doesn't need to be specified
  - `monthly` - monthly recurring gift
  - `quarterly` - quarterly recurring gift
  - `annually` - annually recurring gift
- `day` - for recurring gifts this defaults the gift's day of the month - *Optional* - can be `1` to `28`
- `default-payment-type` - if set to `creditCard`, the credit card form will be shown by default instead of bank account - *Optional*
- `donor-details` - name of the window variable containing default values for donor's name and contact info - *Optional* - should be in this format:
    ```javascript
    window.donorDetails = {
        donorType: 'Household', // or 'Organization'
        name: {
            title: '',
            givenName: 'First Name',
            middleInitial: '',
            familyName: 'Last Name',
            suffix: ''
        },
        organizationName: '', // Used when donorType is 'Organization'
        phoneNumber: '',
        spouseName: {
            title: '',
            givenName: 'First Name',
            middleInitial: '',
            familyName: 'Last Name',
            suffix: ''
        },
        mailingAddress: {
            country: 'US',
            // For US addresses
            streetAddress: '123 Some Street',
            extendedAddress: 'Address Line 2',
            locality: 'City',
            region: 'CA',
            postalCode: '12345'
            // For non-US addresses
            streetAddress: '123 Some Street',
            extendedAddress: 'Address Line 2',
            intAddressLine3: 'Address Line 3',
            intAddressLine4: 'Address Line 4'
        },
        email: 'email@example.com'
    };
    ```
- `show-cover-fees` - true if you want to show the checkbox that allows donors to cover processing fees, otherwise leave the attribute off.
- `on-order-completed` - an Angular expression that is executed when the order was submitted successfully - *Optional* -  provides 2 variables:
  - `$event.$window` - Provides access to the browser's global `window` object. This allows you to call a custom callback function like `onOrderCompleted` in the example.
  - `$event.purchase` - contains the order's details that are loaded for the thank you page
- `radio-station-api-url` - Provides a URL path for fetching a list of radio stations in the donor's vicinity.  If you plan to use this feature, contact Cru's Digital Products and Services (DPS) department ([help@cru.org](mailto:help@cru.org)) to have your URL domain whitelisted to interact with our API - *Optional*
- `hide-spouse-details` - Hides the spouse detail line initially, and adds a link to toggle the spouse details. If you don't want this feature, do not add this attribute at all. - *Optional*
- `hide-annual` - Hides the annual frequency option. If you don't want this feature, do not add this attribute at all. - *Optional*
- `hide-quarterly` - Hides the quarterly frequency option. If you don't want this feature, do not add this attribute at all. - *Optional*


#### Server-side configuration for a new branded checkout domain
1. Figure out what domain you will be hosting the branded checkout form on. For example, `myministry.org`
2. Make sure HTTPS is enabled on that domain
3. You will need to setup a subdomain for the give.cru.org API. We've experienced cross-domain cookie issues trying to hit the give.cru.org API directly from a custom domain. Create a CNAME record for `brandedcheckout.myministry.org` (the subdomain could be different but using that suggested subdomain makes it consistent with other sites) and point it at `cortex-gateway-production-alb-425941461.us-east-1.elb.amazonaws.com`.
4. In order to accept credit cards on your own domain, you will need a new TSYS device id (a numeric id around 14 digits) associated with one of our Merchant Accounts. Contact the Cru's Financial Services Group ([hazel.mcpherson@cru.org](mailto:hazel.mcpherson@cru.org)) and request one. You will use the device id to complete step 6.
5. To prepare for the next step, think of a unique identifier like `"jesusfilm"` or `"aia"` that uniquely identifies your ministry and domain. We can create this for you but we need enough information about your ministry to do so.
6. Once you have completed the steps above, contact Cru's Digital Products and Services (DPS) department ([help@cru.org](mailto:help@cru.org)). Below is an example email: (replace the `{{}}`s with the info for your site)

   > I'm working on implementing branded checkout for {{my ministry}}. I would like to host the branded checkout form on {{myminsitry.org}}. HTTPS is setup on my domain and I have created a CNAME record for the subdomain {{brandedcheckout.myministry.org}} that points to cortex-gateway-production-alb-425941461.us-east-1.elb.amazonaws.com. (DPS may be able to help with the CNAME record configuration if the domain is hosted with us.)
   >
   >    I need help configuring the give.cru.org API to work on my domain. Can you:
   >    - Add an SSL certificate to cruorg-alb for my subdomain {{brandedcheckout.myministry.org}}
   >    - Add that same subdomain to cortex_gateway's AUTH_PROXY_VALID_ORIGINS environment variable
   >    - Add the user facing domain to the maintenance app's cortex_gateway CORS Whitelist
   >
   >    I also need help setting up a my TSYS merchant account with the give.cru.org API to be able to proccess credit cards on my site. Can you:
   >    - Add my TSYS device id to the give.cru.org API configuration. My device id is {{12345678901234}} and the url I would like to use for the branded checkout form is {{https://myministry.org}}. I would like to use a identifier of "{{myministry}}". (Or uniquely describe your ministry and domain if you want DPS to create the identifier. We can't have multiple sites that use the same identifier.)
   >    - Whitelist my site {{https://myministry.org}} with TSYS so their TSEP credit card tokenization services will work on my domain.
   >    - Whitelist my domain {{myminisry.org}} with Recaptcha.

7. Test the subdomain configured to point to the give.cru.org API. https://brandedcheckout.myministry.org/cortex/nextdrawdate is a good test url. There should be no certificate errors and you should get a response that looks like this `{"next-draw-date":"2018-09-27"}`. If there are errors, please get in touch with ([help@cru.org](mailto:help@cru.org)) again and provide details as to what is happening.
8. Add the `<branded-checkout>` tag to a page on the domain you've configured above. You can follow the documentation above for all the possible attributes and the required style and script tags. The email conversations above should have provided the values for the `api-url` (the subdomain that has a CNAME to cortex-gateway-production-alb-425941461.us-east-1.elb.amazonaws.com) and `tsys-device` (the unique string identifier created by you or by DPS) attributes. You can add them like this:
   ```html
   <branded-checkout
       designation-number="0763355"
       api-url="https://brandedcheckout.myministry.com"
       tsys-device="myministry">
   </branded-checkout>
   <script src="https://give-static.cru.org/branded-checkout.v2.js"></script>
   ```
9. If you go to this page in a browser, you should see the `<branded-checkout>` tag fill with content. There should also be no errors in the browser's console. If you see errors that appear to be caused by branded checkout please contact us at [help@cru.org](mailto:help@cru.org).

## Development

### Installing yarn
Use yarn for faster installs and to update the yarn lock file: https://yarnpkg.com/en/docs/install

### Install & Run

1. `yarn` or `npm install`
2. `yarn build` or `npm build` _(During the build we copy the latest assets from Okta sign-in-widget package to ensure the sign up form is styled, and shows icons.)_
3. `yarn start` or `npm start`
4. Browse to [`http://localhost:9000`](http://localhost:9000)
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

### Staging Environment
Replace `https://give-static.cru.org` with `https://give-stage-static.cru.org` to use the staging environment.

### Deployments

Travis auto-deploys master builds to a pre-prod s3 bucket.
http://devtools.aws.cru.org:8080/view/Give%20Site/job/Give%20NG%20prod%20deploy/ copies
to the live bucket, which backs CloudFront.

## Okta sign-in widget
On the initial set up, [by their instructions](https://www.npmjs.com/package/@okta/okta-signin-widget#using-the-npm-module), we copied the /css, /images and /label folders to our `/assets/okta-sign-in` folder.
When you update the `@okta/okta-signin-widget` package, you may also need to update the `/assets/okta-sign-in` folder.
You can do so by copying the assets from `/node_modules/@okta/okta-signin-widget/dist/`.

Below is a breakdown of the assets you will need to move.

#### `node_modules/@okta/okta-signin-widget/dist/css/`
Move the file `okta-sign-in.min.css` to the folder `/assets/okta-sign-in/css`. At the time of implementing the Okta sign-in widget, there wasn't a need to add the other css files.

#### `node_modules/@okta/okta-signin-widget/dist/img/`
_I highly doubt you will need to move over more images. I didn't want to use webpack for these images, as there are a lot of images we do not need._ But if you need to move them, please move them into the folder `/assets/okta-sign-in/img`.

#### `node_modules/@okta/okta-signin-widget/dist/labels/`
Webpack copies the labels from `@okta/okta-signin-widget` and stores them on our application, so do need to update these.
