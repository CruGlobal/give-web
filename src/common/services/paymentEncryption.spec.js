import angular from 'angular';
import 'angular-mocks';
import module from './paymentEncryption.service';

describe('payment encryption service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function(paymentEncryptionService) {
    self.paymentEncryptionService = paymentEncryptionService;
  }));

  it('to be defined', () => {
    expect(self.paymentEncryptionService).toBeDefined();
  });

  describe('validateRoutingNumber', () => {
    it('to return false for numbers shorter than 9', () => {
      expect(self.paymentEncryptionService.validateRoutingNumber()(1)).toEqual(false);
      expect(self.paymentEncryptionService.validateRoutingNumber()(12345678)).toEqual(false);
    });
    it('to return false for numbers longer than 9', () => {
      expect(self.paymentEncryptionService.validateRoutingNumber()(1234567890)).toEqual(false);
      expect(self.paymentEncryptionService.validateRoutingNumber()(1234567890123456)).toEqual(false);
    });
    it('to return true for valid routing numbers', () => {
      expect(self.paymentEncryptionService.validateRoutingNumber()(267084131)).toEqual(true);
      expect(self.paymentEncryptionService.validateRoutingNumber()('021300420')).toEqual(true);
      expect(self.paymentEncryptionService.validateRoutingNumber()('043318092')).toEqual(true);
      expect(self.paymentEncryptionService.validateRoutingNumber()(122038251)).toEqual(true);
    });
    it('to return false for invalid routing numbers', () => {
      expect(self.paymentEncryptionService.validateRoutingNumber()(267084132)).toEqual(false);
      expect(self.paymentEncryptionService.validateRoutingNumber()(121300420)).toEqual(false);
      expect(self.paymentEncryptionService.validateRoutingNumber()(943318092)).toEqual(false);
      expect(self.paymentEncryptionService.validateRoutingNumber()(122030251)).toEqual(false);
    });
  });

  describe('validateCardNumber', () => {
    it('to return false for an invalid number', () => {
      expect(self.paymentEncryptionService.validateCardNumber()('5800000000000000')).toEqual(false);
    });
    it('to return true for a valid VISA number', () => {
      expect(self.paymentEncryptionService.validateCardNumber()('4111 1111 1111 1111')).toEqual(true);
    });
  });

  describe('validateCardSecurityCode', () => {
    it('to return false for a code of invalid length', () => {
      expect(self.paymentEncryptionService.validateCardSecurityCode()('12')).toEqual(false);
      expect(self.paymentEncryptionService.validateCardSecurityCode()('12345')).toEqual(false);
    });
    it('to return true for a code of valid length', () => {
      expect(self.paymentEncryptionService.validateCardSecurityCode()('123')).toEqual(true);
      expect(self.paymentEncryptionService.validateCardSecurityCode()('1234')).toEqual(true);
    });
  });

  describe('getCardType', () => {
    it('to return the correct card types', () => {
      expect(self.paymentEncryptionService.getCardType('4024007192720596')).toEqual('VISA');
      expect(self.paymentEncryptionService.getCardType('5116410773439691')).toEqual('MASTERCARD');
      expect(self.paymentEncryptionService.getCardType('6011575065399193')).toEqual('DISCOVER');
      expect(self.paymentEncryptionService.getCardType('373330705156420')).toEqual('AMERICAN_EXPRESS');
      expect(self.paymentEncryptionService.getCardType('30060165822352')).toEqual('DINERS_CLUB');
    });
  });

  describe('encrypt', () => {
    it('to return the encrypted version of a number', () => {
      expect(self.paymentEncryptionService.encrypt('4024007192720596').length).toBeGreaterThan(100);
      expect(self.paymentEncryptionService.encrypt('5116410773439691').length).toBeGreaterThan(100);
      expect(self.paymentEncryptionService.encrypt('123').length).toBeGreaterThan(100);
      expect(self.paymentEncryptionService.encrypt('1234').length).toBeGreaterThan(100);
      expect(self.paymentEncryptionService.encrypt('123456789').length).toBeGreaterThan(100);
    });
  });

  describe('stripNonNumbers', () => {
    it('to convert imputs to strings', () => {
      expect(self.paymentEncryptionService.stripNonNumbers()).toEqual('');
      expect(self.paymentEncryptionService.stripNonNumbers(null)).toEqual('');
      expect(self.paymentEncryptionService.stripNonNumbers(1)).toEqual('1');
      expect(self.paymentEncryptionService.stripNonNumbers(1234567890)).toEqual('1234567890');
      expect(self.paymentEncryptionService.stripNonNumbers('123456')).toEqual('123456');
    });
    it('to remove all non numbers', () => {
      expect(self.paymentEncryptionService.stripNonNumbers('q2fha3w78')).toEqual('2378');
      expect(self.paymentEncryptionService.stripNonNumbers('*&^71q@)(h(201JK&@')).toEqual('71201');
    });
  });
});
