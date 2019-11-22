import angular from 'angular'
import 'angular-gettext'

import appConfig from './app.config'
import loadingComponent from './components/loading/loading.component'
import navCartIcon from 'common/components/nav/navCartIcon.component'
import analyticsRun from 'app/analytics/analytics.run'

import sessionModalService from './services/session/sessionModal.service'
import sessionService from './services/session/session.service'
import sessionEnforcerService from './services/session/sessionEnforcer.service'
import pascalprecht from 'angular-translate'

const moduleName = 'common'

export default angular
  .module(moduleName, [
    'gettext',
    appConfig.name,
    navCartIcon.name,
    loadingComponent.name,
    analyticsRun.name,
    sessionService.name,
    sessionModalService.name,
    sessionEnforcerService.name,
    'pascalprecht.translate'
  ]).config(($translateProvider) => {
    $translateProvider.translations('en', {
      GIVE_GIFT_HEADER: 'Give Gift',
      LOADING_GIFT_DETAILS: 'Loading gift details...',
      LOADING_ERROR: 'There was an error loading the details needed to configure your gift. You may <a href ng-click="{{loadData}}">try again</a>. If you continue to experience issues, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
      FROM_WHAT_COUNTRY: 'We are so grateful for your generosity. We recognize that many people from different countries are partnering with our ministry for the fulfillment of the Great Commission. From which country would you like to give?',
      GIVE_THROUGH_US_SITE: 'Give through US give site',
      GIVE_THROUGH_SITE: 'Give through {{name}} give site',
      FREQUENCY_ERROR: 'There was an error configuring the frequency of your gift. You may try changing the frequency again but if you continue to experience issues, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
      ADDING_CART_ERROR: 'There was an unknown error adding your gift to the cart. Please verify all your info and try again. If you are still seeing this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
      GIFT_IN_CART_ERROR: 'You already have this gift in your cart.',
      GIFT_AMOUNT: 'Gift Amount',
      OTHER_PLACEHOLDER: 'Other',
      GIFT_FREQUENCY: 'Gifts Frequency',
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
      SPECIAL_INSTRUCTIONS: 'Special Handling Instructions for Processing This Gift',
      MESSAGE_EXAMPLE: 'For example: make this gift anonymous, stop my gift after 18 months, etc.',
      YOUR_INFORMATION: 'Your information',
      PAYMENT: 'Payment',
      CONTINUE: 'Continue',
      LOADING_ERROR_RETRY: 'There was an error loading your profile. You can use the retry button to try loading it again. If you continue to see this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
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
      CREDIT_CARD: 'Credit Card',
      BANK_ACCOUNT_PAYMENT: 'Bank Account Payment',
      BANK_NAME: 'Bank Name',
      ROUTING: 'Routing #',
      ACCOUNT_TYPE: 'Account Type',
      ACCOUNT_NUM: 'Account #',
      RETYPE_ACCOUNT_NUM: 'Retype Account #',
      CHECKING: 'Checking <span class="hidden-md hide-modal">Account</span>',
      SAVINGS: 'Savings <span class="hidden-md hide-modal">Account</span>',
      LOCATE_ROUTING_ACCT: 'Locate your Routing and Account Numbers',
      BANK_AGREEMENT: 'Bank Account Agreement',
      BANK_AGREEMENT_MESSAGE: 'By selecting the "I Agree" checkbox below, I acknowledge that I have read, understand and agree to these Terms and Conditions, and that this agreement constitutes a "writing signed by me" under any applicable law or regulation. I authorize Cru to initiate electronic funds transfers (debits) from my account at the financial institution listed above, and to initiate deposits (credits) if necessary for any withdrawals made in error. This authority is to remain in full force and effect until Cru has received notification from me of its termination in such time as to afford Cru reasonable opportunity to act on it. All contributions to Cru are income tax-deductible and are made with the understanding that Cru has complete discretion and control over the use of all donated funds.',
      I_AGREE: 'I agree',
      CARD_NUM: 'Card #',
      CARD_NAME: 'Name on Card',
      EXP_MONTH: 'Exp. Month',
      EXP_YEAR: 'Exp. Year',
      SEC_CODE: 'Security Code',
      SAME_ADDRESS: 'Same as Mailing Address',
      BILLING_ADDRESS: 'Billing Address',
      ERROR_SAVING_TITLE: 'There was an error saving the title you have chosen.',
      ERROR_SAVING_EMAIL: 'There was an error saving your email address. Make sure it was entered correctly.',
      ERROR_SAVING_PHONE: 'There was an error saving your phone number. Make sure it was entered correctly.',
      ERROR_SAVING_ORGANIZATION: 'There was an error saving your organization name. Make sure it is not longer than 100 characters.',
      ERROR_SAVING_CONTACT_SPOUSE: 'There was an error saving your contact info. Make sure your spouse\'s first and last name are correct.',
      ERROR_SAVING_CONTACT_EXPIRED: 'There was an error saving your contact info. Your session may have expired. If you continue to experience issues, try signing out and back in.',
      ERROR_SAVING_CONTACT_TRY_AGAIN: 'There was an error saving your contact info. Please try again or contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.',
      CHECKING_FOR_EXISTING: 'Checking for existing information...',
      FIRST_NAME_ERROR: 'You must enter a first name',
      MAX_LENGTH_FIRST_NAME_ERROR: 'This field cannot be longer than 50 characters',
      MAX_LENGTH_MI_ERROR: 'This field cannot be longer than 15 characters',
      LAST_NAME_ERROR: 'You must enter a last name',
      MAX_LENGTH_LAST_NAME_ERROR: 'This field cannot be longer than 50 characters',
      JR: 'Jr',
      SR: 'Sr',
      ORG_NAME_ERROR: 'You must enter an organization name',
      ORG_NAME_MAX_LENGTH_ERROR: 'Organization name cannot be longer than 100 characters',
      INVALID_PHONE_ERROR: 'The phone number entered is invalid',
      EMAIL_MISSING_ERROR: 'You must enter an email address',
      EMAIL_INVALID_ERROR: 'This email address is not valid',
      EMAIL_LENGTH_ERROR: 'This field cannot be longer than 100 characters',
      BANK_NAME_ERROR: '',
      MAX_LENGTH_BANK_NAME_ERROR: '',
      ACCOUNT_TYPE_ERROR: '',
    })
    $translateProvider.translations('de', {
      TITLE: 'Hallo',
      FOO: 'Dies ist ein Paragraph.',
      BUTTON_LANG_EN: 'englisch',
      BUTTON_LANG_DE: 'deutsch'
    })
    $translateProvider.preferredLanguage('en')
  })
