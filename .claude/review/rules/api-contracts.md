# Cortex API Contract — Focus Areas

This agent checks that give-web calls Elastic Path Cortex the way Cortex actually behaves:
HATEOAS links instead of built URLs, the right zoom strings, the right payload keys, and error
bodies read in both the old and the EP 8.3 shapes. Fixtures must look like real responses. The
backend lives in the separate `give-ep-commerce` repo. When a field name is in doubt, check it
there.

**Requests through `cortexApiService`**

- All Cortex traffic goes through `src/common/services/cortexApi.service.js`
  (`get/post/put/delete`, which call `http(config)`). Config keys: `path`, `zoom`, `params`,
  `data`, `followLocation`, `cache`. The URL is `envService.read('apiUrl') + '/cortex' +
serializePath(path)` with `withCredentials: true`
- `path` is either an array of segments (`['carts', this.cortexApiService.scope, 'default']`,
  `['tsys', 'manifest', device]`, `['nextdrawdate']`) or a URI string that came from a link. Use
  `this.cortexApiService.scope` (`cortexScope` in `app.constants.js`), never a literal `crugive`
- An empty `path` fails before sending (`Observable.throw`). A link lookup that returns
  `undefined` turns into that error, so handle a missing link before the call
- On branded checkout, requests get a `nocache` timestamp param unless `cache: true`. A GET that
  returns 403 is retried once. Writes are never retried
- `docs/cortexApiService.md` says `url`, but the code reads `path`. Trust the code
- Look for: `$http` used directly for Cortex; hand-built Cortex URLs with string concatenation;
  `followLocation` dropped from a POST whose caller reads the created resource (cart add,
  purchase); `cache: true` on user-specific data

**Zoom**

- `zoom` is a map of `{ localName: 'rel:rel:rel' }`. `hateoasHelperService.serializeZoom` joins
  the values and strips `[]`. `mapZoomElements` returns `{ localName: element, rawData }`
- A comma inside one value requests nested zooms but maps only the first one. `[]` on the first
  segment means "keep the array" (`lineitems:element[]`). Without it you get element 0 only
- Look for: a renamed or removed zoom that a template or callback still reads (for example
  `profileService.getPurchase` zoom feeds the branded `on-order-completed` payload); a missing
  `[]` that silently drops all but the first line item; a zoom added in code but not in the
  spec's `expectGET` URL

**Links and URIs**

- Follow links with `hateoasHelperService.getLink(resource, 'rel')`. It strips the leading `/`
  from `uri`, or takes the path after `/cortex` from `href`. Example:
  `getLink(data.enhancedpurchaseform, 'submitenhancedpurchaseaction')`
- Read embedded elements with `hateoasHelperService.getElement(response, ['a', 'b'])`, not
  `response._a[0]._b[0]`
- Existing exceptions like `data.emailForm.links[0].uri` in `orderService.getDonorDetails` are
  debt. Don't copy them
- Look for: string-built action URIs (`uri + '/form'`); rel names that are guessed rather than
  taken from a fixture; `self.uri` used where an action link is needed

**Payload keys**

- Cortex fields are kebab-case (`'mailing-address'`, `'card-number'`, `'cover-cc-fees'`,
  `'tsys-device'`, `'recaptcha-token'`). JS objects in templates are camelCase. Convert with
  `change-case-object` or the address helpers, and do it in the service, not the template
- Cart item configuration keys are UPPERCASE (EP 8.1+). `cartService._addItem` upper-cases them
  and wraps them as `{ configuration: {...}, quantity }`
- Addresses: `formatAddressForCortex` / `formatAddressForTemplate`
  (`src/common/services/addressHelpers/`). US needs `region`
- Look for: a camelCase key sent to Cortex; a field removed from a PUT body, which may clear it
  on the server; `angular.copy` skipped before changing a payload that is also bound to the view

**Error bodies**

- Since EP 8.3, many 4xx bodies are structured:
  `{ messages: [{ id, 'debug-message', data: { 'field-name' }, type }] }`. Older endpoints and
  the gateway still send plain text (`InsufficientFundException: ...`) or tiny JSON
  (`{"error":"Invalid Data"}` for a bad reCAPTCHA token, 422)
- Read errors with `src/common/services/structuredError.service.ts`: `getErrors(error)` (errors
  only; it drops `warning`, `information`, `promotion`, `needinfo`; it treats a missing `type` as
  an error) and `getErrorText(error)` (first message, or the raw body if it isn't structured).
  For a 4xx where only a plain string should be shown, use `common/lib/getServerErrorMessage.js`
  (returns `null` for 5xx so the caller shows a translated generic message)
- `orderService.submitOrder` keeps the text before the first `:` so
  `checkout-error-messages.tpl.html` can `ng-switch` on exception names
  (`CardDeclinedException`, `InvalidCVV2Exception`, ...). Adding or renaming one means updating
  that switch and its translation keys
- Look for: `error.data.includes(...)` or `error.data.split(...)` on a body that may now be an
  object; showing `debug-message` to donors in a place where a translated message exists; a
  `needinfo` message treated as a failure; status `-1` (network/abort) handled like a 4xx

**Fixtures**

- Fixtures live in `src/common/services/api/fixtures/cortex-*.fixture.js` and keep Cortex's raw
  zoom shape (`_order[0]._donordetails[0]`, `links: [{ rel, uri, type }]`, `self: { uri,
href, type }`). They should be captured from a real response, then trimmed
- Look for: a fixture edited by hand to make a test pass (fields that Cortex doesn't send,
  camelCase keys, a missing `links` array); a spec for an error path that only uses a plain-text
  body when the endpoint now returns structured messages; a new endpoint with no fixture

**Checklist**

- [ ] New requests use `cortexApiService` with `path` arrays or `getLink` URIs
- [ ] Zoom changes are matched in every consumer and in the spec `expectGET` URL
- [ ] Payload keys are kebab-case (UPPERCASE for cart configuration)
- [ ] Error handling goes through `structuredError.service` or `getServerErrorMessage`, and is
      tested with both body shapes
- [ ] Fixtures look like real Cortex responses

## Mined from PR history

- When mapping Cortex zoom results into a list (`profile.service.js`, `order.service.js`,
  `payment-methods.component.js`), read nested keys like
  `payment-instrument-identification-attributes` and `recurringgifts.donations` with optional
  chaining, so one bad entry doesn't fail the whole list. Add a spec that deletes the key from a
  fixture
  <!-- evidence: PR #1277, #1282 -->
- Read errors only through the shared readers: `structuredError.service` (`getErrors` /
  `getErrorText`) or `common/lib/getServerErrorMessage`. Flag any handler that still reads
  `error.data` directly, and match on `message.id`, not on debug-message text. Don't add branches
  for response shapes the backend doesn't send. An AI-written migration (#1310) added the reader
  but missed one donor-facing handler: grep every `error.data` consumer
  <!-- evidence: PR #1293, #1310 -->
