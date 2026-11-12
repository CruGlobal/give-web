# Branded Checkout Embed — Focus Areas

This agent protects the public contract of `<branded-checkout>`. Partner ministries (FamilyLife and
others) paste this element and a script tag into their own sites, often WordPress, and write
JavaScript against its callbacks. They don't redeploy when give-web does, and `branded-checkout.v2.js`
always serves the latest build. So any change to the contract ships to every partner page at once.
Treat it like a public API: additions are fine, and breaking changes need a strong reason, a
README update, and a release note.

**The contract surface**

- Element and bootstrap: `src/loaders/branded.js` loads `manifest.json` from `S3_GIVE_DOMAIN`, then
  the chunks `vendors~branded~give.js`, `branded.js`, `branded.css`, then calls
  `angular.bootstrap(document.body, ['brandedCheckout'], { strictDi: true })`
- Loader file name: `branded-checkout.v2.js` (webpack entry `'branded-checkout.v2'`, kept out of
  hashing and chunk splitting in `webpack.config.js`). The legacy build also emits
  `branded-checkout.js` / `branded-checkout.min.css`. Renaming an entry, the `vendors~branded~give`
  split chunk, or the manifest keys breaks every host page
- Attributes: the `bindings` of the `brandedCheckout` component in
  `src/app/branded/branded-checkout.component.js`. Today: `designation-number`, `tsys-device`,
  `campaign-code`, `campaign-page`, `amount`, `frequency`, `day`, `api-url`, `premium-code`,
  `premium-name`, `premium-image-url`, `premium-minimum-amount`, `radio-station-api-url`,
  `donor-details` (a window variable name), `single-amounts`, `monthly-amounts`,
  `thank-you-message` (an element id), `default-payment-type`, `hide-payment-type-options`,
  `language`, `show-cover-fees`, `use-v3`, `hide-annual`, `hide-quarterly`, and the `&` callbacks
  `on-order-completed`, `on-order-failed`
- Documentation: `README.md` "Branded checkout" sections (basic example, full example, config
  list). `branded-checkout.html` and `branded-checkout-dev.html` are the local test pages

**Backward compatibility**

- Never remove or rename an attribute, change what an existing value means, or narrow what it
  accepts. Strings like `use-v3="true"` and `show-cover-fees` are compared as strings or by
  presence. Keep the same test (`this.useV3 === 'true'`)
- Values from the host are untrusted and often messy. Invalid values should fall back to the old
  default and log with `console.error` (see `parseAmounts`, `resolveThankYouMessage`). They must
  not throw or block checkout. Match how the nearest existing attribute is parsed. Don't add new
  sanitizing that siblings don't have
- New attributes must be optional, leave behavior unchanged when absent, be added to `bindings`,
  passed through `branded-checkout.tpl.html` if a child needs them, and documented in the README
  config list
- Look for: a default that changed (frequency, payment type, language, amount list); an attribute
  that moved from `'@'` to `'<'` (hosts pass plain strings, and `'<'` evaluates them as
  expressions); README examples that no longer work

**Callback payloads**

- `on-order-completed` is called from `onThankYouPurchaseLoaded` with
  `$event = { $window, purchase }`, where `purchase` is
  `changeCaseObject.camelCase(pick(purchase, ['donorDetails', 'lineItems']))`. `purchase` comes
  from `profileService.getPurchase()` and its zoom (`donordetails`,
  `lineitems:element[],lineitems:element:item:code,lineitems:element:item:offer:code,lineitems:element:rate`).
  Hosts read paths like `purchase.lineItems[0].itemCode.code` and `rate.cost[0].amount`. A change
  to that zoom, to the `pick` list, or to the case conversion is a breaking change
- `on-order-failed` is called from `onPaymentFailed` with `$event = { $window, donorDetails }`
  (camelCased). It fires when the step-1 payment form reports `errorSubmitting`/`unsubmitted`
  (tokenizing or saving the payment), not when the final purchase POST fails. Changing when it
  fires is a contract change. It is in the README full example but missing from the config list.
  Fix the docs when you touch it
- Both calls are wrapped in `try/catch` with `console.error`, so a host callback that throws
  (FamilyLife's does today) can't stop the thank-you page or analytics. Keep that wrapping, and
  keep `brandedAnalyticsFactory.savePurchase/purchase` after the callback
- `$event.$window` is the documented way for hosts to reach their own globals. Don't remove it
- Look for: a new key in the payload with card data or session tokens (it goes to third-party
  JavaScript); a payload built from a different source than the thank-you page; callbacks fired
  twice

**Behavior on host pages**

- Host globals: the bundle reads `window[donorDetailsVariable]`, the host's
  `<template id=thank-you-message>`, and sets `window.grecaptcha` through the injected Enterprise
  script (`checkoutService.initializeRecaptcha`, guarded by id `give-checkout-recaptcha`). Some
  hosts also load plain `recaptcha/api.js`, which can leave `grecaptcha.enterprise` undefined.
  Code must not assume it exists
- Don't add new globals, polyfills that change built-ins, or global CSS outside the
  `.branded-checkout` scope. `common/lib/fakeLocalStorage` patches `Storage.prototype` when
  storage throws (Safari private mode). That already affects the host. Don't widen it
- Multiple instances: bootstrap compiles every `<branded-checkout>` in `body`, and they share
  singleton services (`orderService`, `tsysService` device, `envService` vars including
  `apiUrl`, `$translate` language). `$uibModalProvider.options.appendTo` uses the first element.
  Two give-web instances in one browser (a second tab, a preloaded in-app browser view) can also
  race for the session cookie and cause cart 403s. That's why `cortexApiService` retries a GET
  403 once. New per-instance state must live on the controller, not in a shared service or storage
  key
- Storage and cookies: branded `$onInit` signs out (`signOutWithoutRedirectToOkta`), which
  expires the session cookies, and clears `initialLoadComplete` and the cover-fee decision.
  Storage keys are shared with the host origin. Prefix new keys clearly and clean them up
- `api-url` must be on the host's own top-level domain for browsers that block third-party
  cookies. `normalizeApiUrl` turns it into `//host`. Keep that tolerant of `https://`, trailing
  slashes, and `/?`
- Scrolling and layout: `next()` calls `scrollIntoView` on the element. `previous()` uses a
  `MutationObserver` on the element. Don't scroll or observe `document.body`

**Checklist**

- [ ] No attribute, callback, or `$event` field removed, renamed, or changed in meaning
- [ ] New attributes are optional, documented in `README.md`, and covered in
      `branded-checkout.spec.js`
- [ ] `on-order-completed` / `on-order-failed` payload shapes unchanged, or the change is called
      out as breaking with a README and release note
- [ ] Loader file names, entry names, and manifest chunk names unchanged
- [ ] Bad host input falls back with `console.error` and never blocks checkout
- [ ] No new globals, unscoped CSS, or shared state that breaks with two instances
- [ ] PR testing notes include branded checkout on staging (per the PR template)

## Mined from PR history

- A new binding in `branded-checkout.component.js` must also be added to the README attribute list
  and `branded-checkout-dev.html`, and the PR must say whether the Branded Checkout WordPress
  plugin needs the attribute. Parse the raw `@` string defensively (e.g. `parseFloat` plus a
  range check) so a bad value turns the feature off instead of blocking checkout
  <!-- evidence: PR #1298, #1299, #1306, #1307 -->
- Wrap every call to a host-supplied callback (`onOrderCompleted`, `onOrderFailed`) in try/catch
  so our analytics and state updates still run. Log with `console.error`, not `$log.error`, so
  host errors stay out of give-web Rollbar
  <!-- evidence: PR #1267 -->
- Every branded step-1 submit path must return early when `!this.canSubmitOrder()`, and the
  button's `ng-disabled` must use the same guard. Async React click handlers (`Recaptcha.tsx`)
  need an in-flight `useRef` flag that resets in `finally`
  <!-- evidence: PR #1311 -->
- Scope shared SCSS edits (`_form.scss`, `_checkout.scss`, `crubrand/_overrides.scss`) under a
  specific parent selector, and say which forms were checked (modal, full-page, full-width
  `<branded-checkout>`). Never reset host styling on embedder content (e.g. `all: revert` on
  `.custom-thank-you`)
  <!-- evidence: PR #1252, #1257, #1262, #1306 -->
