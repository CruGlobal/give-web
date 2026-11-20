# CLAUDE.md

## Stack and commands

AngularJS 1.8 components (plain JS, `ng-app` per component) embedded in AEM pages on give.cru.org, plus a few React 17 components bridged in with `react2angular`. Webpack 4, Babel, Jest 29 with jsdom. Node and Yarn 1 versions are in `.tool-versions`. Use Yarn, never npm.

| Task            | Command                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| Install         | `yarn install --frozen-lockfile`                                                              |
| Run locally     | `yarn start`, then open https://localhost.cru.org:9000 (needs the hosts entries in README.md) |
| Test one file   | `yarn test src/app/cart/cart.component.spec.js`                                               |
| Test everything | `yarn test`                                                                                   |
| Lint            | `yarn lint` (ESLint), `yarn prettier:check`, `yarn lint:styles`                               |
| Typecheck       | `yarn lint:ts`                                                                                |
| Build           | `yarn build`                                                                                  |

**Preflight:** `yarn install --frozen-lockfile && yarn lint:ts && yarn test src/common/app.constants.spec.js`. If that passes, the box can build and test.

**Demo data:** there is no local database. The local app talks to the staging Cortex and Okta, so walk features with a staging donor account. Ask the developer for one; never create or guess one.

**Full suite on a PR:** the CI workflow runs every test on every PR. Nothing to turn on.

**Hooks:** pre-commit runs lint-staged and the typecheck. Pre-push runs gitleaks and the full test suite. Do not skip them with `--no-verify`.

## Conventions

- Each feature is a folder with `name.component.js`, `name.tpl.html` and `name.component.spec.js` side by side. Services live in `src/common/services`, Cortex calls in `src/common/services/api`.
- Tests sit next to the file they test: `*.spec.js` for Angular code, `*.test.tsx` for React.
- Angular tests use `angular-mocks` (`module`, `inject`); React tests use Testing Library.
- Call Cortex through `cortexApiService`. See `docs/cortexApiService.md`.
- Older ESLint errors are baselined in `eslint-suppressions.json`. Don't add new ones.

## Agent workflow

`/spec`, then `/answer-key`, then `/implement`, then `/pr`. The skills are in `.claude/skills/`.

- The builder never writes the tests it is graded by. The checker writes the unit tests and reviews; it never writes app code.
- Answer-key tests live in `src/answer-key/<KEY>/`. Never special-case inputs to make tests pass. Once the build starts, nobody edits an answer key without the developer's OK.
- The session commits.
- At each step, post one line: what is done, what is next.
- `/pr` runs `/agent-review:yolo-review` once the PR is up (config is in `.claude/review/`).

## One-way-door paths

A mistake here moves money, touches card or bank data, or breaks sign-in. Work that touches these uses the stricter setup in `.claude/skills/implement/SKILL.md`, and a person from the code owners must approve the PR. pr-guard sets the one-way-door label from `.github/CODEOWNERS`, so this list must match it.

- TSYS, cards and bank accounts: `src/common/services/api/tsys.service.js`, `src/common/components/paymentMethods/creditCardForm/`, `src/common/components/paymentMethods/bankAccountForm/`, `src/common/directives/creditCard*`, `src/app/checkout/step-2/existingPaymentMethods/`
- Fee math: `src/common/components/paymentMethods/coverFees/`
- Sign-in: `src/common/services/session/session.service.js`
- Guardrail files: `.github/`, `.husky/`, `.claude/`, `CLAUDE.md`, `AGENTS.md`, `.gitleaks.toml`, `eslint.config.*`

Tests follow their folder: a test next to card, bank or TSYS code is a one-way door too.

## Do-not-touch list

- `yarn.lock`: change it only through `yarn add` or `yarn remove`.
- `eslint-suppressions.json`: change it only through `yarn lint --prune-suppressions`.
- `.gitleaksignore`: never add entries to hide a new secret.
- `dist/` and `src/assets/okta-sign-in/`: built or copied output.
