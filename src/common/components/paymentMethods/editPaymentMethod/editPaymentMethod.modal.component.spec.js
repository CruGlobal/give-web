import angular from 'angular';
import 'angular-mocks';
import module from './editPaymentMethod.modal.component';


describe('editPaymentMethodModal', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {};
  var cc = {
    'paymentType': 'creditCard',
    'model': {
      'card-number': '1111',
      'card-type': 'Visa'
    }
  };
  var eft = {
    'paymentType': 'bankAccount',
    'model': {
      'display-account-number': '2222',
      'bank-name': 'Moral Bank'
    }
  };

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope
    });

    self.controller.resolve = {};

  }));

  it('to be defined', function() {
    expect(self.controller).toBeDefined();
  });

  describe( 'getAccountNumber()', () => {
    it( 'returns account number based on what payment method it is', () => {
      self.controller.resolve = cc;
      expect(self.controller.getAccountNumber()).toBe('1111');
      self.controller.resolve = eft;
      expect(self.controller.getAccountNumber()).toBe('2222');
    } );
  });

  describe( 'getNickname()', () => {
    it( 'returns account number based on what payment method it is', () => {
      self.controller.resolve = cc;
      expect(self.controller.getNickname()).toBe('Visa');
      self.controller.resolve = eft;
      expect(self.controller.getNickname()).toBe('Moral Bank Account');
    } );
  });

  describe( 'getIcon()', () => {
    it( 'returns a part of image class', () => {
      self.controller.resolve = cc;
      expect(self.controller.getIcon()).toBe('visa');
      self.controller.resolve = eft;
      expect(self.controller.getIcon()).toBe('bank');
    } );
  });

});
