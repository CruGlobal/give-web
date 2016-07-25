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
 *
 * A set of utility functions for working with credit card numbers in the browser,
 * with the primary goal of encrypting them before sending them to the back-end.
 *
 * This library can be obtained via bower:
 * <code>
 *   bower install https://ccp.ccci.org/js/ccp-js.zip --save
 * </code>
 *
 * It has the following runtime dependencies:
 * <ul>
 *   <li><code>lodash</code> (underscore would probably work too)</li>
 *   <li><code>jsencrypt</code></li>
 * </ul>
 * These are also downloaded via bower, as you'd expect.
 *
 *
 * <p>
 * The module must first be initialized by calling {@link ccp.initialize}.
 * This stores the encryption key and allows {@link ccp.encrypt} to function.
 *
 *
 * <p>
 * All parameters in this module are required; if <code>null</code> is passed as a parameter,
 * an exception will be thrown.
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
 * var cardNumber = “4111 1111 1111 1111”; //spaces and dashes are ok; will be stripped
 *
 * var validationError = ccp.validateCardNumber(cardNumber);
 * // -> an error message string that can be shown to an end user, or null if the number is valid
 *
 *
 * var cardType = ccp.getCardType(cardNumber);
 * // -> "VISA", "MASTERCARD", etc
 *
 * var abbreviatedCardNumber = ccp.getAbbreviatedNumber(cardNumber);
 * // -> "1111"
 *
 * // (These functions exist to make it easy to show these to the client,
 * // or send them to your server, if desired.
 * // It is not necessary to call these functions.)
 *
 *
 * var encrypted = ccp.encrypt(cardNumber);
 * // this can be sent to the server, or wherever, safely. It can only be decrypted by CCP.
 *
 *
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
   * Initializes the public key. This must be called before {@link ccp.encrypt} can be used.
   *
   * <p>
   * This function can be used in one of two ways.
   * <ol>
   *   <li>
   *     Passing a string denoting the literal key to use.
   *     This is useful if the public key is 'rendered' into the javascript on the server.
   *     Note that the key will change from time to time,
   *     so it should not be hardcoded on the server.
   *     Rather, the server should fetch the key from CCP and cache it.
   *     <p>
   *     This option makes the javascript on the page a little simpler,
   *     but the javascript must be rendered on the server.
   *   </li>
   *   <li>
   *     Pass a 'thenable' object, that is, an object with a
   *     {@link https://promisesaplus.com|Promises/A+-compliant} <code>then</code> function.
   *     This function should accept a callback, which will receive the public key as as a string.
   *     jQuery's <code>$.ajax()</code> returns exactly such an object.
   *     AngularJS's <code>$http.get()</code> returns a promise that yields a request object;
   *     this can be 'chained' to create a promise for the public key itself.
   *     (See the example in the overview docs for this module.)
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
   *   </li>
   * </ol>
   *
   *
   * @function initialize
   * @memberof ccp
   * @param {string|Object} keySource the public encryption key or a promise for it
   *
   * @example
   * <pre>
   * &lt;script src="/scripts/ccp.js"&gt;&lt;/script&gt;
   * &lt;script&gt;
   *   // For example, in an erb template:
   *   ccp.initialize('&lt;%= @currentCcpClientEncryptionKey %&gt;');
   *   // (Note that javascript does not have multiline strings,
   *   // so you will need to either make this a single line
   *   // or break it up into line-sized strings.)
   * &lt;/script&gt;
   * </pre>
   */
  module.initialize = function (keySource) {
    if (keySource === null) {
      throw 'keySource is null';
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
   * Validates the given card number,
   * returning an an error message string that can be shown to an end user.
   * If the returned value is null, the card number is valid and will not be rejected
   * when submitted to CCP.
   *
   * The card number may contain extra spaces and dashes,
   * as this can be more convenient for the user.
   * They are ignored by this validation logic.
   * (Let's not end up on the
   * <a href="http://www.unixwiz.net/ndos-shame.html">"No Dashes Or Spaces" Hall of Shame</a>.)
   *
   * <p>
   * Specifically, this verifies that the given card number:
   * <ul>
   *   <li>is a non-empty string</li>
   *   <li>is only made of digits</li>
   *   <li>has the right number of digits</li>
   *   <li>passes the luhn check</li>
   *   <li>is a number that is issued by a card issuer {@link ccp.getCardType we accept}</li>
   * </ul>
   *
   *
   * @function validateCardNumber
   * @memberof ccp
   * @param {string} cardNumber the potentially invalid card number
   */
  module.validateCardNumber = function (cardNumber) {
    var error = validateNonemptySizeAndDigits(cardNumber);

    if (error !== null) {
      return error;
    }

    cardNumber = stripDashesAndSpaces(cardNumber);
    try {
      getType(cardNumber);
    }
    catch (errorMessage) {
      return errorMessage;
    }

    if (!luhnCheck(cardNumber)) {
      return 'card number is invalid; at least one digit is wrong';
    }

    return null;
  };


  function validateNonemptySizeAndDigits(cardNumber) {
    if (cardNumber === null) {
      throw 'cardNumber is null';
    }

    if (cardNumber === '') {
      return 'card number is blank';
    }
    cardNumber = stripDashesAndSpaces(cardNumber);
    return validateSizeAndDigits(cardNumber, 'card number', 13, 16);
  }

  function stripDashesAndSpaces(creditCardNumber) {
    return creditCardNumber.replace(/[ -]/g, '');
  }

  /* adapted from http://rosettacode.org/wiki/Luhn_test_of_credit_card_numbers#JavaScript */
  function luhnCheck(cardNumber) {
    var counter = 0;
    var odd = false;
    for (var i = cardNumber.length - 1; i >= 0; --i)
    {
      var digit = parseInt(cardNumber.charAt(i), 10);
      counter += (odd = !odd) ? digit : luhnArr[digit];
    }
    return (counter % 10 === 0);
  }

  var luhnArr = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];

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

  function getType(cardNumber) {
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
   * Validates the given card security code (aka CVV2, CVC2, CID, or CSC),
   * returning an error message string that can be shown to an end user.
   * If the returned value is null, the code is valid and will not be rejected
   * when submitted to CCP.
   *
   * <p>
   * Specifically, this verifies that the given card number:
   * <ul>
   *   <li>is a non-empty string</li>
   *   <li>is only made of digits</li>
   *   <li>has 3 or four digits</li>
   * </ul>
   *
   *
   * @function validateCardSecurityCode
   * @memberof ccp
   * @param {string} cardSecurityCode the potentially invalid card security code
   */
  module.validateCardSecurityCode = function (cardSecurityCode) {
    if (cardSecurityCode === null) {
      throw 'cardSecurityCode is null';
    }

    if (cardSecurityCode === '') {
      return 'card security code is blank';
    }

    return validateSizeAndDigits(cardSecurityCode, 'card security code', 3, 4);
  };

  function validateSizeAndDigits(value, name, min, max) {
    if (!value.match(/^\d+$/)) {
      return name + ' is not numeric';
    }
    if (value.length < min) {
      return name + ' is too short';
    }
    if (value.length > max) {
      return name + ' is too long';
    }
    return null;
  }


  /**
   * Returns the 'issuer' of the card identified by the given number.
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
   *
   * <p>
   * If the card number is invalid, an exception is thrown.
   *
   * @function getCardType
   * @memberof ccp
   * @param {string} cardNumber
   */
  module.getCardType = function (cardNumber) {
    var stripped = basicValidateAndStrip(cardNumber);
    return getType(stripped);
  };


  /**
   * Returns the last four digits of the card number.
   *
   * If the card number is invalid, an exception is thrown.
   *
   * @function getAbbreviatedNumber
   * @memberof ccp
   * @param {string} cardNumber
   */
  module.getAbbreviatedNumber = function (cardNumber) {
    var stripped = basicValidateAndStrip(cardNumber);
    return stripped.substring(stripped.length - 4, stripped.length);
  };

  function basicValidateAndStrip(cardNumber) {
    var error = validateNonemptySizeAndDigits(cardNumber);
    if (error !== null) {
      throw error;
    }

    return stripDashesAndSpaces(cardNumber);
  }


  /**
   * Encrypts the given card number or card security code using RSA asymmetric encryption.
   *
   * <p>
   * Only the CCP server will be able to decrypt the resulting value.
   * The resulting string will be several hundred characters long.
   * (Though not more than 1000).
   *
   * <p>
   * If @{link ccp.initialize} has not been called,
   * or if it was called with a promise that is not yet fulfilled or rejected,
   * an exception is thrown.
   * If the given value is null or empty, an exception is thrown.
   *
   * @function encrypt
   * @memberof ccp
   * @param {string} value the plaintext card number or card security code to encrypt
   */
  module.encrypt = function (value) {
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

    if (value === null) {
      throw 'value is null';
    }
    if (value === '') {
      throw 'value is empty';
    }

    var stripped = stripDashesAndSpaces(value);
    var encrypted = encrypter.encrypt(stripped);
    if (encrypted === false)
    {
      throw 'could not encrypt value; is key correct? the key you gave was: ' + key;
    }
    return encrypted;
  };


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
