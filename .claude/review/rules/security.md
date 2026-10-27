# Security — Focus Areas

Generic baseline. `/agent-review:init` appends the repo-specific concerns; keep both.

**Authentication & authorization boundaries**

- Every server endpoint, background job, and privileged action independently verifies the caller's
  identity — never trusts a user id, tenant id, or role passed in from the client
- Authorization is enforced at the data layer (row/tenant scoping, ACL check), not only by hiding UI
- Look for: endpoints added without a session/permission check; ownership checks that compare
  against client-supplied identifiers; policy changes that widen who can read or write a record

**Privileged clients & credentials**

- Admin/service-level clients that bypass normal access control must stay server-only and must never
  be importable from browser or otherwise untrusted code
- Look for: privileged clients imported into client-side modules; secrets read in code that ships to
  the browser; credentials committed to the repo or baked into build artifacts

**Secrets exposure**

- Server-only environment variables must not be exposed through client-visible prefixes, build-time
  inlining, or error payloads
- Look for: new environment-variable references; API keys or tokens in logs, error messages, HTTP
  responses, or analytics events

**Input validation & injection**

- Untrusted input (request bodies, query params, headers, webhooks, third-party payloads, file
  uploads) is validated against an explicit schema before use
- Look for: raw string interpolation into SQL/shell/HTML/templates; parsers fed unvalidated JSON;
  client-side validation with no server-side counterpart; unbounded sizes and counts

**Cross-site and browser-surface risks**

- Look for: raw-HTML injection sinks; unsanitized user content rendered as markup; open redirects
  where a redirect target comes from a query parameter without an allowlist check; missing CSRF
  protection on state-changing requests; weakened CSP or security headers

**Session & cookie handling**

- Look for: session cookies missing `HttpOnly`/`Secure`/`SameSite`; tokens stored where scripts can
  read them; sessions that are not invalidated on logout, password change, or privilege change;
  long-lived or non-rotating credentials

**Webhooks & third-party integrations**

- Look for: webhook handlers that parse and act on a payload before verifying the signature against
  the raw body; missing replay protection; secrets or tokens forwarded to the client

**Supply chain & CI**

- Look for: new dependencies (who maintains them, what they pull in); CI workflow changes that widen
  permission scopes, echo secrets, or let untrusted contributors trigger privileged jobs; changes to
  the review configuration itself that weaken risk scoring or strip checks

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## give-web specifics

Everything in this repo ships to the browser, and branded checkout also runs on third-party host
pages. Authorization lives in Cortex and cortex_gateway. The client's job is to not leak card
data, not trust host or Cortex HTML blindly, and keep the session cookies sane.

**Card and bank data**

- Card numbers are tokenized through `@cruglobal/cru-payments` (`cruPayments.creditCard.init` +
  `encrypt`, using the manifest from `tsysService.getManifest()`). Bank account numbers are
  encrypted with `cruPayments.bankAccount.encrypt`. Look for: a raw card number or account number
  placed in a Cortex payload, analytics event, `$log` call, or storage. Only `tsepToken`,
  `maskedCardNumber`, `card-bin` (first 6), `last-four-digits`, and
  `display-account-number` (`.slice(-4)`) may leave the form
- `orderService` keeps `cvv`/`storedCvvs` and `cardBin`/`storedBins` in `sessionStorage` for the
  purchase step. Don't extend this: no CVV in `localStorage`, cookies, analytics, or a longer
  lifetime. Any new exit path from checkout should call `clearCardSecurityCodes()` /
  `clearCardBins()`
- `rollbar.config.js` `scrubFields` (`password`, `cvv`, `cvv2`, `security-code`, `k`) and
  `scrubDomNodes` are the redaction list. New sensitive field names in payloads or form `name`
  attributes must be added there. Datadog RUM uses `defaultPrivacyLevel: 'mask-user-input'`. Don't
  lower it
- The `ccpEnvironment` mapping in `creditCardForm.component.js` (`production`, `prodcloud`,
  `preprod` → `'production'`) decides which TSYS environment gets real cards. Check any change to
  it or to `envServiceProvider.config` domains with care

**HTML sinks**

- Existing sinks: `ng-bind-html` in `designationEditor.tpl.html` (paragraphText, psText),
  `checkout/help/help.tpl.html` (`helpHTML`), `productConfigForm.tpl.html` (`jcr-title`,
  `displayId()`), and `thankYouSummary.tpl.html` (`customThankYouHtml`, trusted with
  `$sce.trustAsHtml` at `thankYouSummary.component.js:59`). `signUpModal.component.js` writes
  `innerHTML` through `$sanitize`
- `ng-bind-html` without `$sce.trustAsHtml` goes through `angular-sanitize`. That is the safe
  default. A new `$sce.trustAsHtml` or `innerHTML =` on anything that isn't trusted host markup is
  a finding. The branded `thank-you-message` path is trusted only because the host page's own
  `<template>` supplies it (`resolveThankYouMessage`). Never route Cortex, query-string, or donor
  input into that path
- Translations may contain HTML and are rendered with `translate-compile` in places
  (`branded-checkout-step-1.tpl.html` `LOADING_ERROR`). `$translateProvider.useSanitizeValueStrategy
('sanitizeParameters')` sanitizes interpolated parameters only. Never put user or API text in
  a translation value, and pass it only as a `translate-values` parameter

**Session and cookies**

- `session.service.js` owns the `cortex-role`, `give-session`, and `cru-profile` cookies
  (`cookieDomain = '.cru.org'`) and their parent-domain shadow handling (`hasDuplicateCortexRole`,
  `cortexRoleShadowReported`). They are decoded with `jwtDecode` for display only. Don't make an
  authorization decision on the client from a decoded JWT that the server doesn't also check
- `cortexApiService.send` uses `withCredentials: true`. A new `$http` call to any other origin
  must not send credentials unless that origin is ours
- Branded `api-url` is normalized by `normalizeApiUrl` to a protocol-relative `//host`. Changes
  there must not allow a `javascript:` or other non-HTTP scheme to reach `$http`

**Redirects and sign-in**

- `sessionService` stores `redirectLocation` and `locationSearchOnLogin` in `sessionStorage` and
  sends the user back there after Okta. Look for: a redirect target taken from a query parameter
  (e.g. in `oktaAuthCallback`) without checking it's on a Cru domain
- Okta config lives in `src/common/lib/oktaSignInWidgetHelper`. Client IDs and issuers are public.
  Any secret there is a finding

**reCAPTCHA**

- Every purchase POST must include `recaptcha-token`/`recaptcha-action` from the `Recaptcha`
  component (`src/common/components/Recaptcha/Recaptcha.tsx`). The component calls `onSuccess`
  even when verification throws. Don't add a submit path that skips the component entirely.
  `checkoutService.initializeRecaptcha()` injects the Enterprise script once by id

**Secrets and build**

- Build-time env (`webpack.config.js` `EnvironmentPlugin`): `ROLLBAR_ACCESS_TOKEN`,
  `DATADOG_RUM_CLIENT_TOKEN`, `S3_GIVE_DOMAIN`, `GITHUB_SHA`. These are browser-public client
  tokens. Any new entry is inlined into the public bundle, so it must not be a server secret
- `recaptchaKey` values in `app.config.js` are site keys (public). A secret key there is a finding
- CI: `.github/workflows/build.yml` has `id-token: write` and `contents: write` and deploys to
  S3/CloudFront on `master`/`staging`. Look closely at workflow changes that run on
  `pull_request` with those permissions, or that add `pull_request_target`
