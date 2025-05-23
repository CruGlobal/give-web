/**
 * This file extends standard Stylelint configurations for SCSS, enforces idiomatic property order,
 * and includes additional plugins for stricter style validation.
 *
 * - `stylelint-config-standard-scss`: Provides standard SCSS linting rules.
 * - `stylelint-config-idiomatic-order`: Ensures properties are ordered in an idiomatic way.
 * - `stylelint-declaration-strict-value`: Enforces strict value declarations for certain properties.
 * - `@stylistic/stylelint-plugin`: Provides stylistic rules, including formatting for indentation and hex case.
 */

/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-idiomatic-order'
  ],
  ignoreFiles: [
    'src/assets/crubrand/**',
    'src/assets/cru-scss/**',
    '**/okta-sign-in.min.css'
  ],
  plugins: [
    'stylelint-declaration-strict-value',
    '@stylistic/stylelint-plugin'
  ],
  overrides: [
    {
      files: ['src/assets/scss/**/*.{css,scss}'],
      customSyntax: 'postcss-scss',
      rules: {
        'media-feature-range-notation': 'prefix', // Enforces range notation in media queries to use `min-` instead of  `>=` .
        'color-function-notation': 'legacy', // Uses legacy `rgb(r, g, b)` format instead of `rgb(r g b / a)`.
        'declaration-block-no-redundant-longhand-properties': [true, {
          /**
           * Ignore specific shorthand properties that are not widely supported in all major browsers.
           * This helps avoid compatibility issues.
          */
          ignoreShorthands: [
            'inset', 'inset-block', 'inset-inline', 'mask', 'overscroll-behavior',
            'padding-block', 'padding-inline', 'place-content', 'place-items', 'place-self',
            'scroll-margin', 'border-block', 'border-block-end', 'border-block-start',
            'border-inline', 'border-inline-end', 'border-inline-start'
          ]
        }],
        'property-no-vendor-prefix': [true, {
          /**
           * Allows vendor prefixes for specific properties that are not fully supported across browsers.
           * Reference: https://fullystacked.net/prefix/
           */
          ignoreProperties: [
            'backdrop-filter', 'user-select', 'initial-letter', 'text-decoration',
            'text-stroke', 'text-fill-color', 'line-clamp', 'box-decoration-break', 'stretch'
          ]
        }],
        'alpha-value-notation': 'number', // Forces numeric alpha values instead of percentage-based values.
        'scale-unlimited/declaration-strict-value': [
          [
            '/color$/', 'background', 'fill', 'stroke'
          ],
          {
            /**
             * These values are considered acceptable for properties requiring variables.
             * The rule prevents the use of arbitrary values.
             */
            ignoreValues: [
              'inherit', 'transparent', 'initial', 'unset', 'none',
              'no-repeat', 'repeat', 'center', 'scroll'
            ],
            disableFix: true
          }
        ],
        // Stylistic rules enforced by @stylistic/stylelint-plugin.
        '@stylistic/number-leading-zero': 'always', // Ensures a leading zero for decimal values (e.g., `0.5` instead of `.5`).
        '@stylistic/color-hex-case': 'lower',
        '@stylistic/indentation': 2,

        // Disables rules that may cause issues with specificity or project styling conventions.
        'no-invalid-position-at-import-rule': null,
        'no-descending-specificity': null,
        // I would prefer that we keep the rule selector-class-pattern, but since this project has a lot of existing code that doesn't follow this rule, I'm disabling it for now.
        // When we recreate this site, we should follow this rule.
        'selector-class-pattern': null,
        'scss/dollar-variable-pattern': null,
        'selector-id-pattern': null,
        'scss/no-global-function-names': null,
        'selector-type-no-unknown': null,
        'shorthand-property-no-redundant-values': null
      }
    }
  ]
}
