import angular from 'angular';
import 'angular-mocks';
import ccp from 'common/lib/ccp';
import { ccpStagingKey } from 'common/app.constants';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import module from './paymentValidation.service';

describe('payment validation service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(() => {
    angular.mock.module(($provide) => {
      $provide.value('ccpService', {
        get: () => {
          ccp.initialize(ccpStagingKey);
          return Observable.of(ccp);
        }
      });
    });
  });

  beforeEach(inject((paymentValidationService) => {
    self.paymentValidationService = paymentValidationService;
  }));

  describe('validateRoutingNumber', () => {
    it('should return true for valid routing numbers', () => {
      expect(self.paymentValidationService.validateRoutingNumber()(267084131)).toEqual(true);
      expect(self.paymentValidationService.validateRoutingNumber()('021300420')).toEqual(true);
      expect(self.paymentValidationService.validateRoutingNumber()('043318092')).toEqual(true);
      expect(self.paymentValidationService.validateRoutingNumber()(122038251)).toEqual(true);
    });
    it('should return false for invalid routing numbers', () => {
      expect(self.paymentValidationService.validateRoutingNumber()(267084132)).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()(121300420)).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()(943318092)).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()(122030251)).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()()).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()(undefined)).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()(null)).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()('')).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()(1)).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()(12345678)).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()(1234567890)).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()(1234567890123456)).toEqual(false);
    });
  });

  describe('validateCardNumber', () => {
    it('should return false for an invalid number', () => {
      expect(self.paymentValidationService.validateCardNumber()('5800000000000000')).toEqual(false);
      expect(self.paymentValidationService.validateCardNumber()(null)).toEqual(false);
      expect(self.paymentValidationService.validateCardNumber()(undefined)).toEqual(false);
      expect(self.paymentValidationService.validateCardNumber()('')).toEqual(false);
      expect(self.paymentValidationService.validateCardNumber()('abcdabcdabcdabcd')).toEqual(false);
      expect(self.paymentValidationService.validateCardNumber()('4111111')).toEqual(false);
      expect(self.paymentValidationService.validateCardNumber()('411')).toEqual(false);
      expect(self.paymentValidationService.validateCardNumber()('4111111111111111111111')).toEqual(false);
      expect(self.paymentValidationService.validateCardNumber()('5800000000000000')).toEqual(false);
      expect(self.paymentValidationService.validateCardNumber()('411111111111111')).toEqual(false);
      expect(self.paymentValidationService.validateCardNumber()('4111111111111112')).toEqual(false);
      expect(self.paymentValidationService.validateCardNumber()('5111111111111111')).toEqual(false);
      expect(self.paymentValidationService.validateCardNumber()('4111 1111 1111 1111')).toEqual(true);
    });
  });

  describe('getCardNumberErrorMessage', () => {
    it('should return an error for an empty card number', () => {
      expect(self.paymentValidationService.getCardNumberErrorMessage(null)).toEqual('Card number is blank');
      expect(self.paymentValidationService.getCardNumberErrorMessage(undefined)).toEqual('Card number is blank');
      expect(self.paymentValidationService.getCardNumberErrorMessage('')).toEqual('Card number is blank');
      //Non-digits are stripped
      expect(self.paymentValidationService.getCardNumberErrorMessage('abcdabcdabcdabcd')).toEqual('Card number is blank');
    });
    it('should return an error if the card number is too short', () => {
      expect(self.paymentValidationService.getCardNumberErrorMessage('4111111')).toEqual('Card number is too short');
      expect(self.paymentValidationService.getCardNumberErrorMessage('411')).toEqual('Card number is too short');
    });
    it('should return an error if the card number is too long', () => {
      expect(self.paymentValidationService.getCardNumberErrorMessage('4111111111111111111111')).toEqual('Card number is too long');
    });
    it('should return an error for a valid number that doesn\'t match a card issuer', () => {
      expect(self.paymentValidationService.getCardNumberErrorMessage('5800000000000000')).toEqual('5800000000000000 has not been issued by a card issuer this system accepts');
    });
    it('should return an error if the card number is the wrong length for a card issuer', () => {
      expect(self.paymentValidationService.getCardNumberErrorMessage('411111111111111')).toEqual('411111111111111 is an invalid visa number; it should have 13 or 16 digits (this number has 15)');
    });
    it('should return an error if the card number is invalid', () => {
      expect(self.paymentValidationService.getCardNumberErrorMessage('4111111111111112')).toEqual('Card number is invalid; at least one digit is wrong');
      expect(self.paymentValidationService.getCardNumberErrorMessage('5111111111111111')).toEqual('Card number is invalid; at least one digit is wrong');
    });
    it('should return an empty string for a valid number with no errors', () => {
      expect(self.paymentValidationService.getCardNumberErrorMessage('4111 1111 1111 1111')).toEqual('');
    });
  });

  describe('validateCardSecurityCode', () => {
    it('should return false for a code of invalid length', () => {
      expect(self.paymentValidationService.validateCardSecurityCode()('12')).toEqual(false);
      expect(self.paymentValidationService.validateCardSecurityCode()('12345')).toEqual(false);
    });
    it('should return true for a code of valid length', () => {
      expect(self.paymentValidationService.validateCardSecurityCode()('123')).toEqual(true);
      expect(self.paymentValidationService.validateCardSecurityCode()('1234')).toEqual(true);
    });
  });

  describe('stripNonDigits', () => {
    it('should remove all non digits from a string', () => {
      expect(self.paymentValidationService.stripNonDigits('12')).toEqual('12');
      expect(self.paymentValidationService.stripNonDigits('12345')).toEqual('12345');
      expect(self.paymentValidationService.stripNonDigits('&1a23-4 5')).toEqual('12345');
      expect(self.paymentValidationService.stripNonDigits('1234567890')).toEqual('1234567890');
      expect(self.paymentValidationService.stripNonDigits('!@#1 23_4567-89 0 ')).toEqual('1234567890');
    });
  });
});
