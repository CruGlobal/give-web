import angular from 'angular';
import 'angular-mocks';
import module from './paymentValidation.service.js';

describe('payment validation service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function(paymentValidationService) {
    self.paymentValidationService = paymentValidationService;
  }));

  it('to be defined', () => {
    expect(self.paymentValidationService).toBeDefined();
  });

  describe('validateRoutingNumber', () => {
    it('to return true for empty values to let other validators handle empty condition', () => {
      expect(self.paymentValidationService.validateRoutingNumber()()).toEqual(true);
      expect(self.paymentValidationService.validateRoutingNumber()(undefined)).toEqual(true);
      expect(self.paymentValidationService.validateRoutingNumber()(null)).toEqual(true);
      expect(self.paymentValidationService.validateRoutingNumber()('')).toEqual(true);
    });
    it('to return true for numbers shorter than 9 to let other validators handle incorrect length', () => {
      expect(self.paymentValidationService.validateRoutingNumber()(1)).toEqual(true);
      expect(self.paymentValidationService.validateRoutingNumber()(12345678)).toEqual(true);
    });
    it('to return true for numbers longer than 9 to let other validators handle incorrect length', () => {
      expect(self.paymentValidationService.validateRoutingNumber()(1234567890)).toEqual(true);
      expect(self.paymentValidationService.validateRoutingNumber()(1234567890123456)).toEqual(true);
    });
    it('to return true for valid routing numbers', () => {
      expect(self.paymentValidationService.validateRoutingNumber()(267084131)).toEqual(true);
      expect(self.paymentValidationService.validateRoutingNumber()('021300420')).toEqual(true);
      expect(self.paymentValidationService.validateRoutingNumber()('043318092')).toEqual(true);
      expect(self.paymentValidationService.validateRoutingNumber()(122038251)).toEqual(true);
    });
    it('to return false for invalid routing numbers', () => {
      expect(self.paymentValidationService.validateRoutingNumber()(267084132)).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()(121300420)).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()(943318092)).toEqual(false);
      expect(self.paymentValidationService.validateRoutingNumber()(122030251)).toEqual(false);
    });
  });

  describe('validateCardNumber', () => {
    it('to return false for an invalid number', () => {
      expect(self.paymentValidationService.validateCardNumber()('5800000000000000')).toEqual(false);
    });
    it('to return true for a valid VISA number', () => {
      expect(self.paymentValidationService.validateCardNumber()('4111 1111 1111 1111')).toEqual(true);
    });
  });

  describe('validateCardSecurityCode', () => {
    it('to return false for a code of invalid length', () => {
      expect(self.paymentValidationService.validateCardSecurityCode()('12')).toEqual(false);
      expect(self.paymentValidationService.validateCardSecurityCode()('12345')).toEqual(false);
    });
    it('to return true for a code of valid length', () => {
      expect(self.paymentValidationService.validateCardSecurityCode()('123')).toEqual(true);
      expect(self.paymentValidationService.validateCardSecurityCode()('1234')).toEqual(true);
    });
  });

  describe('stripNonDigits', () => {
    it('to remove all non digits from a string', () => {
      expect(self.paymentValidationService.stripNonDigits('12')).toEqual('12');
      expect(self.paymentValidationService.stripNonDigits('12345')).toEqual('12345');
      expect(self.paymentValidationService.stripNonDigits('&1a23-4 5')).toEqual('12345');
      expect(self.paymentValidationService.stripNonDigits('1234567890')).toEqual('1234567890');
      expect(self.paymentValidationService.stripNonDigits('!@#1 23_4567-89 0 ')).toEqual('1234567890');
    });
  });
});
