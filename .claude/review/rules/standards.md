# Standards — Checklist

Generic baseline. Every item here is mandatory unless the repo's own conventions override it —
`/agent-review:init` appends the repo-specific checklist, and both layers are kept.

This is an explicit checklist: report compliance for each **bold group below** in the
`### Rule Checklist Results` section of your output (✅ / ⚠️ / ❌ / N/A), and raise anything
non-compliant as a finding at the severity its impact warrants.

**Exports & Naming**

- [ ] Export style matches the repo's convention (named vs default) — don't introduce a second style
- [ ] File and directory naming follows the existing convention (casing, suffixes, special filenames
      the framework requires)
- [ ] Public identifiers are descriptive; abbreviations match ones already used in the codebase
- [ ] Imports use the repo's alias/path convention rather than deep relative traversal

**Types**

- [ ] No escape hatches that disable type checking in new code (untyped `any`-equivalents, suppression
      comments) without an inline comment explaining why
- [ ] No non-null/force-unwrap assertions on values that can legitimately be absent — check explicitly
- [ ] Types are derived from a single source of truth rather than hand-duplicated alongside it

**Input & Forms**

- [ ] User input is validated with the repo's established validation approach, not ad-hoc checks
- [ ] Every client-side validation rule has a server-side counterpart
- [ ] Submit/confirm actions are disabled or guarded while in flight so they can't double-fire

**Data**

- [ ] Writes invalidate or update the cached data they affect
- [ ] Cache/query keys are stable, descriptive, and scoped to the resource and its inputs
- [ ] Queries rely on the real authorization boundary, not on a client-side filter

**Dates & Numbers**

- [ ] Date math uses the repo's chosen date library and format conventions, not ad-hoc arithmetic
- [ ] Numeric formatting and rounding happen at the display boundary, consistently

**Testing**

- [ ] Every new function, hook, and non-trivial component has a test in the repo's conventional
      location
- [ ] Tests use the repo's runner and mocking idioms
- [ ] Test code is typed as strictly as production code

**Code Quality**

- [ ] Lint, type-check, and format commands pass
- [ ] No debug output left behind (console/print statements, debuggers, `TODO` without a tracked issue
      reference)
- [ ] No unused imports, variables, or dead parameters
- [ ] No commented-out code blocks (delete, don't comment)
- [ ] No empty catch blocks that swallow errors silently
- [ ] Package-manager usage matches the repo's lockfile (don't mix tools)

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## give-web checklist

Report these groups in `### Rule Checklist Results` alongside the generic ones.

**AngularJS module shape**

- [ ] One unit per file, registered as `const componentName = 'camelName';` (or `serviceName`,
      `filterName`, `directiveName`) and default-exported as
      `export default angular.module(componentName, [dep.name, ...]).component(componentName, {...})`.
      Services use `.service(serviceName, ClassName)`. See `order.service.js`,
      `coverFees.component.js`, `giftAmount.filter.js`
- [ ] Controllers and services are ES classes with a `/* @ngInject */` comment on the
      `constructor`, and each injected dependency is assigned to `this.<name>`. Filters that are
      functions use array annotation (`.filter(filterName, ['$filter', GiftAmount])`). Builds use
      `strictDi: true` (`src/loaders/branded.js`), so missing annotation breaks production only
- [ ] Module deps are listed by imported `.name` (`cortexApiService.name`), with string literals
      only for third-party modules (`'environment'`, `'pascalprecht.translate'`)
- [ ] Templates: `import template from './x.tpl.html';` and `templateUrl: template` in the
      component definition (ngtemplate-loader, used in 101 components). Not `template: template`
- [ ] Component bindings follow the existing letters: `'<'` for one-way data, `'@'` for string
      attributes, `'&'` for callbacks that are invoked as `this.onX({ $event: {...} })`
- [ ] Lifecycle work goes in `$onInit` / `$onChanges` / `$onDestroy`, not the constructor (the
      constructor only stores injected deps, as in `BrandedCheckoutController`)

**Naming and files**

- [ ] Files: `camelCase.component.js`, `camelCase.service.js`, `*.factory.js`, `*.filter.js`,
      `*.directive.js`, `*.modal.component.js`, `*.tpl.html`, `*.fixture.js`. Branded files are
      kebab-case (`branded-checkout-step-1.component.js`) and stay that way
- [ ] Controllers are `PascalNameController`. Service classes are bare nouns (`class Order`,
      `class CortexApi`, `class Tsys`)
- [ ] Exported constants for shared strings (`export const Roles`, `cartUpdatedEvent`,
      `submitOrderEvent`) instead of repeated string literals across files
- [ ] React components (only under `src/common/components/Recaptcha/`) are `PascalCase.tsx`,
      export the component by name, and default-export the `react2angular(...)` module

**Imports**

- [ ] Paths resolve from `src/`: `common/...`, `app/...` (jest `modulePaths` plus webpack). Use
      `./` and `../` only for siblings and near neighbours, as in `order.service.js`
      (`'../cortexApi.service'`, `'./cart.service'`)
- [ ] lodash is imported per function: `import omit from 'lodash/omit'`. Never
      `import _ from 'lodash'` or `import { omit } from 'lodash'`
- [ ] RxJS 5 patch-style operators: `import { Observable } from 'rxjs/Observable';` plus
      `import 'rxjs/add/operator/map';` for every operator the file uses. No pipeable
      `rxjs/operators` imports. Don't upgrade the style piecemeal
- [ ] Helper modules with several exports use named exports
      (`import * as structuredErrorService from 'common/services/structuredError.service'`,
      `import { startDate } from 'common/services/giftHelpers/giftDates.service'`). Single-purpose
      helpers default-export (`getServerErrorMessage`, `sortPaymentMethods`)

**Types**

- [ ] New `.ts`/`.tsx` must pass `yarn lint:ts` (`tsc`, `strict: true`). `any` is accepted at the
      Cortex boundary (`structuredError.service.ts` takes `error: any`) but must not leak into
      the types it returns. Return a narrowed interface as `StructuredErrorMessage` does
- [ ] Most code is plain JS (`allowJs`, no `checkJs`). Don't add JSDoc type annotations or
      `// @ts-` comments to `.js` files to satisfy a checker that doesn't run on them

**Validation and forms**

- [ ] Field validation uses AngularJS form controls: `ngModel.$validators.<name>`,
      `$parsers` for input cleanup, and `ng-messages` / `ng-message="<name>"` in the template, with
      `has-error` driven by the `showErrors` filter. See `productConfigForm.addCustomValidators`,
      `creditCardForm` and `bankAccountForm`
- [ ] Card and bank rules come from `@cruglobal/cru-payments` validators, not new regexes
- [ ] Error messages shown to donors are translation keys (`<span translate>{{'KEY'}}</span>`),
      added to both `en` and `es` in `src/common/app.config.js`
- [ ] Submit buttons are guarded while in flight (`canSubmitOrder()` checking `submitted` /
      `submittingOrder`, reset in `.finally`)

**API calls**

- [ ] Cortex requests go through
      `cortexApiService.get/post/put/delete({ path, zoom, data, followLocation, cache })`.
      `path` is an array (`['carts', this.cortexApiService.scope, 'default']`) or a URI taken
      from `hateoasHelperService.getLink(...)`. Note that `docs/cortexApiService.md` still says
      `url`, but the code reads `path`
- [ ] Errors are read with `structuredErrorService.getErrorText(error)` /
      `getErrors(error)`, or with `getServerErrorMessage(error)` for 4xx text. No new direct
      `error.data.includes(...)` checks
- [ ] Errors are logged with `$log.error('Plain description', error)`, which goes to Rollbar.
      `console.*` is only for branded host-config errors, as `branded-checkout.component.js` does

**Dates and numbers**

- [ ] Dates use `moment` (often `moment.utc`) and the helpers in `giftDates.service.js`. Only the
      `en` moment locale ships (`MomentLocalesPlugin`)
- [ ] Money is displayed with angular's `currency` filter or `giftAmount`. Amount strings from
      Cortex `display` fields are shown as-is, not re-formatted

**Tests**

- [ ] Specs sit next to the source as `<name>.spec.js` (sometimes `<name>.component.spec.js`).
      TypeScript specs are `*.spec.ts`. React tests are `*.test.tsx` with Testing Library
- [ ] Angular specs use `beforeEach(angular.mock.module(module.name));` with
      `inject((dep, $httpBackend) => {...})` and, for components,
      `$componentController(module.name, locals, bindings)`. Collaborators are stubbed with
      `jest.spyOn(svc, 'method').mockReturnValue(Observable.of(...))` /
      `Observable.throw(...)`
- [ ] HTTP specs use `$httpBackend.expectGET('<full URL with zoom>').respond(200, fixture)` and
      `$httpBackend.flush()`, with `verifyNoOutstandingExpectation()` and
      `verifyNoOutstandingRequest()` in `afterEach`
- [ ] Fixtures for Cortex responses live in `src/common/services/api/fixtures/*.fixture.js`
      (named `cortex-<resource>.fixture.js`) and are excluded from coverage
- [ ] Time is controlled with `jest-date-mock` (`advanceTo`, `clear`)
- [ ] Run the specs with `yarn test`, not `npx jest`

**Commands and tooling**

- [ ] `yarn prettier:check` passes. Prettier 3 with `singleQuote: true` (`.prettierrc.js`). The
      husky pre-commit runs `yarn lint-staged` (prettier on `*.{js,json,html,md}`, stylelint on
      css/scss)
- [ ] `yarn lint:styles` passes for SCSS under `src/assets/scss` and component styles
- [ ] `yarn lint:ts` passes
- [ ] `yarn test` passes (CI runs `yarn test:coverage` and uploads to Codecov)
- [ ] `yarn build` succeeds when webpack entries, loaders, or env vars change
- [ ] Use yarn 1 (`yarn.lock`, `yarn@1.22.22`, Node `24.3.0` from `.tool-versions`). No
      `package-lock.json`, no `npx`/`npm install`
- [ ] ESLint config (`.eslintrc.json`) exists but no script or CI step runs it. Don't fail a PR
      on ESLint rules alone. Apply the ones that matter by reading: no `debugger`, no unused vars
      outside the `^_` pattern, no empty blocks
- [ ] The PR title follows `EP-<JIRA#> <summary>` from `.github/PULL_REQUEST_TEMPLATE.md`, and the
      testing notes cover both regular and branded checkout when shared code changes

## Mined from PR history

- In `*.tpl.html`, bind input values with `ng-model`, never `value="{{$ctrl...}}"`, and close every
  element and component tag explicitly (e.g. `<sign-in-form></sign-in-form>`)
  <!-- evidence: PR #1255, #1263 -->
- Don't flag PR titles for their ticket prefix. The team uses `EP-####`, `[RB-#####]`,
  `[HS-#######]` and `[No Jira]`
  <!-- evidence: PR #1275, #1276, #1278, #1279, #1280, #1281 -->
