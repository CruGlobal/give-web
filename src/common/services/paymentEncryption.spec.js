import angular from 'angular';
import 'angular-mocks';
import module from './paymentEncryption.service';

describe('payment encryption service', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function(paymentEncryptionService) {
    self.paymentEncryptionService = paymentEncryptionService;
  }));

  it('to be defined', function() {
    expect(self.paymentEncryptionService).toBeDefined();
  });
});
