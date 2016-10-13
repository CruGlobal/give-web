import angular from 'angular';
import 'angular-mocks';
import module from './payment-method.component.js';

describe('PaymentMethodComponent', function () {
  beforeEach(angular.mock.module(module.name));
  var self = {},
    envService = {
      read: angular.noop
    },
    fakeModal = function() {
      return {
        result: {
          then: function(confirmCallback) {
            confirmCallback();
          }
        }
      };
    },
    modelCC = {
      'expiry-month': '05',
      'expiry-year': '2019',
      'card-type': 'American Express',
      'card-number': '767676767654',
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

    },
    modelEFT = {
      'account-type': 'Checking',
      'bank-name': 'Moral Bank',
      'display-account-number': '1234',
      'routing-number': '021000021',
      'recurringgifts': {
        'donations': []
      }
    },
    uibModal = jasmine.createSpyObj('$uibModal', ['open','close']);

    uibModal.open.and.callFake(fakeModal);

  beforeEach(inject(function ($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope,
      envService: envService,
      $uibModal: uibModal
    },{
      'paymentMethodsList': [{}],
      'model': {},
      'onDelete': () => {
        return 'delete';
      }
    });

  }));


  it('should be defined', () => {
    expect(self.controller).toBeDefined();
  });


  it('should return expiration date', () => {
    self.controller.model = modelCC;
    expect(self.controller.getExpiration()).toBe('05/2019');
  });

  it('should return true if payment method is a card', () => {
    self.controller.model = modelCC;
    expect(self.controller.isCard()).toBe(true);
    self.controller.model = modelEFT;
    expect(self.controller.isCard()).toBe(false);
  });


  it('should call Edit Modal', () => {
    self.controller.model = modelCC;
    self.controller.editPaymentMethod();
    expect(self.controller.$uibModal.open).toHaveBeenCalled();
    expect(self.controller.$uibModal.open.calls.first().args[0].resolve.paymentMethod()).toEqual(modelCC);

    self.controller.model = modelEFT;
    self.controller.editPaymentMethod();
    expect(self.controller.$uibModal.open).toHaveBeenCalled();
    expect(self.controller.$uibModal.open.calls.first().args[0].resolve.paymentMethod()).toEqual(modelEFT);

    self.controller.onSubmit = () => 'hello';
    expect(self.controller.$uibModal.open.calls.first().args[0].resolve.onSubmit()()).toBe('hello');
    expect(self.controller.$uibModal.open.calls.first().args[0].resolve.submissionError()).toEqual({ error: '' });
  });

  it('should call Delete Modal', () => {
    self.controller.model = modelEFT;
    self.controller.deletePaymentMethod();
    expect(self.controller.$uibModal.open).toHaveBeenCalled();
    expect(self.controller.$uibModal.open.calls.mostRecent().args[0].resolve.paymentMethod()).toEqual(modelEFT);
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
