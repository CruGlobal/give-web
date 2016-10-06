import angular from 'angular';
import 'angular-mocks';
import module from 'app/profile/payment-methods/credit-card/credit-card.component.js';

describe('credit card payment methods', function () {
  beforeEach(angular.mock.module(module.name));
  var self = {},
    envService = {
      read: angular.noop
    },
    uibModal = jasmine.createSpyObj('$uibModal', ['open']),
    model = {
      'expiry-month': '05',
      'expiry-year': '2019',
      'card-type': 'American Express',
      'creditcard': {
        'address': {
          'country-name': 'US',
          'street-address': '123',
          'extended-address': '',
          'locality': 'SLC',
          'region': 'UT',
          'postal-code': '44444'
        },
        'recurringgifts': {
          'donations': []
        }
      }
    };

  beforeEach(inject(function ($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope,
      envService: envService,
      $uibModal: uibModal
    });

  }));

  beforeEach(() => {
    self.controller.model = model;
  });

  it('to be defined', () => {
    expect(self.controller).toBeDefined();
  });

  it('should set data on $onInit()', () => {

    self.controller.$onInit();
    expect(self.controller.formattedAddress).toBeTruthy();
    self.controller.model['creditcard'] = undefined;
    self.controller.$onInit();
    expect(self.controller.formattedAddress).toBe(false);
  });

  it('should return expiration date', () => {
    expect(self.controller.getExpiration()).toBe('05/2019');
  });

  it('should return part of image url path', () => {
    expect(self.controller.getImage()).toBe('american-express');
  });

  it('should call Edit Modal', () => {
    self.controller.editPaymentMethod();
    expect(self.controller.$uibModal.open).toHaveBeenCalled();
  });

  it('should call Delete Modal', () => {
    self.controller.deletePaymentMethod();
    expect(self.controller.$uibModal.open).toHaveBeenCalled();
  });

  it('should destroy modal instances if they exist', () => {
    self.controller.deletePaymentMethodModal = jasmine.createSpyObj('deletePaymentMethodModal', ['dismiss']);
    self.controller.editPaymentMethodModal = jasmine.createSpyObj('editPaymentMethodModal', ['dismiss']);
    self.controller.$onDestroy();
    expect(self.controller.deletePaymentMethodModal.dismiss).toHaveBeenCalled();
    expect(self.controller.editPaymentMethodModal.dismiss).toHaveBeenCalled();
  });
});
