# Testing — Focus Areas

Generic baseline. `/agent-review:init` appends this repo's test conventions (runner, layout,
mocking idioms); keep both.

**Prefer pure-function unit tests**

- Business and domain logic should be extracted out of UI/handler code into plain functions and
  tested directly, rather than asserted through a rendered surface or an HTTP round trip
- Look for: new logic that is only reachable through a component or endpoint, with no seam to test

**Use the repo's existing test framework and idioms**

- Match the repo's test runner, assertion style, mocking helpers, and import conventions. Do not
  assume a framework, rendering harness, or helper library that the repo does not already depend on
- Look for: tests introducing a second runner or harness; imports of libraries absent from the
  manifest

**Mock at module/external boundaries**

- External services (databases, third-party APIs, mail, payments, LLMs) are mocked at the module
  boundary, not by patching global network primitives ad hoc
- Look for: real network or filesystem access in unit tests; mocks that drift from the real
  signature; over-mocking that leaves the logic under test unexercised

**Determinism**

- Time-dependent logic uses the runner's fake-timer/clock control rather than real system time.
  Random values are seeded or injected
- Look for: tests that depend on the current date, timezone, ordering of a map/set, or on another
  test having run first

**Coverage of the shape of the input**

- Every new test should exercise: empty, zero / one / many, boundary values, and at least one happy
  path
- Look for: tests that only assert the happy path; parameters whose invalid values are never tested

**Error paths**

- Validation rejections, rejected promises, timeouts, and the failure branches of domain functions
  are tested, not just success
- Look for: `catch` branches with no covering test

**Test placement and naming**

- Follow the repo's convention for where tests live and how they're named
- Test names describe the behavior asserted, not the function name alone

**Quality gates**

- The repo's test, type-check, lint, and format commands must all pass
- Look for: skipped or `.only` tests left behind; loosely-typed mocks that defeat type checking;
  assertions that can never fail (e.g. asserting on the mock's own return)

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## give-web test conventions

**Runner and setup**

- Jest 29, `testEnvironment: 'jsdom'` (`jest.config.js`). Setup files:
  `jest/setupAngularMocks.js` (sets `window.jasmine = true` so angular-mocks wires up), `angular`,
  `angular-mocks`, `jest-date-mock`, `jest/setup.js` (`@testing-library/jest-dom`, a
  `document.styleSheets` stub), and `jest-canvas-mock`
- `restoreMocks: true`, so `jest.spyOn` is reset between tests. A spy set up in `describe` scope
  instead of `beforeEach` only applies to the first test
- `.tpl.html` imports go through `jest/htmlTransform.js`. CSS/SCSS map to
  `__mocks__/styleMock.js`. `@okta/okta-auth-js` maps to `__mocks__/oktaMock.js`
- Commands: `yarn test`, `yarn test:coverage`, `yarn test:log` (unsilenced). Running bare
  `yarn jest` also picks up specs and mocks copied into `.claude` worktrees. Scope it with a path
  when running locally

**Angular unit idioms**

- Services: `beforeEach(angular.mock.module(module.name));` then
  `beforeEach(inject((orderService, $httpBackend, $window) => {...}))` storing refs on a `self`
  object or `let` vars (see `order.service.spec.js`)
- Components: `$componentController(module.name, { $element, $window, someService: {...} },
{ bindingA, onOrderCompleted: jest.fn() })` (see `branded-checkout.spec.js`). Pass a fake
  `$window` object when the code touches `sessionStorage`, `scrollTo`, `MutationObserver`, or
  `document`
- Observables: stub collaborators with `jest.spyOn(...).mockReturnValue(Observable.of(x))` or
  `Observable.throw(err)`, and assert inside `.subscribe(...)` with the `done` callback when the
  result is async
- HTTP: `$httpBackend.expectGET('https://give-stage2.cru.org/cortex/...?zoom=...')
.respond(200, fixture)` then `$httpBackend.flush()`. The expected URL includes the serialized
  zoom string, so a zoom change must update the spec URL. Keep
  `verifyNoOutstandingExpectation()` / `verifyNoOutstandingRequest()` in `afterEach`
- `$log` is the angular-mocks `$log`. Assert on `$log.error.logs` (or a spy) when a branch is
  meant to report to Rollbar

**Fixtures**

- Cortex fixtures live in `src/common/services/api/fixtures/cortex-*.fixture.js` (34 files).
  Session fixtures are in `src/common/services/session/fixtures/`. Use `cloneDeep(fixture)` before
  changing one inside a spec, because fixtures are shared module objects
- Specs that test zoom mapping build the "zoom mapped" expected object from the raw fixture
  (`cartResponse._order[0]._paymentmethodinfo[0]._element`), as in `order.service.spec.js`. Look
  for expected objects typed by hand that no longer match the fixture
- Error-path specs should cover both body shapes that `structuredError.service.ts` handles: a
  structured `{ data: { messages: [{ id, 'debug-message', data: { 'field-name' } , type }] } }`
  and a plain-text `data` string. Recent EP 8.3 fixes (`f832b94e`, `5d30a527`, `a26d38da`) added
  both

**React**

- Only `src/common/components/Recaptcha/` uses React. Tests are `*.test.tsx` with
  `@testing-library/react` 12 and `@testing-library/user-event` 14. Mock `window.grecaptcha`
  with an `enterprise.ready`/`execute` stub. Don't add Enzyme or a second renderer

**Determinism**

- Use `jest-date-mock` (`import { advanceTo, clear } from 'jest-date-mock'`) for anything that
  touches `giftDates.service.js`, `recurringGift.model.js`, `cartService.handleCartResponse`
  (`giftStartDateDaysFromNow`), or `moment()`. See
  `restartGift.component.spec.js`
- Month-boundary and day-28 cases matter for `startDate`/`startMonth`/`possibleTransactionDays`

**What must be covered**

- Branded checkout's public behavior: each new or changed attribute binding, each
  `on-order-completed` / `on-order-failed` payload key, and the callback-throws path (the
  controller wraps host callbacks in try/catch)
- Submit guards: double-submit and the reset of `submitted` / `submittingOrder` on success and
  failure
- Amount parsing: `parseAmounts` (CSV and JSON, invalid entries, empty result) and
  `productConfigForm` validators (min 1, max under 10,000,000, two-decimal pattern)
- Look for: a spec that asserts on a `jest.fn()`'s own return value, or that calls
  `$ctrl.$onInit()` without stubbing `checkoutService.initializeRecaptcha` (it injects a real
  script tag into `document`)

## Mined from PR history

- When a PR adds a guard or fixes a pattern in one place, grep the same controller and its
  sibling files for the same pattern, then fix or list each one. Missed sites have needed
  follow-up PRs before: designationEditor carousel assignments, giftDetailsView vs
  giftSummaryView, and payment-methods.component.js
  <!-- evidence: PR #1272, #1274, #1282, #1284, #1310 -->
- Reject spec lines that assign a matcher instead of calling it (`expect(x).toEqual = y`). They
  pass without asserting anything
  <!-- evidence: PR #1310 -->
- Do not send expected or sentinel values (e.g. `handleOktaRedirect` emitting `false`) to an
  `onFailure` / `$log.error` path. Only real errors belong there, so Rollbar stays quiet and
  users don't see false failures. A `$log.error` message must name the action that failed
  <!-- evidence: PR #1277, #1280, #1281 -->
