# Financial Correctness — Focus Areas

This agent checks that every amount a donor sees, picks, or is charged is right, and that
recurring gifts start and repeat on the days the donor chose. give-web shows money and sends gift
configuration. Cortex computes totals and fees and charges cards through TSYS. Most bugs here are
a mismatch between what the client shows and what the server will charge.

**Gift amounts**

- The amount entered on the gift form is `itemConfig.AMOUNT`, set only through
  `productConfigForm.setAmount(amount)`, which also refreshes `itemConfig.priceWithFees`. A
  direct assignment to `itemConfig.AMOUNT` leaves the fee display stale
- Donor-typed amounts are cleaned by the `$parsers` in `productConfigForm.addCustomValidators`
  (strip `$` and `,`) and checked by `$validators.minimum` (≥ 1), `maximum` (< 10000000) and
  `pattern` (`/^([0-9]*)(\.[0-9]{1,2})?$/`). Error text uses `AMOUNT_MIN_ERROR` /
  `AMOUNT_MAX_ERROR` with `currencyLimit`
- Attributes set by the embedder (`amount`, `single-amounts`, `monthly-amounts`,
  `premium-minimum-amount`) are parsed with `parseFloat`/`toFinite` and dropped when they are not
  positive. They do not get the donor-input `$`/comma stripping
- Look for: a new amount path that skips the validators; `String.replace('$','')` that only
  removes the first `,` being relied on for large numbers (`1,000,000`); amounts compared as
  strings vs numbers (`visibleAmounts().includes(this.itemConfig.AMOUNT)` needs matching types);
  `parseInt` on an amount that can have cents

**Premium minimums**

- `premiumMinimum` applies only when `premium-code` is set and the parsed minimum is > 0
  (`branded-checkout.component.js` `$onInit`). Step 1 blocks submit on `premiumMinimumError`
- Look for: the minimum checked against the amount with fees instead of the base amount, or the
  premium code staying on `itemConfig.PREMIUM_CODE` after the donor unchecks it
  (`onSelectPremiumOption`)

**Cover-fee math**

- The fee rate on the client is `FEE_DERIVATIVE = 0.9765` (2.35%) in
  `src/app/productConfig/productConfigForm/productConfigForm.component.js`:
  `amountWithFees = amount / FEE_DERIVATIVE`, formatted with `currency` to 2 places. Dividing
  grosses the amount up, so the fee is covered after processing. Multiplying by 1.0235 is wrong
- Cart, review, and purchase screens use server values: `rate.cost[0]['display-with-fees']` /
  `['amount-with-fees']` and `rateTotals[].cost['display-with-fees']` (mapped in
  `cartService.handleCartResponse`). `coverFeesFilter` picks `priceWithFees` / `totalWithFees`
  / the Single frequency's `totalWithFees` when `orderService.retrieveCoverFeeDecision()` is true
- The decision is stored in `localStorage` `coverFees` and sent as `cover-cc-fees` on purchase.
  It applies to credit cards only: choosing a bank account must call
  `orderService.storeCoverFeeDecision(false)` (`existingPaymentMethods.component.js:213`).
  Branded checkout clears it on load (`orderService.clearCoverFees()`)
- `branded-analytics.factory.js` computes `processing_fee` as
  `(item.amountWithFees - item.amount).toFixed(2)`. That is for analytics only
- Look for: a second copy of the fee rate; fee math applied to an EFT gift; a total shown with
  fees while `cover-cc-fees` will be false (or the reverse); rounding before division; a client
  total that adds per-item `priceWithFees` strings instead of using the server's rate totals

**Recurring gift schedules**

- Frequencies are the Cortex codes `NA` (single), `MON`, `QUARTERLY`, `ANNUAL`. The branded
  `frequency` attribute maps `monthly`/`quarterly`/`annually` to them in
  `branded-checkout-step-1.component.js`. `hide-quarterly` / `hide-annual` filter the options in
  `productConfigForm`
- Transaction day is `'01'`..`'28'` only (`possibleTransactionDays` returns `range(startDay, 29)`,
  zero-padded; productConfigForm accepts `inRange(day, 1, 29)` and `padStart`s it). The branded
  `day` attribute is documented as `1` to `28`
- Start dates come from `startDate` / `startMonth` in
  `src/common/services/giftHelpers/giftDates.service.js` using `moment.utc` and the server
  `nextdrawdate`. `possibleTransactionDays` hides days already past in the draw month.
  `cartService` flags `giftStartDateWarning` when a start is ≥ 275 days away
- Edits to existing gifts go through `RecurringGiftModel` (`updated-amount`, `updated-rate`,
  `updated-recurring-day-of-month`, `updated-start-month`, `updated-start-year`). An `''` means
  unchanged
- Look for: days 29-31 being allowed; local-time `new Date()` used where `nextDrawDate` is
  needed; month numbers off by one (moment months are 0-based, `RECURRING_START_MONTH` is
  1-based: `transactionDate.month(parseInt(month) - 1)`); a quarterly or annual schedule computed
  from the wrong anchor month

**Payment-method handling**

- Cards are tokenized with `@cruglobal/cru-payments` against the TSYS manifest from
  `tsysService.getManifest()`. The device comes from the branded `tsys-device` attribute
  (`tsysService.setDevice`) and is sent as `tsys-device` on purchase. A wrong or missing device
  sends money to the wrong merchant account
- The environment passed to `cruPayments.creditCard.init` is `'production'` for `production`,
  `prodcloud`, and `preprod`, and the raw env name otherwise
- Saved methods: when the card number isn't re-entered, `creditCardForm` sends
  `last-four-digits` as both `tsepToken` and `maskedCardNumber`. `card-bin` is the first 6 digits
  of a newly typed number or `null`. `orderService.storeCardBin` keeps BINs per payment URI
- Bank: account numbers are encrypted with `cruPayments.bankAccount.encrypt`, and only the last 4
  are kept for display. The routing number is checked with cru-payments `length` and `checksum`
- Look for: a changed `ccpEnvironment` mapping; a new payment path that skips `tsys-device`; card
  type taken from a source other than `cruPayments.creditCard.card.info.type`; the billing
  address missing `region` for US cards (Cortex 400 `region must not be blank`)

**Amount formatting**

- `giftAmount` filter: `$` with 0 decimals unless the value has a `.`, then 2. Use it for amounts
  the donor picked. Use angular `currency` for fee-inclusive amounts (always 2 decimals)
- Cortex `display` strings (`rate.cost[0].display`, `cartTotalDisplay`) are already formatted.
  Show them as-is and don't parse them back into numbers
- Look for: `toFixed` used to round a value that is later sent to the server; a `$` hard-coded
  next to an already formatted `display` string; a number formatted with a locale other than US
  English

**Checklist**

- [ ] Every amount the donor sees matches what `orderService.submit` will send (`cover-cc-fees`,
      item `AMOUNT`, frequency, day)
- [ ] Fee math uses the one `FEE_DERIVATIVE` constant on the client, or server
      `*-with-fees` values
- [ ] EFT payment paths clear the cover-fee decision
- [ ] Recurring days stay within 1-28, and start dates use `giftDates.service.js`
- [ ] The TSYS device and environment mapping are unchanged, or the change is intentional and
      called out in the PR
- [ ] New amount inputs go through the existing `$validators` / `$parsers` and have tests for 0,
      1, a decimal, a comma, and the max

## Mined from PR history

- When `productConfigForm` changes frequency, every path through `refreshAmounts` must set both
  `selectableAmounts` and `suggestedAmounts`: either back to `DEFAULT_AMOUNTS` or to the
  campaign-page override. Specs should switch single to quarterly and monthly to quarterly and
  check the amounts shown
  <!-- evidence: PR #1307 -->
