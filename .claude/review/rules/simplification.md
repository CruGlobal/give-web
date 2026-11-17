# Simplification & Reuse — Focus Areas

Generic baseline. `/agent-review:init` appends the repo-specific concerns; keep both.

This is an advisory lane. Its job is to make this diff smaller and simpler — not to restyle the
codebase, and not to propose generalizations. Report only cleanups the author can act on inside
this PR.

**Lane boundary** — neighboring lanes own the adjacent ground:

- Layering, placement, and pattern-consistency judgments belong to `architecture`
- Lint-level hygiene (unused imports, debug output, commented-out code) belongs to `standards`
- This lane owns code that need not exist: additions duplicating something the repo already has,
  abstractions with no second caller, computation the data path doesn't need, and code the PR
  adds but never exercises

**Severity cap — cleanups never block**

- Rate pure reuse/simplification/efficiency findings 1–4
- Use 5–6 only for substantial reimplementation of an existing, tested helper, or a demonstrable
  algorithmic problem on a data path that grows with users or records
- Never rate a pure cleanup ≥ 7 — the blocker machinery is for defects. The cross-cutting duty
  still applies: a real bug noticed while reading is reported at its honest severity

**Proof requirements** — every finding cites evidence the author can check, using your discovery
grep budget:

- A reuse claim names the existing helper at file:line, after you have read it and confirmed its
  semantics actually match this call site (arguments, edge cases, error behavior). A name-alike
  with different behavior is not a finding
- A duplication claim points at duplication this diff introduces; pre-existing duplication the
  change does not worsen is out of scope
- An efficiency claim names where the data comes from and why it can be large; no
  micro-optimizations, no complexity pedantry on collections that are bounded in practice
- A dependency-reuse claim cites the manifest entry for a library the repo already ships that
  does what the new code hand-rolls

**Reuse**

- Look for: a new helper, validator, formatter, or client wrapper that reimplements one that
  already exists in the repo's shared locations; a sibling file copy-pasted and lightly edited
  instead of extended; utility code hand-rolled despite an already-carried dependency that
  provides it

**Simplification**

- Look for: an abstraction with exactly one caller or one implementation (interface, base class,
  factory, registry) introduced by this diff; boolean parameters or config options no current
  caller sets; indirection added for cases that do not exist; a hand-rolled mechanism where the
  language or framework has a direct construct

**Efficiency**

- Look for: invariant work recomputed inside a loop; a query or fetch issued per item where the
  surrounding code already batches; a full-collection load used to read one row; repeated linear
  scans that a single keyed lookup structure would remove — on data that actually grows

**Dead weight**

- Look for: exports nothing imports, parameters no caller passes, branches no current input can
  reach — when this PR introduces them. Confirm with a repo-wide grep before flagging; absence
  from the diff is not absence from the codebase

**Finding budget.** Report at most 5 findings — the ones with the largest net line savings or
clearest wins. Suggestion density is what gets an advisory lane dismissed; if you found more than
5, keep the best and drop the rest silently.

<!-- init: extend this file with the repo's shared-helper locations (where utilities, validators, and formatters live — the directories to grep before accepting new ones) -->

## give-web shared-helper locations

Grep these before you accept a new helper:

- **Cortex/HATEOAS**: `src/common/services/hateoasHelper.service.js` (`getLink`, `getElement`,
  `serializeZoom`, `mapZoomElements`). Use these instead of hand-walking `_order[0]._foo[0]` or
  `links.find(...)`. `cortexApiService.serializePath` already joins path arrays
- **API errors**: `src/common/services/structuredError.service.ts` (`getErrors`, `getErrorText`)
  and `src/common/lib/getServerErrorMessage.js` (4xx plain-text message or `null`)
- **Addresses**: `src/common/services/addressHelpers/` (`formatAddressForCortex`,
  `formatAddressForTemplate`) and the `display-address` component
- **Payments**: `src/common/services/paymentHelpers/` (`paymentMethodSort`,
  `extractPaymentAttributes`, `validPaymentMethods`/`validPaymentMethod`). Card and bank
  validators come from `@cruglobal/cru-payments` (`cruPayments.creditCard.card.validate.*`,
  `cruPayments.bankAccount.routingNumber.validate.*`). Don't hand-roll Luhn or routing checksums
- **Gift dates**: `src/common/services/giftHelpers/giftDates.service.js` (`startDate`,
  `startMonth`, `quarterlyMonths`, `possibleTransactionDays`, `possibleTransactionMonths`) and
  `src/common/models/recurringGift.model.js`
- **Formatting filters**: `src/common/filters/` (`giftAmount`: whole-dollar currency unless
  cents are present; `coverFeesFilter`: price/total/cartTotal with or without fees;
  `capitalize`; `showErrors`: touched-or-submitted-and-invalid). Plus angular's `currency` and
  `date` filters
- **Directives**: `src/common/directives/` (`creditCardNumber`, `creditCardCvv`, `valueMatch`,
  `autoFocus`, `desigSrc`, `desigImgSrc`, `imageUpload`)
- **Events**: `src/common/lib/cartEvents.js` (`giftAddedEvent`, `cartUpdatedEvent`)
- **Checkout plumbing**: `src/common/services/checkoutHelpers/checkout.service.js`
  (`initializeRecaptcha`), `src/common/services/retry.service.js`,
  `src/common/services/modalState.service.js`, `productModal.service.js`
- **Constants**: `src/common/app.constants.js` (`cortexScope` and friends) and
  `src/app/productConfig/giveGiftParams.js` (query-string keys `d`, `c`, `a`, `f`, `dd`, `m`,
  `CampaignCode`)
- **Third-party utilities already shipped**: lodash (per-function imports such as
  `lodash/omit`, `lodash/toFinite`, `lodash/range`), moment, `change-case-object` (`camelCase`,
  `paramCase` for Cortex ↔ JS keys), RxJS 5 operators

**give-web specific wins to look for**

- A new `Observable.of(cached)` / `.do(cache)` memo inside a service when `cortexApiService`
  already supports `cache: true` (see `commonService.getNextDrawDate`)
- A parser for a new branded attribute that adds `$`/comma stripping or `typeof` guards the
  sibling attributes don't have. Match how the nearest attribute is parsed (`parseFloat` for
  `premium-minimum-amount`, `toFinite` in `parseAmounts`) and drop extra normalizing
- A new spec fixture copied from an existing `src/common/services/api/fixtures/*.fixture.js` with
  small edits, when `cloneDeep(fixture)` plus a targeted change in the spec would do
- Duplicate RxJS operator patch imports are harmless. Don't flag them
