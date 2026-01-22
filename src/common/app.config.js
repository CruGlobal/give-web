import angular from 'angular';
import 'angular-environment';
import 'angular-translate';

import rollbarConfig from './rollbar.config';
import dataDogConfig from './datadog.config.js';

// Exported for datadog.config tests.
export const appConfig = /* @ngInject */ function (
  envServiceProvider,
  $compileProvider,
  $logProvider,
  $httpProvider,
  $locationProvider,
  $qProvider,
  $translateProvider,
) {
  $httpProvider.useApplyAsync(true);

  envServiceProvider.config({
    domains: {
      development: [
        'localhost',
        'localhost.cru.org',
        'cru-givedev.s3-website-us-east-1.amazonaws.com',
      ],
      devcloud: ['give-dev-cloud.cru.org'],
      stagecloud: ['give-stage-cloud.cru.org'],
      prodcloud: ['give-prod-cloud.cru.org'],
      staging: [
        'give-stage2.cru.org',
        'stage.cru.org',
        'uatauth.aws.cru.org',
        'uatpub.aws.cru.org',
        'uatdisp.aws.cru.org',
        'cru-givestage.s3.amazonaws.com',
        'give-stage-static.cru.org',
        'wp-stage.familylife.com',
      ],
      nonprod: [
        'give-stage2-next.cru.org',
        'cru-give-web-assets-nonprod.s3.amazonaws.com',
        'give-nonprod-static.cru.org',
      ],
      preprod: [
        'give-prod-static.cru.org',
        'cru-give-web-assets-preprod.s3.amazonaws.com',
        'give-preprod.cru.org',
      ],
      production: [],
    },
    vars: {
      development: {
        apiUrl: 'https://give-stage2.cru.org',
        imgDomain: '',
        imgDomainDesignation: 'https://localhost.cru.org:9000',
        publicCru: 'https://stage.cru.org',
        publicGive: 'https://give-stage2.cru.org',
        acsUrl:
          'https://cru-mkt-stage1.adobe-campaign.com/lp/LP63?_uuid=f1938f90-38ea-41a6-baad-9ac133f6d2ec&service=%404k83N_C5RZnLNvwz7waA2SwyzIuP6ATcN8vJjmT5km0iZPYKUUYk54sthkZjj-hltAuOKDYocuEi5Pxv8BSICoA4uppcvU_STKCzjv9RzLpE4hqj&pkey=',
        oktaUrl: 'https://cru.oktapreview.com',
        oktaClientId: '0oa26fp9l9iFxuKJf0h8',
        oktaReferrer: 'https://localhost.cru.org:9000',
        recaptchaKey: '6LcCMoYqAAAAABMoyLs5CyKWwE8qn_YslEaiRPRD',
      },
      devcloud: {
        apiUrl: 'https://give-stage2.cru.org',
        imgDomain: '//give-static.cru.org',
        imgDomainDesignation: 'https://give-dev-cloud.cru.org',
        publicCru: 'https://stage-cloud.cru.org',
        publicGive: 'https://give-dev-cloud.cru.org',
        acsUrl:
          'https://cru-mkt-stage1.adobe-campaign.com/lp/LP63?_uuid=f1938f90-38ea-41a6-baad-9ac133f6d2ec&service=%404k83N_C5RZnLNvwz7waA2SwyzIuP6ATcN8vJjmT5km0iZPYKUUYk54sthkZjj-hltAuOKDYocuEi5Pxv8BSICoA4uppcvU_STKCzjv9RzLpE4hqj&pkey=',
        oktaUrl: 'https://cru.oktapreview.com',
        oktaClientId: '0oa26fp9l9iFxuKJf0h8',
        oktaReferrer: 'https://give-dev-cloud.cru.org',
        recaptchaKey: '6LcCMoYqAAAAABMoyLs5CyKWwE8qn_YslEaiRPRD',
      },
      stagecloud: {
        apiUrl: 'https://give-stage-cloud.cru.org',
        imgDomain: '//give-static.cru.org',
        imgDomainDesignation: 'https://give-stage-cloud.cru.org',
        publicCru: 'https://stage-cloud.cru.org',
        publicGive: 'https://give-stage-cloud.cru.org',
        acsUrl:
          'https://cru-mkt-stage1.adobe-campaign.com/lp/LP63?_uuid=f1938f90-38ea-41a6-baad-9ac133f6d2ec&service=%404k83N_C5RZnLNvwz7waA2SwyzIuP6ATcN8vJjmT5km0iZPYKUUYk54sthkZjj-hltAuOKDYocuEi5Pxv8BSICoA4uppcvU_STKCzjv9RzLpE4hqj&pkey=',
        oktaUrl: 'https://cru.oktapreview.com',
        oktaClientId: '0oa26fp9l9iFxuKJf0h8',
        oktaReferrer: 'https://give-stage-cloud.cru.org',
        recaptchaKey: '6LcCMoYqAAAAABMoyLs5CyKWwE8qn_YslEaiRPRD',
      },
      prodcloud: {
        apiUrl: 'https://give-prod-cloud.cru.org',
        imgDomain: '//give-static.cru.org',
        imgDomainDesignation: 'https://give-prod-cloud.cru.org',
        publicCru: 'https://www.cru.org',
        publicGive: 'https://give-prod-cloud.cru.org',
        acsUrl:
          'https://cru-mkt-prod1-m.adobe-campaign.com/lp/LPEmailPrefCenter?_uuid=8831d67a-0d46-406b-8987-fd07c97c4ca7&service=%400fAlW4GPmxXExp8qlx7HDlAM6FSZUd0yYRlQg6HRsO_kglfi0gs650oHPZX6LrOvg7OHoIWWpobOeGZduxdNU_m5alc&pkey=',
        oktaUrl: 'https://signon.okta.com',
        oktaClientId: '0oa22s4b0hbsS58xv0h8',
        oktaReferrer: 'https://give-prod-cloud.cru.org',
        recaptchaKey: '6LduSiQqAAAAAOLA7NEU8-3-mdCmBKEUCwaFQuJF',
      },
      staging: {
        apiUrl: 'https://give-stage2.cru.org',
        imgDomain: '//give-stage-static.cru.org',
        imgDomainDesignation: 'https://give-stage2.cru.org',
        publicCru: 'https://stage.cru.org',
        publicGive: 'https://give-stage2.cru.org',
        acsUrl:
          'https://cru-mkt-stage1.adobe-campaign.com/lp/LP63?_uuid=f1938f90-38ea-41a6-baad-9ac133f6d2ec&service=%404k83N_C5RZnLNvwz7waA2SwyzIuP6ATcN8vJjmT5km0iZPYKUUYk54sthkZjj-hltAuOKDYocuEi5Pxv8BSICoA4uppcvU_STKCzjv9RzLpE4hqj&pkey=',
        oktaUrl: 'https://cru.oktapreview.com',
        oktaClientId: '0oa26fp9l9iFxuKJf0h8',
        oktaReferrer: 'https://give-stage2.cru.org',
        recaptchaKey: '6LcCMoYqAAAAABMoyLs5CyKWwE8qn_YslEaiRPRD',
      },
      nonprod: {
        apiUrl: 'https://give-stage2-next.cru.org',
        imgDomain: '//give-nonprod-static.cru.org',
        imgDomainDesignation: 'https://give-stage2-next.cru.org',
        publicCru: 'https://stage.cru.org',
        publicGive: 'https://give-stage2-next.cru.org',
        acsUrl:
          'https://cru-mkt-stage1.adobe-campaign.com/lp/LP63?_uuid=f1938f90-38ea-41a6-baad-9ac133f6d2ec&service=%404k83N_C5RZnLNvwz7waA2SwyzIuP6ATcN8vJjmT5km0iZPYKUUYk54sthkZjj-hltAuOKDYocuEi5Pxv8BSICoA4uppcvU_STKCzjv9RzLpE4hqj&pkey=',
        oktaUrl: 'https://cru.oktapreview.com',
        oktaClientId: '0oa26fp9l9iFxuKJf0h8',
        oktaReferrer: 'https://give-stage2-next.cru.org',
      },
      preprod: {
        apiUrl: 'https://give-preprod.cru.org',
        imgDomain: '//give-prod-static.cru.org',
        imgDomainDesignation: 'https://give-preprod.cru.org',
        publicCru: 'https://www.cru.org',
        publicGive: 'https://give-preprod.cru.org',
        acsUrl:
          'https://cru-mkt-prod1-m.adobe-campaign.com/lp/LPEmailPrefCenter?_uuid=8831d67a-0d46-406b-8987-fd07c97c4ca7&service=%400fAlW4GPmxXExp8qlx7HDlAM6FSZUd0yYRlQg6HRsO_kglfi0gs650oHPZX6LrOvg7OHoIWWpobOeGZduxdNU_m5alc&pkey=',
        oktaUrl: 'https://signon.okta.com',
        oktaClientId: '0oa22s4b0hbsS58xv0h8',
        oktaReferrer: 'https://give-preprod.cru.org',
      },
      production: {
        apiUrl: 'https://give.cru.org',
        imgDomain: '//give-static.cru.org',
        imgDomainDesignation: 'https://give.cru.org',
        publicCru: 'https://www.cru.org',
        publicGive: 'https://give.cru.org',
        acsUrl:
          'https://cru-mkt-prod1-m.adobe-campaign.com/lp/LPEmailPrefCenter?_uuid=8831d67a-0d46-406b-8987-fd07c97c4ca7&service=%400fAlW4GPmxXExp8qlx7HDlAM6FSZUd0yYRlQg6HRsO_kglfi0gs650oHPZX6LrOvg7OHoIWWpobOeGZduxdNU_m5alc&pkey=',
        oktaUrl: 'https://signon.okta.com',
        oktaClientId: '0oa22s4b0hbsS58xv0h8',
        oktaReferrer: 'https://give.cru.org',
        recaptchaKey: '6LduSiQqAAAAAOLA7NEU8-3-mdCmBKEUCwaFQuJF',
      },
      defaults: {
        isCheckout: false,
        isBrandedCheckout: false,
      },
    },
  });

  // default the environment to production
  envServiceProvider.set('production');

  // run the environment check, so the comprobation is made
  // before controllers and services are built
  envServiceProvider.check();

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false,
    rewriteLinks: false,
  });

  if (envServiceProvider.is('production') || envServiceProvider.is('staging')) {
    $logProvider.debugEnabled(false);
    $compileProvider.debugInfoEnabled(false);
  } else {
    $logProvider.debugEnabled(true);
  }

  $qProvider.errorOnUnhandledRejections(false);

  $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
  $translateProvider.translations('en', {
    GIVE_GIFT_HEADER: 'Give a Gift',
    LOADING_GIFT_DETAILS: 'Loading gift details...',
    LOADING_ERROR:
      'There was an error loading the details needed to configure your gift. You may <a href ng-click="{{loadData}}">try again</a>. If you continue to experience issues, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    FROM_WHAT_COUNTRY:
      'We are so grateful for your generosity. We recognize that many people from different countries are partnering with our ministry for the fulfillment of the Great Commission. From which country would you like to give?',
    GIVE_THROUGH_US_SITE: 'Give through US give site',
    GIVE_THROUGH_SITE: 'Give through {{name}} give site',
    FREQUENCY_ERROR:
      'There was an error configuring the frequency of your gift. You may try changing the frequency again but if you continue to experience issues, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    ADDING_CART_ERROR:
      'There was an unknown error adding your gift to the cart. Please verify all your info and try again. If you are still seeing this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    GIFT_IN_CART_ERROR: 'You already have this gift in your cart.',
    FORCED_USER_TO_LOGOUT:
      'There was an error adding this item to your account due to session data. Please re-add the item to your cart.',
    GIFT_AMOUNT: 'Gift Amount',
    OTHER_PLACEHOLDER: 'Other',
    GIFT_FREQUENCY: 'Gift Frequency',
    VALID_DOLLAR_AMOUNT_ERROR: 'Your gift must be a valid dollar amount',
    AMOUNT_EMPTY_ERROR: 'Amount must be not empty',
    AMOUNT_MIN_ERROR: 'Amount must be at least {{currencyLimit}}',
    AMOUNT_MAX_ERROR: 'Amount must be less than {{currencyLimit}}',
    SINGLE_GIFT: 'Single Gift',
    CHANGING_FREQUENCY: 'Changing frequency...',
    RECURRING_START: 'Transaction Start Date for Recurring Gifts',
    MONTH: 'Month',
    DAY: 'Day',
    GIFT_START_DATE: 'Your gift will start on',
    OPTIONAL: 'Optional',
    SEND_MESSAGE_TO: 'Send a Message to {{ministry}}',
    SPECIAL_INSTRUCTIONS:
      'Special Handling Instructions for Processing This Gift',
    MESSAGE_EXAMPLE:
      'For example: stop my gift after 18 months, make this gift anonymous (note: please remove any messages to ministry or missionary to remain anonymous), etc.',
    YOUR_INFORMATION: 'Your information',
    YOUR_NAME: 'Your name',
    PAYMENT: 'Payment',
    CONTINUE: 'Continue',
    LOADING_ERROR_RETRY:
      'There was an error loading your profile. You can use the retry button to try loading it again. If you continue to see this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    RETRY: 'Retry',
    GIVE_AS_INDIVIDUAL: 'Give as an Individual',
    GIVE_AS_ORGANIZATION: 'Give as an Organization',
    FIRST_NAME: 'First Name',
    LAST_NAME: 'Last Name',
    MIDDLE_ABBREV: 'MI',
    SPOUSE_FIRST_NAME: 'Spouse First Name',
    SPOUSE_LAST_NAME: 'Spouse Last Name',
    ORGANIZATION_NAME: 'Organization Name',
    MAILING_ADDRESS: 'Mailing Address',
    SUFFIX: 'Suffix',
    COUNTRY: 'Country',
    ADDRESS: 'Address',
    CITY: 'City',
    STATE: 'State / Region',
    ZIP: 'Zip / Postal Code',
    CONTACT_INFO: 'Contact Information',
    PHONE: 'Phone',
    EMAIL: 'Email Address',
    BANK_ACCOUNT: 'Bank Account',
    CREDIT_CARD: 'Credit / Debit Card',
    BANK_ACCOUNT_PAYMENT: 'Bank Account Payment',
    BANK_NAME: 'Bank Name',
    ROUTING: 'Routing #',
    ACCOUNT_TYPE: 'Account Type',
    ACCOUNT_NUM: 'Account #',
    RETYPE_ACCOUNT_NUM: 'Retype Account #',
    CHECKING:
      'Checking <span class="hidden-md hidden-sm hide-modal">Account</span>',
    SAVINGS:
      'Savings <span class="hidden-md hidden-sm hide-modal">Account</span>',
    LOCATE_ROUTING_ACCT: 'Locate your Routing and Account Numbers',
    BANK_AGREEMENT: 'Bank Account Agreement',
    BANK_AGREEMENT_MESSAGE:
      'By selecting the "I Agree" checkbox above, I acknowledge that I have read, understand and agree to these Terms and Conditions, and that this agreement constitutes a "writing signed by me" under any applicable law or regulation. I authorize Cru to initiate electronic funds transfers (debits) from my account at the financial institution listed above, and to initiate deposits (credits) if necessary for any withdrawals made in error. This authority is to remain in full force and effect until Cru has received notification from me of its termination in such time as to afford Cru reasonable opportunity to act on it. All contributions to Cru are income tax-deductible and are made with the understanding that Cru has complete discretion and control over the use of all donated funds.',
    I_AGREE:
      'I acknowledge that I have read, understand, and agree to the <a ng-click="$ctrl.toggleAgreement($event)">terms and conditions</a> regarding electronic fund transfer.',
    CREDIT_CARD_PAYMENT: 'Credit / Debit Card Payment',
    CARD_NUM: 'Card #',
    CARD_NAME: 'Name on Card',
    EXP_MONTH: 'Exp. Month',
    EXP_YEAR: 'Exp. Year',
    SEC_CODE: 'Security Code',
    SAME_ADDRESS: 'Same as Mailing Address',
    BILLING_ADDRESS: 'Billing Address',
    NEW_ADDRESS: 'New',
    ERROR_SAVING_TITLE: 'There was an error saving the title you have chosen.',
    ERROR_SAVING_EMAIL:
      'There was an error saving your email address. Make sure it was entered correctly.',
    ERROR_SAVING_PHONE:
      'There was an error saving your phone number. Make sure it was entered correctly.',
    ERROR_SAVING_ORGANIZATION:
      'There was an error saving your organization name. Make sure it is not longer than 100 characters.',
    ERROR_SAVING_CONTACT_SPOUSE:
      "There was an error saving your contact info. Make sure your spouse's first and last name are correct.",
    ERROR_SAVING_CONTACT_EXPIRED:
      'There was an error saving your contact info. Your session may have expired. If you continue to experience issues, try signing out and back in.',
    ERROR_SAVING_CONTACT_TRY_AGAIN:
      'There was an error saving your contact info. Please try again or contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    CHECKING_FOR_EXISTING: 'Checking for existing information...',
    FIRST_NAME_ERROR: 'You must enter a first name',
    MAX_LENGTH_FIRST_NAME_ERROR:
      'This field cannot be longer than 50 characters',
    MAX_LENGTH_MI_ERROR: 'This field cannot be longer than 15 characters',
    LAST_NAME_ERROR: 'You must enter a last name',
    MAX_LENGTH_LAST_NAME_ERROR:
      'This field cannot be longer than 50 characters',
    JR: 'Jr',
    SR: 'Sr',
    ORG_NAME_ERROR: 'You must enter an organization name',
    ORG_NAME_MAX_LENGTH_ERROR:
      'Organization name cannot be longer than 100 characters',
    INVALID_PHONE_ERROR: 'The phone number entered is invalid',
    EMAIL_MISSING_ERROR: 'You must enter an email address',
    EMAIL_INVALID_ERROR: 'This email address is not valid',
    EMAIL_LENGTH_ERROR: 'This field cannot be longer than 100 characters',
    BANK_NAME_ERROR: 'You must enter a bank name',
    MAX_LENGTH_BANK_NAME_ERROR:
      'The bank name cannot be longer than 30 characters',
    ACCOUNT_TYPE_ERROR: 'You must choose an account type',
    ROUTING_NUM_ERROR: 'You must enter a routing number',
    MIN_LENGTH_ROUTING_ERROR: 'This routing number must contain 9 digits',
    ROUTING_INVALID_ERROR: 'This routing number is invalid',
    ACCOUNT_NUM_ERROR: 'You must enter an account number',
    MIN_LENGTH_ACCOUNT_ERROR:
      'This account number must contain 2 or more digits',
    MAX_LENGTH_ACCOUNT_ERROR:
      'This account number must contain 17 or fewer digits',
    RETYPE_ACCT_NUM: 'You must retype your account number',
    ACCT_NUM_MISMATCH: 'Your account numbers do not match',
    WHERE_TO_FIND_BANK_NUMS_TITLE: 'Where to find it.',
    WHERE_TO_FIND_BANK_NUMS_MESSAGE:
      'Use your account and routing numbers from your check. Do not use your deposit slip.',
    MUST_AGREE_BANK_ACCT:
      'You must accept this agreement to pay with a bank account',
    CARD_NUM_ERROR: 'You must enter a card number',
    MIN_LENGTH_CARD_NUM_ERROR:
      'This card number must contain at least 13 digits',
    MAX_LENGTH_CARD_NUM_ERROR:
      'This card number cannot contain more than 16 digits',
    CARD_TYPE_ERROR: 'This card type is not recognized',
    INVALID_TYPE_ERROR:
      'This is an invalid {{cardtype}} number. It should have {{carddigits}} digits.',
    INVALID_CARD_NUM_ERROR:
      'This card number is invalid. At least one digit was entered incorrectly.',
    CARD_NAME_ERROR: 'You must enter the name on the card',
    MAX_LENGTH_CARD_NAME_ERROR: 'This name cannot be longer than 50 characters',
    MONTHS: {
      JAN: 'January',
      FEB: 'February',
      MAR: 'March',
      APR: 'April',
      MAY: 'May',
      JUN: 'June',
      JUL: 'July',
      AUG: 'August',
      SEP: 'September',
      OCT: 'October',
      NOV: 'November',
      DEC: 'December',
    },
    CARD_EXP_MONTH_ERROR: 'You must choose an expiration month',
    CARD_EXPIRED_ERROR:
      'Your credit card is expired or you selected the wrong month or year',
    CARD_EXP_YEAR_ERROR: 'You must choose an expiration year',
    CARD_SEC_CODE_ERROR: 'You must enter the security code',
    MIN_LENGTH_CARD_SEC_CODE: 'The security code must be at least 3 digits',
    MAX_LENGTH_CARD_SEC_CODE: 'The security code cannot be more than 4 digits',
    LOCATION_OF_CODE_AMEX: '4 digit code on front of card',
    LOCATION_OF_CODE_OTHER: '3 digit code on back of card',
    LOADING_ADDRESS: 'Loading mailing address...',
    COUNTRY_LIST_ERROR:
      'There was an error loading the list of countries. If you continue to see this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    COUNTRY_SELECT_ERROR: 'You must select a country',
    ADDRESS_ERROR: 'You must enter an address',
    MAX_LENGTH_ADDRESS_ERROR: 'This field cannot be longer than 200 characters',
    MAX_LENGTH_ADDRESS_OTHERS_ERROR:
      'This field cannot be longer than 100 characters',
    CITY_ERROR: 'You must enter a city',
    MAX_LENGTH_CITY_ERROR: 'This field cannot be longer than 100 characters',
    REGIONS_LOADING_ERROR:
      'There was an error loading the list of regions/state. If you continue to see this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    SELECT_STATE_ERROR: 'You must select a state / region',
    ZIP_CODE_ERROR: 'You must enter a zip / postal code',
    INVALID_US_ZIP_ERROR: 'You must enter a valid US zip code',
    ROUTING_NUM_INVALID:
      'The routing number you entered does not seem to be valid. Please verify that it is correct.',
    ALREADY_ADDED_CARD:
      'You have already added this credit card. If you wish to make changes please edit your existing credit card.',
    EXPIRED_CARD_ERROR:
      'This card has expired. Please use a different payment method.',
    ALREADY_ADDED_BANK:
      'You have already added this bank account. If you wish to make changes please edit your existing bank account.',
    ERROR_SAVING_PAYMENT:
      'There was an error saving your payment method. Please verify all your info and try again. If you are still seeing this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    REVIEW: 'Review',
    CONTACT_INFORMATION: 'Contact Information',
    CHANGE: 'Change',
    PAYMENT_METHOD: 'Payment Method',
    REVIEW_EMAIL_ERROR:
      'There was an issue with your email. Please verify that it is correct.',
    REVIEW_PAYMENT_ERROR:
      'There was an issue with your payment. Please verify that all your payment information is correct.',
    REVIEW_BILLING_ADDRESS_ERROR:
      'There was an issue with your billing address. Please verify that your billing address is correct.',
    REVIEW_MISSING_DATA_ERROR: `There was an unknown error indicating that the order is still missing data.
          Please verify all your info, try refreshing the page, and, if you are still seeing this message, please contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.`,
    REVIEW_TIME_OUT_ERROR: `There was an error receiving your gift submission status. Your connection dropped or timed out.
         Please contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.`,
    REVIEW_SUBMITTING_PAYMENT_ERROR:
      'There was an error submitting your payment. Verify that your payment info is correct or try adding it again. If you are still seeing this message, please contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    REVIEW_CARD_EXPIRED_ERROR: 'Your card is expired.',
    REVIEW_INVALID_CARD_ERROR: 'The credit card number entered is invalid.',
    REVIEW_CARD_DECLINED_ERROR: 'Your credit card was declined.',
    REVIEW_INSUFFICIENT_FUNDS_ERROR:
      'Your credit card was declined due to insufficient funds.',
    REVIEW_EXCEEDS_BALANCE_ERROR:
      'This transaction exceeds your available card balance.',
    REVIEW_INVALID_SEC_CODE_ERROR:
      'The security code entered for your card is invalid.',
    REVIEW_ADDRESS_MISMATCH_ERROR:
      'The billing address entered does not match the address associated with the card.',
    REVIEW_DEFAULT_ERROR:
      'There was an issue processing your request. Please contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    ACCOUNT_NUM_FULL: 'Account Number',
    ROUTING_NUM_FULL: 'Routing Number',
    CARD_NUM_FULL: 'Card Number',
    CARD_TYPE: 'Card Type',
    EXPIRES: 'Expires',
    REVIEW_GIFTS: 'Review Gifts',
    GIFT: 'Gift',
    FREQUENCY: 'Frequency',
    AMOUNT: 'Amount',
    WARNING: 'Warning!',
    FUTURE_WARNING:
      'You are about to give a gift starting {{days}} days in the future.',
    KEEP_DATE: 'Keep {{keepdate}}',
    CHANGE_TO_DATE: 'Change to {{changedate}}',
    STARTING_DATE: 'Starts on: {{startdate}}',
    SUBMIT_GIFT: 'Submit Your Gift',
    SUBMITTING_GIFT: 'Submitting your gift...',
    RETRY_LOAD:
      'There was an error loading your gifts. You may <a id="retryLoadButton" href="" ng-click="{{retryLoadFunction}}">retry</a> loading them. If you continue to see this message, please contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    FINAL_THANK_YOU_HEADING: 'Thank you for Your Gift',
    FINAL_GIFT_SUMMARY_EXPIRATION_ERROR: `Your gift was submitted but we cannot provide a detailed summary at this time as your session has expired.
        You will receive a confirmation email from us shortly, or you can review your donation now by looking at <a href="/your-giving.html">Your Giving</a>.`,
    FINAL_GIFT_NO_SUMMARY_ERROR: `Your gift was submitted but we cannot provide a detailed summary at this time.
        You will receive a confirmation email from us shortly, or you can review your donation now by looking at <a href="/your-giving.html">Your Giving</a>.`,
    FINAL_PROCESSING_GIFT: `We are processing your gift now. We'll send an email confirmation to
      <strong>{{useremail}}</strong> as well as a tax-deductible receipt by postal mail.`,
    FINAL_GIFT_THANK_YOU:
      "Thanks for making a difference in the lives of people both now and for eternity. May the Lord bless your investment in this work for Christ's kingdom. (Luke 6:38)",
    RECEIPT_MAILING_ADDRESS: 'Receipt Mailing Address',
    GIFT_SUMMARY: 'Gift Summary',
    FIRST_GIFT: 'First Gift:',
    ANNUAL_GIFT_TOTAL: 'Annual Gift Total:',
    FREQUENCY_GIFT_TOTAL: '{{frequency}} Gift Total:',
    CHOOSE_RESOURCE: 'Choose a Resource',
    NO_THANK_YOU: 'Thank you, but please do not send me the resources.',
    RADIO_STATION: 'Radio Station',
    RADIO_STATION_LIST_ERROR:
      'There was an error loading radio stations in your area.',
    RADIO_STATION_SELECT_ERROR: 'There was an error selecting a radio station.',
    PREFERRED_RADIO_STATION: 'Preferred Radio Station: ',
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again',
    OKTA_EMAIL_ALREADY_EXISTS:
      'The email address you used belongs to an existing Okta user.',
    OKTA_ERROR_WHILE_SAVING_EMAIL:
      'There was an error saving your email address. Make sure it was entered correctly.',
    OKTA_ERROR_WHILE_SAVING_DATA:
      'There was an error saving your contact info. Please try again or contact eGift@cru.org for assistance.',
    OKTA_SIGNUP_FIELDS_ERROR: 'Please review the following fields: {{fields}}.',
    OKTA_FIRST_NAME_FIELD: 'first name',
    OKTA_LAST_NAME_FIELD: 'last name',
    OKTA_EMAIL_FIELD: 'email',
    OKTA_PASSWORD_FIELD: 'password',
    OKTA_REDIRECTING_IN: 'Redirecting in {{seconds}}...',
    OKTA_REDIRECTING_NOW: 'Redirecting...',
    OKTA_WELCOME: 'Welcome, {{name}}!',
    OKTA_ACCOUNT_CREATED:
      'Your account with Cru was successfully created and verified. <br/><strong>Now let’s sign you in.</strong>',
    OKTA_REDIRECT_EXPLANATION:
      'For your security, you are being redirected to Okta to sign in with your new account. Okta is our secure login provider, helping keep your account safe. <strong>You’ll briefly visit the domain below, then we’ll bring you back after you sign in.</strong>',
    OKTA_REDIRECT_NOW: 'Take me to Okta now',
    SPOUSE_DETAILS_TOOLTIP:
      "By adding your spouse's name, we can ensure that both of your contributions are linked together, providing a clearer and more accurate record of your household's giving.",
    SECURE: 'Secure',
    ADD_SPOUSE: 'Add Spouse',
    REMOVE_SPOUSE: 'Remove',
    SUGGESTED_AMOUNT_HELP: 'Suggested Gift Amounts. Tab for Custom Amount',
    CUSTOM_AMOUNT: 'Custom Amount',
  });

  $translateProvider.translations('es', {
    GIVE_GIFT_HEADER: 'Dar regalo',
    LOADING_GIFT_DETAILS: 'Cargando detalles del regalo...',
    LOADING_ERROR:
      'There was an error loading the details needed to configure your gift. You may <a href ng-click="{{loadData}}">try again</a>. If you continue to experience issues, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    FROM_WHAT_COUNTRY:
      'We are so grateful for your generosity. We recognize that many people from different countries are partnering with our ministry for the fulfillment of the Great Commission. From which country would you like to give?',
    GIVE_THROUGH_US_SITE: 'Dar a través del sitio web de Estados Unidos',
    GIVE_THROUGH_SITE: 'Dar a través de {{name}} dar sitio',
    FREQUENCY_ERROR:
      'There was an error configuring the frequency of your gift. You may try changing the frequency again but if you continue to experience issues, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    ADDING_CART_ERROR:
      'There was an unknown error adding your gift to the cart. Please verify all your info and try again. If you are still seeing this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    GIFT_IN_CART_ERROR: 'Ya tienes este regalo en tu carrito.',
    FORCED_USER_TO_LOGOUT:
      'There was an error adding this item to your account due to session data. Please re-add the item to your cart.',
    GIFT_AMOUNT: 'Selecciona Una Cantidad',
    OTHER_PLACEHOLDER: 'Otro regalo generoso',
    GIFT_FREQUENCY: 'Frecuencia de la donación',
    VALID_DOLLAR_AMOUNT_ERROR:
      'Su regalo debe ser una cantidad válida en dólares',
    AMOUNT_EMPTY_ERROR: 'El importe no debe estar vacío.',
    AMOUNT_MIN_ERROR: 'La cantidad debe ser al menos {{currencyLimit}}',
    AMOUNT_MAX_ERROR: 'El importe debe ser inferior a {{currencyLimit}}',
    SINGLE_GIFT: 'Una sola',
    CHANGING_FREQUENCY: 'Cambio de frecuencia...',
    RECURRING_START:
      'Fecha de inicio de la transacción para regalos recurrentes',
    MONTH: 'Mes',
    DAY: 'Dia',
    GIFT_START_DATE: 'Tu regalo comenzará el',
    OPTIONAL: 'Opcional',
    SEND_MESSAGE_TO: 'Enviar un mensaje al {{ministry}}',
    SPECIAL_INSTRUCTIONS:
      'Instrucciones especiales de manejo para procesar este regalo',
    MESSAGE_EXAMPLE:
      'Por ejemplo: Detener mi donación después de 18 meses, hacer esta donación anónima (nota: favor de quitar cualquier mensaje al ministerio o al misionero para permanecer en el anonimato), etc.',
    YOUR_INFORMATION: 'Tu información',
    YOUR_NAME: 'Tu nombre',
    SPOUSE_NAME: 'cónyuge nombre',
    PAYMENT: 'Pago',
    CONTINUE: 'Continuar',
    LOADING_ERROR_RETRY:
      'There was an error loading your profile. You can use the retry button to try loading it again. If you continue to see this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    RETRY: 'Procesar de nuevo',
    GIVE_AS_INDIVIDUAL: 'Dar como individuo',
    GIVE_AS_ORGANIZATION: 'Dar como organización',
    FIRST_NAME: 'Nombre',
    LAST_NAME: 'Apellido',
    MIDDLE_ABBREV: 'MI',
    SPOUSE_FIRST_NAME: 'Nombre del cónyuge',
    SPOUSE_LAST_NAME: 'Apellido del cónyuge',
    ORGANIZATION_NAME: 'Nombre de la Organización',
    MAILING_ADDRESS: 'Dirección de envio',
    SUFFIX: 'Sufijo',
    COUNTRY: 'País',
    ADDRESS: 'Dirección',
    CITY: 'Ciudad',
    STATE: 'Estado',
    ZIP: 'Código postal',
    CONTACT_INFO: 'Información del contacto',
    PHONE: 'Teléfono',
    EMAIL: 'Email',
    BANK_ACCOUNT: 'Cuenta bancaria',
    CREDIT_CARD: 'Tarjeta de crédito',
    BANK_ACCOUNT_PAYMENT: 'Pago de cuenta bancaria',
    BANK_NAME: 'Nombre del banco',
    ROUTING: 'Número de ruta',
    ACCOUNT_TYPE: 'Tipo de cuenta',
    ACCOUNT_NUM: 'Número de cuenta',
    RETYPE_ACCOUNT_NUM: 'Vuelva a escribir el número de cuenta',
    CHECKING: 'Cuenta <span class="hidden-md hide-modal">de cheques</span>',
    SAVINGS: 'Cuenta <span class="hidden-md hide-modal">de ahorros</span>',
    LOCATE_ROUTING_ACCT: 'Encuentra tu ruta y números de cuenta',
    BANK_AGREEMENT: 'Acuerdo de cuenta bancaria',
    BANK_AGREEMENT_MESSAGE:
      'By selecting the "I Agree" checkbox above, I acknowledge that I have read, understand and agree to these Terms and Conditions, and that this agreement constitutes a "writing signed by me" under any applicable law or regulation. I authorize Cru to initiate electronic funds transfers (debits) from my account at the financial institution listed above, and to initiate deposits (credits) if necessary for any withdrawals made in error. This authority is to remain in full force and effect until Cru has received notification from me of its termination in such time as to afford Cru reasonable opportunity to act on it. All contributions to Cru are income tax-deductible and are made with the understanding that Cru has complete discretion and control over the use of all donated funds.',
    I_AGREE:
      'Reconozco que he leído, comprendido y acepto los <a ng-click="$ctrl.toggleAgreement($event)">términos y condiciones</a> relacionados con la transferencia electrónica de fondos.',
    CREDIT_CARD_PAYMENT: 'Pago con tarjeta de crédito',
    CARD_NUM: 'Número de tarjeta',
    CARD_NAME: 'Nombre en la tarjeta',
    EXP_MONTH: 'Mes de expiración',
    EXP_YEAR: 'Año de caducidad',
    SEC_CODE: 'Código de seguridad',
    SAME_ADDRESS: 'La misma que mi direccion de correo',
    BILLING_ADDRESS: 'Dirección de Envio',
    NEW_ADDRESS: 'Nueva',
    ERROR_SAVING_TITLE: 'Se produjo un error al guardar el título que eligió.',
    ERROR_SAVING_EMAIL:
      'Se produjo un error al guardar su dirección de correo electrónico. Asegúrese de que se ingresó correctamente.',
    ERROR_SAVING_PHONE:
      'Se produjo un error al guardar su número de teléfono. Asegúrese de que se ingresó correctamente.',
    ERROR_SAVING_ORGANIZATION:
      'Se produjo un error al guardar el nombre de su organización. Asegúrese de que no tenga más de 100 caracteres.',
    ERROR_SAVING_CONTACT_SPOUSE:
      'Se produjo un error al guardar su información de contacto. Asegúrese de que el nombre y apellido de su cónyuge sean correctos.',
    ERROR_SAVING_CONTACT_EXPIRED:
      'Se produjo un error al guardar su información de contacto. Su sesión puede haber expirado. Si continúa teniendo problemas, intente cerrar sesión y volver a iniciar sesión.',
    ERROR_SAVING_CONTACT_TRY_AGAIN:
      'Se produjo un error al guardar su información de contacto. Vuelva a intentarlo o póngase en contacto con <a href="mailto:eGift@cru.org"> eGift@cru.org </a> para obtener ayuda.',
    CHECKING_FOR_EXISTING: 'Comprobando la información existente ...',
    FIRST_NAME_ERROR: 'Debes ingresar un nombre',
    MAX_LENGTH_FIRST_NAME_ERROR:
      'Este campo no puede tener más de 50 caracteres.',
    MAX_LENGTH_MI_ERROR: 'This field cannot be longer than 15 characters',
    LAST_NAME_ERROR: 'You must enter a last name',
    MAX_LENGTH_LAST_NAME_ERROR:
      'Este campo no puede tener más de 50 caracteres.',
    JR: 'Jr',
    SR: 'Sr',
    ORG_NAME_ERROR: 'Debes ingresar el nombre de una organización',
    ORG_NAME_MAX_LENGTH_ERROR:
      'El nombre de la organización no puede tener más de 100 caracteres.',
    INVALID_PHONE_ERROR: 'El número de teléfono ingresado no es válido',
    EMAIL_MISSING_ERROR: 'Debes ingresar una dirección de correo electrónico',
    EMAIL_INVALID_ERROR: 'Esta dirección de correo electrónico no es válida',
    EMAIL_LENGTH_ERROR: 'Este campo no puede tener más de 100 caracteres.',
    BANK_NAME_ERROR: 'Debes ingresar un nombre bancario',
    MAX_LENGTH_BANK_NAME_ERROR:
      'El nombre del banco no puede tener más de 30 caracteres.',
    ACCOUNT_TYPE_ERROR: 'Debes elegir un tipo de cuenta',
    ROUTING_NUM_ERROR: 'Debe ingresar un número de ruta',
    MIN_LENGTH_ROUTING_ERROR: 'Este número de ruta debe contener 9 dígitos.',
    ROUTING_INVALID_ERROR: 'Este número de ruta no es válido.',
    ACCOUNT_NUM_ERROR: 'Debes ingresar un número de cuenta',
    MIN_LENGTH_ACCOUNT_ERROR:
      'Este número de cuenta debe contener 2 o más dígitos.',
    MAX_LENGTH_ACCOUNT_ERROR:
      'Este número de cuenta debe contener 17 dígitos o menos',
    RETYPE_ACCT_NUM: 'Debe volver a escribir su número de cuenta',
    ACCT_NUM_MISMATCH: 'Sus números de cuenta no coinciden',
    WHERE_TO_FIND_BANK_NUMS_TITLE: 'Dónde encontrarlo',
    WHERE_TO_FIND_BANK_NUMS_MESSAGE:
      'Use su cuenta y números de ruta de su cheque. No use su comprobante de depósito.',
    MUST_AGREE_BANK_ACCT:
      'Debe aceptar este acuerdo para pagar con una cuenta bancaria',
    CARD_NUM_ERROR: 'Debes ingresar un número de tarjeta',
    MIN_LENGTH_CARD_NUM_ERROR:
      'Este número de tarjeta debe contener al menos 13 dígitos',
    MAX_LENGTH_CARD_NUM_ERROR:
      'Este número de tarjeta no puede contener más de 16 dígitos.',
    CARD_TYPE_ERROR: 'Este tipo de tarjeta no se reconoce',
    INVALID_TYPE_ERROR:
      'Este es un número no válido {{cardtype}}. Debe tener {{carddigits}} dígitos.',
    INVALID_CARD_NUM_ERROR:
      'Este número de tarjeta no es válido. Al menos un dígito se ingresó incorrectamente.',
    CARD_NAME_ERROR: 'Debes ingresar el nombre en la tarjeta',
    MAX_LENGTH_CARD_NAME_ERROR:
      'Este nombre no puede tener más de 50 caracteres.',
    MONTHS: {
      JAN: 'Enero',
      FEB: 'Febrero',
      MAR: 'Marzo',
      APR: 'Abril',
      MAY: 'Mayo',
      JUN: 'Junio',
      JUL: 'Julio',
      AUG: 'Agosto',
      SEP: 'Septiembre',
      OCT: 'Octubre',
      NOV: 'Noviembre',
      DEC: 'Diciembre',
    },
    CARD_EXP_MONTH_ERROR: 'Debes elegir un mes de vencimiento',
    CARD_EXPIRED_ERROR:
      'Su tarjeta de crédito ha caducado o seleccionó el mes o año incorrecto',
    CARD_EXP_YEAR_ERROR: 'Debes elegir un año de vencimiento',
    CARD_SEC_CODE_ERROR: 'Debes ingresar el código de seguridad',
    MIN_LENGTH_CARD_SEC_CODE:
      'El código de seguridad debe tener al menos 3 dígitos.',
    MAX_LENGTH_CARD_SEC_CODE:
      'El código de seguridad no puede tener más de 4 dígitos.',
    LOCATION_OF_CODE_AMEX: 'Código de 4 dígitos en el frente de la tarjeta',
    LOCATION_OF_CODE_OTHER: 'Código de 3 dígitos en el reverso de la tarjeta',
    LOADING_ADDRESS: 'Cargando dirección postal...',
    COUNTRY_LIST_ERROR:
      'There was an error loading the list of countries. If you continue to see this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    COUNTRY_SELECT_ERROR: 'You must select a country',
    ADDRESS_ERROR: 'You must enter an address',
    MAX_LENGTH_ADDRESS_ERROR: 'This field cannot be longer than 200 characters',
    MAX_LENGTH_ADDRESS_OTHERS_ERROR:
      'This field cannot be longer than 100 characters',
    CITY_ERROR: 'You must enter a city',
    MAX_LENGTH_CITY_ERROR: 'This field cannot be longer than 100 characters',
    REGIONS_LOADING_ERROR:
      'There was an error loading the list of regions/state. If you continue to see this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    SELECT_STATE_ERROR: 'You must select a state / region',
    ZIP_CODE_ERROR: 'You must enter a zip / postal code',
    INVALID_US_ZIP_ERROR: 'You must enter a valid US zip code',
    ROUTING_NUM_INVALID:
      'The routing number you entered does not seem to be valid. Please verify that it is correct.',
    ALREADY_ADDED_CARD:
      'You have already added this credit card. If you wish to make changes please edit your existing credit card.',
    EXPIRED_CARD_ERROR:
      'This card has expired. Please use a different payment method.',
    ALREADY_ADDED_BANK:
      'You have already added this bank account. If you wish to make changes please edit your existing bank account.',
    ERROR_SAVING_PAYMENT:
      'There was an error saving your payment method. Please verify all your info and try again. If you are still seeing this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    REVIEW: 'Review',
    CONTACT_INFORMATION: 'Contact Information',
    CHANGE: 'Change',
    PAYMENT_METHOD: 'Payment Method',
    REVIEW_EMAIL_ERROR:
      'There was an issue with your email. Please verify that it is correct.',
    REVIEW_PAYMENT_ERROR:
      'There was an issue with your payment. Please verify that all your payment information is correct.',
    REVIEW_BILLING_ADDRESS_ERROR:
      'There was an issue with your billing address. Please verify that your billing address is correct.',
    REVIEW_MISSING_DATA_ERROR: `There was an unknown error indicating that the order is still missing data.
          Please verify all your info, try refreshing the page, and, if you are still seeing this message, please contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.`,
    REVIEW_TIME_OUT_ERROR: `There was an error receiving your gift submission status. Your connection dropped or timed out.
         Please contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.`,
    REVIEW_SUBMITTING_PAYMENT_ERROR:
      'There was an error submitting your payment. Verify that your payment info is correct or try adding it again. If you are still seeing this message, please contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    REVIEW_CARD_EXPIRED_ERROR: 'Your card is expired.',
    REVIEW_INVALID_CARD_ERROR: 'The credit card number entered is invalid.',
    REVIEW_CARD_DECLINED_ERROR: 'Your credit card was declined.',
    REVIEW_INSUFFICIENT_FUNDS_ERROR:
      'Your credit card was declined due to insufficient funds.',
    REVIEW_EXCEEDS_BALANCE_ERROR:
      'This transaction exceeds your available card balance.',
    REVIEW_INVALID_SEC_CODE_ERROR:
      'The security code entered for your card is invalid.',
    REVIEW_ADDRESS_MISMATCH_ERROR:
      'The billing address entered does not match the address associated with the card.',
    REVIEW_DEFAULT_ERROR:
      'There was an issue processing your request. Please contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    ACCOUNT_NUM_FULL: 'Account Number',
    ROUTING_NUM_FULL: 'Routing Number',
    CARD_NUM_FULL: 'Número de tarjeta',
    CARD_TYPE: 'Card Type',
    EXPIRES: 'Expires',
    REVIEW_GIFTS: 'Review Gifts',
    GIFT: 'Gift',
    FREQUENCY: 'Frequency',
    AMOUNT: 'Amount',
    WARNING: 'Warning!',
    FUTURE_WARNING:
      'You are about to give a gift starting {{days}} days in the future.',
    KEEP_DATE: 'Keep {{keepdate}}',
    CHANGE_TO_DATE: 'Change to {{changedate}}',
    STARTING_DATE: 'Starts on: {{startdate}}',
    SUBMIT_GIFT: 'Submit Your Gift',
    SUBMITTING_GIFT: 'Submitting your gift...',
    RETRY_LOAD:
      'There was an error loading your gifts. You may <a id="retryLoadButton" href="" ng-click="{{retryLoadFunction}}">retry</a> loading them. If you continue to see this message, please contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
    FINAL_THANK_YOU_HEADING: 'Thank you for Your Gift',
    FINAL_GIFT_SUMMARY_EXPIRATION_ERROR: `Your gift was submitted but we cannot provide a detailed summary at this time as your session has expired.
        You will receive a confirmation email from us shortly, or you can review your donation now by looking at <a href="/your-giving.html">Your Giving</a>.`,
    FINAL_GIFT_NO_SUMMARY_ERROR: `Your gift was submitted but we cannot provide a detailed summary at this time.
        You will receive a confirmation email from us shortly, or you can review your donation now by looking at <a href="/your-giving.html">Your Giving</a>.`,
    FINAL_PROCESSING_GIFT: `We are processing your gift now. We'll send an email confirmation to
      <strong>{{useremail}}</strong> as well as a tax-deductible receipt by postal mail.`,
    FINAL_GIFT_THANK_YOU:
      "Thanks for making a difference in the lives of people both now and for eternity. May the Lord bless your investment in this work for Christ's kingdom. (Luke 6:38)",
    RECEIPT_MAILING_ADDRESS: 'Receipt Mailing Address',
    GIFT_SUMMARY: 'Gift Summary',
    FIRST_GIFT: 'First Gift:',
    ANNUAL_GIFT_TOTAL: 'Annual Gift Total:',
    FREQUENCY_GIFT_TOTAL: '{{frequency}} Gift Total:',
    CHOOSE_RESOURCE: 'Choose a Resource',
    NO_THANK_YOU: 'Thank you, but please do not send me the resources.',
    RADIO_STATION: 'Radio Station',
    RADIO_STATION_LIST_ERROR:
      'There was an error loading radio stations in your area.',
    RADIO_STATION_SELECT_ERROR: 'There was an error selecting a radio station.',
    PREFERRED_RADIO_STATION: 'Preferred Radio Station: ',
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again',
    OKTA_EMAIL_ALREADY_EXISTS:
      'The email address you used belongs to an existing Okta user.',
    OKTA_ERROR_WHILE_SAVING_EMAIL:
      'There was an error saving your email address. Make sure it was entered correctly.',
    OKTA_ERROR_WHILE_SAVING_DATA:
      'There was an error saving your contact info. Please try again or contact eGift@cru.org for assistance.',
    OKTA_SIGNUP_FIELDS_ERROR: 'Please review the following fields: {{fields}}.',
    OKTA_FIRST_NAME_FIELD: 'first name',
    OKTA_LAST_NAME_FIELD: 'last name',
    OKTA_EMAIL_FIELD: 'email',
    OKTA_PASSWORD_FIELD: 'password',
    OKTA_REDIRECTING_IN: 'Redirecting in {{seconds}}...',
    OKTA_REDIRECTING_NOW: 'Redirecting...',
    OKTA_WELCOME: 'Welcome, {{name}}!',
    OKTA_ACCOUNT_CREATED:
      'Your account with Cru was successfully created and verified. <br/><strong>Now let’s sign you in.</strong>',
    OKTA_REDIRECT_EXPLANATION:
      'For your security, you are being redirected to Okta to sign in with your new account. Okta is our secure login provider, helping keep your account safe. <strong>You’ll briefly visit the domain below, then we’ll bring you back after you sign in.</strong>',
    OKTA_REDIRECT_NOW: 'Take me to Okta now',
    SPOUSE_DETAILS_TOOLTIP:
      "By adding your spouse's name, we can ensure that both of your contributions are linked together, providing a clearer and more accurate record of your household's giving.",
    SECURE: 'Secure',
    ADD_SPOUSE: 'Add Spouse',
    REMOVE_SPOUSE: 'Remove',
    SUGGESTED_AMOUNT_HELP: 'Suggested Gift Amounts. Tab for Custom Amount',
    CUSTOM_AMOUNT: 'Custom Amount',
  });
  $translateProvider.preferredLanguage('en');
};

export default angular
  .module('appConfig', ['environment', 'pascalprecht.translate'])
  .config(appConfig)
  // Configure DataDog before Rollbar so that the RUM session id can be added to the Rollbar payload
  .config(dataDogConfig)
  .config(rollbarConfig);
