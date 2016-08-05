/* eslint-disable angular/typecheck-string, angular/typecheck-object, angular/typecheck-function */
//TODO: figure out how to import named exports using system.config.js
import {JSEncrypt} from 'jsencrypt';
import find from 'lodash/find';
import includes from 'lodash/includes';

let _ = {
  find: find,
  contains: includes //TODO: upgrade lodash in the the ccp.js source repo
};

/**
 * <p>
 * A set of utility functions for working with credit card and bank account numbers in the browser,
 * with the primary goal of encrypting them before sending them to the back-end.
 * </p>
 *
 * <p>
 * This library can be obtained via bower:
 * <code>
 *   bower install https://ccp.ccci.org/js/ccp-js-2.zip --save
 * </code>
 * </p>
 *
 * <p>
 * It has the following runtime dependencies:
 * <ul>
 *   <li><code>lodash</code> (underscore would probably work too)</li>
 *   <li><code>jsencrypt</code></li>
 * </ul>
 * These are also downloaded via bower, as you'd expect.
 * </p>
 *
 *
 * <p>
 * The module must first be initialized by calling {@link ccp.initialize}.
 * This stores the encryption key and allows {@link ccp.encrypt} to function.
 * </p>
 *
 *
 * <p>
 * All parameters in this module are required;
 * if either <code>null</code> or <code>undefined</code> is passed as a parameter,
 * an exception will be thrown.
 * </p>
 *
 * @example
 * // First, initialize the ccp module with CCP's current client encryption key.
 * // This can done by either 'hardcoding' the key into your javascript, like this:
 * ccp.initialize('-----BEGIN PUBLIC KEY-----\nMIIBI...');
 *
 * // or by fetching the key asynchronously from a separate url:
 * ccp.initialize($.ajax('https://conferenceregistrationtool.com/ccp-client-encryption-key'));
 * // or
 * ccp.initialize($http
 *   .get('https://conferenceregistrationtool.com/ccp-client-encryption-key')
 *   .then(function(response) {
 *     return response.data;
 *   }));
 * // (You will probably want to add some app-appropriate error handling to your http request.)
 *
 *
 * // Then, in your form handler:
 * var input = “4111 1111 1111 1111”; //spaces and dashes are ok; will be stripped
 * var cardNumber = new ccp.CardNumber(input);
 *
 * var validationError = cardNumber.validate();
 * // -> an error message string that can be shown to an end user, or null if the number is valid
 *
 *
 * var cardType = cardNumber.getType();
 * // -> "VISA", "MASTERCARD", etc
 *
 * var abbreviatedCardNumber = cardNumber.abbreviate();
 * // -> "1111"
 * var maskedCardNumber = cardNumber.mask();
 * // -> "************1111"
 *
 * // (These functions exist to make it easy to show these to the client,
 * // or send them to your server, if desired.
 * // It is not necessary to call these functions.)
 *
 *
 * var encrypted = cardNumber.encrypt();
 * // this can be sent to the server, or wherever, safely. It can only be decrypted by CCP.
 *
 * // A similar sequence of steps can be performed for card security codes and bank account numbers,
 * // but the validation rules will of course be different.
 *
 * @namespace
 */
/* exported ccp */
var ccp = (function () {
  'use strict';

  var module = {};

  var key = null;
  var promise = null;
  var keyFailure = null;
  var encrypter = new JSEncrypt();


  function setKey(publicKey) {
    if (publicKey === '') {
      throw 'given publicKey is empty';
    }
    if (typeof(publicKey) !== 'string') {
      throw 'given publicKey is not a string';
    }
    key = publicKey;
    encrypter.setKey(publicKey);
  }

  /**
   * <p>
   * Initializes the public key.
   * This must be called before {@link ccp.SensitiveDataElement#encrypt} can be used.
   * </p>
   *
   * <p>
   * This function can be used in one of two ways.
   * <ol>
   *   <li>
   *     <p>
   *     Passing a string denoting the literal key to use.
   *     This is useful if the public key is 'rendered' into the javascript on the server.
   *     Note that the key will change from time to time,
   *     so it should not be hardcoded on the server.
   *     Rather, the server should fetch the key from CCP and cache it.
   *     </p>
   *     <p>
   *     This option makes the javascript on the page a little simpler,
   *     but the javascript must be rendered on the server.
   *     </p>
   *   </li>
   *   <li>
   *     <p>
   *     Pass a 'thenable' object, that is, an object with a
   *     {@link https://promisesaplus.com|Promises/A+-compliant} <code>then</code> function.
   *     This function should accept a callback, which will receive the public key as as a string.
   *     jQuery's <code>$.ajax()</code> returns exactly such an object.
   *     AngularJS's <code>$http.get()</code> returns a promise that yields a request object;
   *     this can be 'chained' to create a promise for the public key itself.
   *     (See the example in the overview docs for this module.)
   *     </p>
   *     <p>
   *     This option allows the javascript file to remain static;
   *     it doesn't need to be rendered, as option 1 requires.
   *     However, there are more moving parts client-side,
   *     and client-side error handling is required.
   *     You will probably want to add your own error callback
   *     to the 'thenable' you pass in.
   *     For even more resiliency, you will probably want to add your own success callback
   *     so that you can be sure {@link ccp.encrypt} is not called until the http call returns.
   *     You may also want to add some kind of timeout handling.
   *     </p>
   *
   *
   *
   *     <p>
   *     Note: if the browser has firewall access to the target ccp environment,
   *     then a url like 'https://ccp.ccci.org/api/v1/rest/client-encryption-keys/current'
   *     can be used to retrieve the current key from CCP itself.
   *     This is the most convenient option.
   *     (Though the application's url must be pre-registered with CCP
   *     to get CORS headers set correctly.)
   *
   *     However, this url might not work in the future.
   *     Currently, ccp.ccci.org is open to the internet.
   *     We may eventually change that, though, since it is not strictly required anymore,
   *     and it might protect CCP more and reduce our PCI compliance work.
   *     If that change is made, client systems will need to either:
   *     <ul>
   *       <li>'proxy' the CCP public key url, and use that url their $ajax calls, or</li>
   *       <li>use option 1 instead.</li>
   *     </ul>
   *     </p>
   *   </li>
   * </ol>
   * </p>
   *
   *
   * @function initialize
   * @memberof ccp
   * @param {string|Object} keySource the public encryption key or a promise for it
   *
   * @example
   * <script src="/scripts/ccp.js"></script>
   * <script>
   *   // For example, in an erb template:
   *   ccp.initialize('<%= @currentCcpClientEncryptionKey %>');
   *   // (Note that javascript does not have multiline strings,
   *   // so you will need to either make this a single line
   *   // or break it up into line-sized strings.)
   * </script>
   */
  module.initialize = function (keySource) {
    if (keySource === null) {
      throw 'keySource is null';
    }
    if (typeof(keySource) === 'undefined') {
      throw 'keySource is undefined';
    }
    if (typeof(keySource) === 'string') {
      setKey(keySource);
    } else if (typeof(keySource) === 'object') {
      if (typeof(keySource.then) === 'function') {
        keySource.then(function (promisedKey) {
          try {
            setKey(promisedKey);
          } catch (e) {
            keyFailure = e;
          }
        });
        promise = keySource;
      } else {
        throw 'keySource does not have a "then" function';
      }
    } else {
      throw 'keySource is neither a string nor an Object';
    }
  };


  /**
   * Creates a new SensitiveDataElement object, which can be validated and encrypted.
   * This is only called by the subclass constructors.
   *
   * The encapsulated string can be accessed via the {@code value} field.
   * However, there is probably not much reason to do this.
   *
   * @class
   * @classdesc A superclass of classes that represent sensitive information
   * @memberof ccp
   */
  /* Note: the `@memberof ccp` bit above is somewhat of a lie;
   * this constructor isn't made public by exposing it in the `ccp` object.
   * But that annotation seems to be needed
   * in order to get jsdoc to process this class and generate docs.
   */
  function SensitiveDataElement(input) {
    if (input === null) {
      throw 'input is null';
    }
    if (typeof(input) === 'undefined') {
      throw 'input is undefined';
    }
    this.value = input;
  }

  /**
   * Throws an exception if this data element is not valid.
   * (Undocumented helper method.)
   */
  SensitiveDataElement.prototype.checkValid = function () {
    var error = this.validate();
    if (error !== null) {
      throw error;
    }
  };


  /**
   * <p>
   * Returns the last four digits of this sensitive data element.
   * </p>
   *
   * <p>
   * If this element is invalid, an exception is thrown.
   * </p>
   *
   * @instance
   * @method abbreviate
   * @memberof ccp.SensitiveDataElement
   */
  SensitiveDataElement.prototype.abbreviate = function () {
    this.checkValid();
    var lastDigits = Math.min(4, this.value.length);
    return this.value.substring(this.value.length - lastDigits, this.value.length);
  };

  /**
   * <p>
   * Returns twelve stars concatenated with the last four digits of this sensitive data element.
   * </p>
   *
   * <p>
   * If this element is invalid, an exception is thrown.
   * </p>
   *
   * @instance
   * @method mask
   * @memberof ccp.SensitiveDataElement
   */
  SensitiveDataElement.prototype.mask = function () {
    this.checkValid();
    return '************' + this.abbreviate();
  };


  /**
   * <p>
   * Encrypts this sensitive data element using RSA asymmetric encryption.
   * </p>
   *
   * <p>
   * Only the CCP server will be able to decrypt the resulting value.
   * The resulting string will be several hundred characters long.
   * (Though not more than 1000).
   * </p>
   *
   * <p>
   * If {@link ccp.initialize} has not been called,
   * or if it was called with a promise that is not yet fulfilled or rejected,
   * an exception is thrown.
   * If this data element is invalid, an exception is thrown.
   * </p>
   *
   * @instance
   * @method encrypt
   * @memberof ccp.SensitiveDataElement
   */
  SensitiveDataElement.prototype.encrypt = function () {
    this.checkValid();
    return internalEncrypt(this.value);
  };


  function internalEncrypt(value) {
    checkKey();
    checkValue(value);
    var encrypted = encrypter.encrypt(value);
    if (encrypted === false) {
      throw 'could not encrypt value; is key correct? the key you gave was: ' + key;
    }
    return encrypted;
  }

  function checkKey() {
    if (key === null && promise === null) {
      throw 'ccp has not been initialized;' +
      ' please call initialize() first';
    }
    else if (keyFailure !== null) {
      throw keyFailure;
    }
    else if (key === null) {
      throw 'the promise given in initialize() is still pending';
    }
  }

  /* These generally should not happen, since checkValid() was called.
   * But I think a sanity check is worthwhile anyway;
   * perhaps the user redefined `checkValid()` to something dumb.
   */
  function checkValue(value) {
    if (value === null) {
      throw 'value is null';
    }
    if (typeof(value) === 'undefined') {
      throw 'value is undefined';
    }
    if (value === '') {
      throw 'value is empty';
    }
  }



  /**
   * <p>
   * Creates a new CardNumber object, which can be validated and encrypted.
   * </p>
   *
   * <p>
   * The card number may contain extra spaces and dashes,
   * as this can be more convenient for the user.
   * (Let's not end up on the
   * <a href="http://www.unixwiz.net/ndos-shame.html">"No Dashes Or Spaces" Hall of Shame</a>.)
   * Spaces and dashes are silently stripped away.
   * Leading and trailing whitespace (including tabs and such) are also stripped.
   * </p>
   *
   * @class
   * @extends ccp.SensitiveDataElement
   * @classdesc represents a payment card number (credit card or bank card)
   * @memberof ccp
   */
  function CardNumber(input) {
    SensitiveDataElement.call(this, stripDashesAndSpaces(input));
  }
  CardNumber.prototype = Object.create(SensitiveDataElement.prototype);
  CardNumber.prototype.constructor = CardNumber;

  module.CardNumber = CardNumber;

  /**
   * <p>
   * Validates this card number,
   * returning an error message string that can be shown to an end user.
   * If the returned value is null, the card number is valid and will not be rejected
   * when submitted to CCP.
   * </p>
   *
   * <p>
   * Specifically, this verifies that the given card number:
   * <ul>
   *   <li>is a non-empty string</li>
   *   <li>is only made of digits</li>
   *   <li>has the right number of digits</li>
   *   <li>passes the luhn check</li>
   *   <li>is a number that is issued by a card issuer {@link ccp.CardNumber#getType we accept}</li>
   * </ul>
   * </p>
   *
   * @instance
   * @method validate
   * @memberof ccp.CardNumber
   */
  CardNumber.prototype.validate = function () {
    checkNotNullAndDefined(this.value);
    if (this.value === '') {
      return 'card number is blank';
    }

    var error = validateSizeAndDigits(this.value, 'card number', 13, 16);

    if (error !== null) {
      return error;
    }

    try {
      getCardType(this.value);
    }
    catch (errorMessage) {
      return errorMessage;
    }

    if (!luhnCheck(this.value)) {
      return 'card number is invalid; at least one digit is wrong';
    }

    return null;
  };


  /* adapted from http://rosettacode.org/wiki/Luhn_test_of_credit_card_numbers#JavaScript */

  var luhnArray = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];

  function luhnCheck(cardNumber) {
    var counter = 0;
    var odd = false;
    for (var i = cardNumber.length - 1; i >= 0; --i)
    {
      var digit = parseInt(cardNumber.charAt(i), 10);
      counter += (odd = !odd) ? digit : luhnArray[digit];
    }
    return (counter % 10 === 0);
  }




  /**
   * <p>
   * Returns the 'issuer' of the card identified by this card number.
   * </p>
   *
   * <p>
   * The returned value will be one of:
   * <ul>
   *   <li>VISA</li>
   *   <li>MASTERCARD</li>
   *   <li>AMERICAN_EXPRESS</li>
   *   <li>DISCOVER</li>
   *   <li>DINERS_CLUB</li>
   * </ul>
   * </p>
   *
   * <p>
   * If this card number is invalid, an exception is thrown.
   * </p>
   *
   * @instance
   * @method getType
   * @memberof ccp.CardNumber
   */
  CardNumber.prototype.getType = function () {
    this.checkValid();
    return getCardType(this.value);
  };

  function getCardType(cardNumber) {
    var type = _.find(cardTypes, function (cardType) {
      var cardExpression = new RegExp('^' + cardType.prefixExpression);
      if (cardExpression.test(cardNumber)) {
        return checkLength(cardType, cardNumber);
      }
    });
    if (type) {
      return type.name;
    }
    else
    {
      var format = ':number has not been issued by a card issuer this system accepts';
      throw  format.replace(':number', cardNumber);
    }
  }

  var cardTypes = [
    {
      name: 'VISA',
      displayName: 'Visa',
      lengths: [13, 16],
      prefixExpression: '4'
    },
    {
      name: 'MASTERCARD',
      displayName: 'MasterCard',
      lengths: [16],
      prefixExpression: '5[1-5]'
    },
    {
      name: 'AMERICAN_EXPRESS',
      displayName: 'American Express',
      lengths: [15],
      prefixExpression: '3[4,7]'
    },
    {
      name: 'DISCOVER',
      displayName: 'Discover',
      lengths: [16],
      prefixExpression: '((65)|(64[4-9])|(622)|(6011)|(35[2-8]))'
    },
    {
      name: 'DINERS_CLUB',
      displayName: 'Diners Club',
      lengths: [14],
      prefixExpression: '((36)|(30[0-5]))'
    }
  ];



  function checkLength(cardType, cardNumber) {
    if (_.contains(cardType.lengths, cardNumber.length)) {
      return cardType.name;
    }
    else {
      var format =
        ':number is an invalid :type number; ' +
        'it should have :expectedDigits digits (this number has :actualDigits)';
      throw  format
        .replace(':number', cardNumber)
        .replace(':type', cardType.displayName)
        .replace(':expectedDigits', cardType.lengths.join(' or '))
        .replace(':actualDigits', cardNumber.length);
    }
  }



  /**
   * <p>
   * Creates a new CardSecurityCode object, which can be validated and encrypted.
   * </p>
   *
   * <p>
   * Spaces and dashes are silently stripped away.
   * Leading and trailing whitespace (including tabs and such) are also stripped.
   * </p>
   *
   * @class
   * @extends ccp.SensitiveDataElement
   * @classdesc Represents a card security code, also known as CVV2, CVC2, CID, or CSC
   * @memberof ccp
   */
  function CardSecurityCode(input) {
    SensitiveDataElement.call(this, stripDashesAndSpaces(input));
  }
  CardSecurityCode.prototype = Object.create(SensitiveDataElement.prototype);
  CardSecurityCode.prototype.constructor = CardSecurityCode;

  module.CardSecurityCode = CardSecurityCode;

  function stripDashesAndSpaces(input) {
    if (input === null || typeof(input) === 'undefined') {
      // let SensitiveDataElement deal with the error
      return input;
    }
    return input.trim().replace(/[ -]/g, '');
  }

  /**
   * <p>
   * Validates this card security code,
   * returning an error message string that can be shown to an end user.
   * If the returned value is null, the code is valid and will not be rejected
   * when submitted to CCP.
   * </p>
   *
   * <p>
   * Specifically, this verifies that this card security code:
   * <ul>
   *   <li>is a non-empty string</li>
   *   <li>is only made of digits</li>
   *   <li>has 3 or four digits</li>
   * </ul>
   * </p>
   *
   * @instance
   * @method validate
   * @memberof ccp.CardSecurityCode
   */
  CardSecurityCode.prototype.validate = function () {
    checkNotNullAndDefined(this.value);

    if (this.value === '') {
      return 'card security code is blank';
    }

    return validateSizeAndDigits(this.value, 'card security code', 3, 4);
  };

  function validateSizeAndDigits(value, name, min, max) {
    if (!value.match(/^\d+$/)) {
      return name + ' is not numeric';
    }
    return validateSize(value, name, min, max);
  }


  /**
   * <p>
   * Creates a new BankAccountNumber object, which can be validated and encrypted.
   * </p>
   *
   * <p>
   * Leading and trailing spaces are silently stripped away.
   * Internal spaces and dashes are preserved.
   * </p>
   *
   * @class
   * @extends ccp.SensitiveDataElement
   * @classdesc Represents a bank account number
   * @memberof ccp
   */
  function BankAccountNumber(input) {
    SensitiveDataElement.call(this, input.trim());
  }
  BankAccountNumber.prototype = Object.create(SensitiveDataElement.prototype);
  BankAccountNumber.prototype.constructor = BankAccountNumber;

  module.BankAccountNumber = BankAccountNumber;

  /**
   * <p>
   * Validates this bank account number,
   * returning an error message string that can be shown to an end user.
   * If the returned value is null, the code is valid and will not be rejected
   * when submitted to CCP.
   * </p>
   *
   * <p>
   * Specifically, this verifies that this bank account number:
   * <ul>
   *   <li>is a non-empty string</li>
   *   <li>is only made of digits, spaces, and dashes</li>
   *   <li>has 17 or less characters</li>
   * </ul>
   * </p>
   *
   * @instance
   * @method validate
   * @memberof ccp.BankAccountNumber
   */
  BankAccountNumber.prototype.validate = function () {
    checkNotNullAndDefined(this.value);

    if (this.value === '') {
      return 'bank account number is blank';
    }

    if (!this.value.match(/^[\d\- ]+$/)) {
      return 'bank account number may only contain digits, spaces, and dashes';
    }
    return validateSize(this.value, 'bank account number', 1, 17);
  };

  /**
   * The constructor prevents these,
   * but the `value` field is public and can be set to a null or undefined value,
   * so we re-check them.
   */
  function checkNotNullAndDefined(input) {
    if (input === null) {
      throw  'input is null';
    }
    if (typeof(input) === 'undefined') {
      throw 'input is undefined';
    }
  }

  function validateSize(value, name, min, max) {
    if (value.length < min) {
      return name + ' is too short';
    }
    if (value.length > max) {
      return name + ' is too long';
    }
    return null;
  }



  /*
   * Undocumented helper method for test suite.
   * Clears out the stored encryption key.
   */
  module.internalReset = function () {
    key = null;
    promise = null;
    keyFailure = null;
    encrypter = new JSEncrypt();
  };

  return module;

}());

export default ccp;
