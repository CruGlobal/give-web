# Data Integrity — Focus Areas

Generic baseline. This is where domain-specific data invariants belong once `/agent-review:init`
appends them; keep both.

**Access scoping at the data layer**

- Every query and mutation is scoped to the authenticated user/tenant/household. New tables,
  columns, or collections need matching access policies
- Look for: policy changes that widen a `where`/`using`/`with check` clause; queries filtered only
  in application code where a shared or admin connection bypasses the policy

**Validation at external boundaries**

- Payloads from HTTP requests, webhooks, queues, and third-party APIs are parsed against an explicit
  schema before use
- Look for: external JSON consumed without validation; fields read off an untyped/`any` value; types
  that have drifted from the actual storage shape

**Cache correctness**

- Every write that changes displayed data invalidates or updates the cache entry that serves it
- Look for: mutations with no invalidation; cache keys that omit an input which changes the result
  (filter, tenant/account id, date range), which serves stale or cross-scope data; optimistic
  updates that don't match the server's response shape or don't roll back on error

**Idempotency & retries**

- Sync jobs, webhook handlers, and queue consumers must not double-apply work on retry or replay
- Look for: blind inserts where an upsert on a stable external id is needed; no dedupe key; partial
  writes with no transaction or compensating action

**Numeric precision**

- Values where exactness matters (money, quantities, percentages) must not accumulate floating-point
  drift; round at the display boundary, never mid-calculation
- Look for: repeated rounding inside a pipeline; mixing units or currencies without conversion;
  aggregate totals recomputed differently in two places

**Date & time handling**

- Look for: non-deterministic "now" inside calculations (makes behavior untestable and
  timezone-fragile); naive local-time arithmetic across DST; inconsistent serialization formats
  across boundaries

**Null, undefined, and partial writes**

- An omitted field, an explicit null, and an empty string are three different writes. Be intentional
- Look for: whole objects spread into an insert/update without an explicit field allowlist; defaults
  applied in one code path but not another

**Aggregation over partial data**

- Look for: totals summed client-side over a paginated or filtered subset, silently ignoring rows
  beyond the page — prefer a server-computed aggregate

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## give-web specifics

The client has no database. Its data integrity risk is in what it sends to Cortex and what it
stores in the browser between pages.

**Cortex payload shapes**

- Cart item configuration keys are UPPERCASE since EP 8.1 (`AMOUNT`, `RECURRING_DAY_OF_MONTH`,
  `RECURRING_START_MONTH`, `CAMPAIGN_CODE`, `PREMIUM_CODE`). `cartService._addItem` upper-cases
  every key in `data`. Look for: a new lowercase config key read from `item.configuration`, or a
  stray non-config property (like `priceWithFees` on `itemConfig`) that ends up posted as config
- Addresses cross the boundary only through `common/services/addressHelpers/formatAddressForCortex`
  and `formatAddressForTemplate`. `formatAddressForCortex` emits `region: isUsAddress &&
address.region`, and an `undefined` region drops out of the JSON. Cortex then returns 400
  `region must not be blank` for US billing addresses. Any change to address assembly or the
  "same as mailing address" path in `creditCardForm` must keep `region` populated for US
- Donor details from a branded host (`window[donor-details]`) go through
  `changeCaseObject.paramCase` except `mailingAddress`. Don't param-case the address
- Recurring gift updates in `src/common/models/recurringGift.model.js` write only `updated-*`
  fields (`updated-amount`, `updated-rate`, `updated-recurring-day-of-month`,
  `updated-start-month`, `updated-start-year`, `updated-payment-instrument-id`,
  `updated-donation-line-status`). An empty string means "unchanged". Look for a setter that
  writes `''` vs `undefined` vs the original value inconsistently. `set amount` writes `''` when
  the value equals `gift.amount`

**Partial and replayed writes**

- `orderService.submit()` reads `recaptchaToken`/`recaptchaAction` from `sessionStorage` and
  clears them only on success. A retry after a failure replays the same token, and the gateway
  returns 422 `Invalid Data` (DUPE). New retry paths must get a fresh token through the
  `Recaptcha` component
- Purchase POSTs use `followLocation: true`. Check for double submits: any new trigger of
  `orderService.submitOrder` needs the `submittingOrder` guard and its `.finally` reset
- `cartService.editItem` is delete-then-add (`deleteItem(oldUri).switchMap(() => addItem(...))`).
  A failure after the delete loses the gift. Changes here need an error path that tells the donor

**Browser storage as state**

- `sessionStorage`/`localStorage` keys are managed in `order.service.js`, `session.service.js`,
  `contactInfo.component.js`, `productConfigForm.component.js`, and `analytics.factory.js`. A new
  key needs a clear owner and a cleanup point (see `clearCardBins`, `clearCoverFees`,
  `clearCardSecurityCodes`). Branded checkout calls `orderService.clearCoverFees()` in its
  constructor so a host page doesn't inherit a stale decision
- `coverFees` lives in `localStorage`, so it survives across tabs and visits. Any path that
  changes the payment method to EFT must call `storeCoverFeeDecision(false)`, as
  `existingPaymentMethods.component.js` does

**Dates**

- Gift start dates come from `giftHelpers/giftDates.service.js` (`startDate`, `startMonth`,
  `possibleTransactionDays`, `possibleTransactionMonths`) using `moment.utc` and the server's
  `nextdrawdate` (`commonService.getNextDrawDate()`, cached). Don't compute a start date from the
  browser's local `new Date()` alone
- Transaction days are `'01'`..`'28'`, zero-padded strings (`range(startDay, 29)` and
  `padStart(...)` in productConfigForm). Look for numbers where strings are expected, or days 29-31

**Money**

- Cart and purchase totals are server-computed (`rate.cost[0].amount`,
  `['amount-with-fees']`, `rateTotals`). Don't re-sum line items on the client for anything sent
  back or shown as a total
- See `rules/financial.md` for amount and fee rules

## Mined from PR history

- In `productConfig.modal.component.js` `initializeParams` (and anywhere else `CAMPAIGN_CODE` is
  set), keep the order: URL `CampaignCode` first, then the give button's `campaign-code`, then
  `default-campaign-code`. Apply a fallback only when `itemConfig.CAMPAIGN_CODE` is empty
  <!-- evidence: PR #1314 -->
- Patterns in `src/common/app.constants.js` (phone, email, and similar) must be anchored at both
  ends and use bounded quantifiers. Add accepted and rejected cases to
  `src/common/app.constants.spec.js` in the same diff
  <!-- evidence: PR #1287, #1293 -->
