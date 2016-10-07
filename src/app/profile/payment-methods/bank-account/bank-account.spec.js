import angular from 'angular';
import 'angular-mocks';
import module from './bank-account.component';

describe('bank account payment method', function() {
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

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope,
      envService: envService,
      $uibModal: uibModal
    },{
      'paymentMethodsList': [{}]
    });

    self.controller.model = model;
  }));

  it('to be defined', function() {
    expect(self.controller).toBeDefined();
  });

  it('should return expiration date', () => {
    self.controller.model['expiry-month'] = '05';
    self.controller.model['expiry-year'] = '2019';
    expect(self.controller.getExpiration()).toBe('05/2019');
  });

  it('should call edit modal', () => {
    self.controller.editPaymentMethod();
    expect(self.controller.$uibModal.open).toHaveBeenCalled();
    expect(self.controller.$uibModal.open.calls.first().args[0].resolve.model()).toEqual(model);
    expect(self.controller.$uibModal.open.calls.first().args[0].resolve.paymentType()).toBe('bankAccount');
    expect(self.controller.$uibModal.open.calls.first().args[0].resolve.submissionError()).toEqual({ error: '' });
  });

  it('should call delete modal', () => {
    self.controller.deletePaymentMethod();
    expect(self.controller.$uibModal.open).toHaveBeenCalled();
    expect(self.controller.$uibModal.open.calls.mostRecent().args[0].resolve.paymentMethod()).toEqual(model);
    expect(self.controller.$uibModal.open.calls.mostRecent().args[0].resolve.paymentMethodsList().length).toBe(1);
  });

  it('should destroy modal instances if they exist', () => {
    self.controller.deletePaymentMethodModal = jasmine.createSpyObj('deletePaymentMethodModal', ['dismiss']);
    self.controller.editPaymentMethodModal = jasmine.createSpyObj('editPaymentMethodModal', ['dismiss']);
    self.controller.$onDestroy();
    expect(self.controller.deletePaymentMethodModal.dismiss).toHaveBeenCalled();
    expect(self.controller.editPaymentMethodModal.dismiss).toHaveBeenCalled();

  });

});
