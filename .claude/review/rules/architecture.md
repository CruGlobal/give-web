# Architecture — Focus Areas

Generic baseline. `/agent-review:init` appends the repo-specific concerns; keep both.

**Layering & boundaries**

- Business logic lives in testable modules, not inline in entry points (route/page/controller/CLI
  handlers). Entry points compose and delegate
- Server-only code stays out of code paths that ship to a client or untrusted runtime
- Look for: domain math embedded in view code; a module reaching across layers it shouldn't know
  about; new circular dependencies

**Placement & structure**

- New files land where the existing convention says they belong; shared code goes to the shared
  location only when it is genuinely used by more than one feature
- Look for: one-off code dropped into a "shared"/"common"/"utils" bucket; parallel structures that
  duplicate an existing module instead of extending it; new top-level directories

**Pattern consistency**

- The change should look like the code around it. Deviating is fine when the existing pattern is
  what's being fixed — but then it should be fixed consistently, not forked
- Look for: a second way of doing something the codebase already does one way (data fetching, error
  handling, configuration, logging); framework features reimplemented by hand

**State & data flow**

- Cached/derived state has a clear owner, and writes invalidate or update what they affect
- Look for: the same state maintained in two places; refetching in an effect what a cache already
  owns; values threaded through three or more layers that would be better read closer to use

**Effects & lifecycle**

- Look for: effects whose dependency list omits referenced values (stale closures); work in an
  effect that belongs in an event handler or a derived value; subscriptions and timers without
  cleanup

**Concurrency & performance shape**

- Look for: sequential awaits on independent work that could run concurrently; N+1 query patterns;
  unbounded loops over remote calls; work done per-item that could be batched

**Error handling & resilience**

- Look for: swallowed errors (empty catch, error logged and ignored); failures that leave state
  half-written; missing error/loading boundaries on user-facing surfaces; retries without backoff or
  idempotency

**Technical debt**

- Weigh debt added against debt removed. A refactor that only moves code without improving clarity
  is neutral, not positive. When a convention is ambiguous, raise it as a question rather than a
  blocking finding

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## give-web specifics

give-web is an AngularJS 1.8 front end for Cru's giving site. It talks to the Elastic Path Cortex
API (backend code is in the separate `give-ep-commerce` repo). It ships as two products from one
codebase: the main give site (`giveComponents` in `webpack.config.js`) and the embeddable branded
checkout (`brandedComponents`, loaded by `src/loaders/branded.js`).

**Layer map**

- `src/app/<feature>/`: page-level components (checkout, branded, cart, thankYou, productConfig,
  profile, designationEditor, ...). Each has a root `*.component.js` that `webpack.config.js` lists
  as an entry when it is mounted on its own
- `src/common/services/api/*.service.js`: the only place that should build Cortex requests. They
  go through `cortexApiService` (`src/common/services/cortexApi.service.js`) and return RxJS 5
  Observables
- `src/common/services/{addressHelpers,paymentHelpers,giftHelpers,checkoutHelpers}/`: plain
  functions and small services for domain logic. Example: `giftDates.service.js` exports pure
  `startDate`/`startMonth`/`possibleTransactionDays` functions
- `src/common/components/`: UI shared by both the give site and branded checkout (paymentMethods,
  contactInfo, addressForm, Recaptcha, ...)
- `src/common/lib/`: framework-free helpers (`getServerErrorMessage.js`, `cartEvents.js`,
  `fakeLocalStorage.js`, `oktaSignInWidgetHelper/`)
- `src/common/app.config.js`: environment vars (`envServiceProvider.config`), translations, and
  the Rollbar/Datadog config blocks
- `src/loaders/`: the tiny `give.v2.js` / `branded-checkout.v2.js` loader scripts that read
  `manifest.json` and inject hashed chunks

**Placement rules**

- Cortex calls belong in an `api/*.service.js` method, not in a component controller. A
  controller that calls `cortexApiService` or `$http` directly is a layering finding
- Domain math (dates, amounts, fee display) belongs in a helper module or service that can be unit
  tested. Look for new date or amount math inside `$onInit`, templates, or `ng-change` handlers.
  The pure-function shape of `giftDates.service.js` is the model
- A component goes in `src/common/components/` only if both the give site and branded checkout (or
  two features) use it. Otherwise it stays under `src/app/<feature>/`
- Anything under `src/common/` is in the branded bundle too, because
  `branded-checkout.component.js` imports `common/common.module`. Weigh bundle size and host-page
  side effects for changes there

**Module wiring**

- Each file default-exports `angular.module(name, [dep.name, ...])`. Dependencies are listed by
  the imported module's `.name`, never by a string literal for repo modules. String literals are
  only for third-party modules (`'environment'`, `'pascalprecht.translate'`, `'ngCookies'`)
- Look for: a service injected in a constructor whose module is not in the `angular.module` deps
  list. It will work in the app because of a sibling import and fail in isolated specs, or the
  other way around
- Cross-component signals go through `$rootScope.$on` / `$emit` with named exported constants
  (`cartUpdatedEvent`, `giftAddedEvent` in `common/lib/cartEvents.js`; `submitOrderEvent` in
  `app/checkout/cart-summary/cart-summary.component.js`; `brandedCoverFeeCheckedEvent` in
  `productConfigForm.component.js`). Don't add a bare string event name

**State ownership**

- Checkout state that has to outlive a page lives in browser storage owned by `orderService`
  (`cardBin`, `storedBins`, `cvv`, `storedCvvs`, `coverFees`, `lastPurchaseLink`,
  `recaptchaToken`/`recaptchaAction`, `radioStationCallLetters`). Read and write it through
  `orderService` methods, not raw `$window.sessionStorage` calls in a component
- Session and role come from `sessionService` (cookies `cortex-role`, `give-session`,
  `cru-profile`). Don't decode those cookies anywhere else
- `envService.data.vars[...]` is global. Branded checkout changes it in `$onInit`
  (`isBrandedCheckout`, `apiUrl`). New code that reads env vars should use
  `envService.read('key')` and must not assume a value fixed at config time

**RxJS lifecycle**

- Observables are cold. A service method that is subscribed twice fires two HTTP requests. Look
  for a method subscribed in both a parent and a child component, or re-subscribed inside a
  `$watch`
- Long-lived subscriptions (`$rootScope.$on`, intervals in `Recaptcha.tsx`) need cleanup in
  `$onDestroy` or the effect's return. Branded checkout can be mounted more than once on a host
  page

**Concurrency in checkout**

- Branded checkout's `$onInit` fires `sessionService.signOutWithoutRedirectToOkta()` without
  waiting, and the parallel cart loads can mint separate sessions. `cortexApiService.http` retries
  one 403 on GET only, for this reason. New requests issued during branded init should be GETs or
  must tolerate this race. Don't widen that retry to writes
- Every submit path needs an in-flight guard. See `canSubmitOrder()` in
  `src/app/checkout/step-3/step-3.component.js` and
  `src/app/branded/step-1/branded-checkout-step-1.component.js` (`!this.submitted &&
!this.submittingOrder`). Each terminal path must reset `submitted`/`submittingOrder` (use
  `.finally(...)` as `submitOrderInternal` does)

**Error handling**

- `$log.error` is wrapped to report to Rollbar (`src/common/rollbar.config.js`). Logging with
  `$log.error(message, error)` and then setting a UI error flag (`loadingError = 'api error'`) is
  the house pattern. A bare `console.error` sends nothing to Rollbar. Branded checkout uses
  `console.error` on purpose for errors in host configuration
- Read API errors through `common/services/structuredError.service` (`getErrorText` /
  `getErrors`). It handles both the EP 8.3 structured body and older plain-text bodies. Code that
  reads `error.data` as a string directly is a regression

## Mined from PR history

- Every `package.json` dependency must come from an npm release or a CruGlobal-owned git repo,
  never an individual's GitHub fork. A deleted fork broke CI
  <!-- evidence: PR #1259, #1260 -->
