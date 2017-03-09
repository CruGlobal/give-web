import angular from 'angular';
import 'angular-mocks';
import module from './payment-method.component.js';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe('PaymentMethodComponent', function () {
  beforeEach(angular.mock.module(module.name));
  var self = {},
    envService = {
      read: angular.noop
    },
    fakeModal = function() {
      return {
        // eslint-disable-next-line jasmine/no-unsafe-spy
        close: jasmine.createSpy('close'),
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
      },
      self: {
        type: 'cru.creditcards.named-credit-card',
        uri: ''
      }
    },
    modelEFT = {
      'account-type': 'Checking',
      'bank-name': 'Moral Bank',
      'display-account-number': '1234',
      'routing-number': '021000021',
      'recurringgifts': {
        'donations': []
      },
      self: {
        type: 'elasticpath.bankaccounts.bank-account'
      }
    },
    uibModal = jasmine.createSpyObj('$uibModal', ['open','close']);

    uibModal.open.and.callFake(fakeModal);

  beforeEach(inject(function ($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope,
      envService: envService,
      $uibModal: uibModal,
      profileService: {
        getDonorDetails: angular.noop,
        updatePaymentMethod: angular.noop,
        getPaymentMethod: angular.noop
      }
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

  describe('getExpiration()', () => {
    it('should return expiration date', () => {
      self.controller.model = modelCC;
      expect(self.controller.getExpiration()).toBe('05/2019');
    });
  });

  describe('isCard()', () => {
    it('should return true if payment method is a card', () => {
      self.controller.model = modelCC;
      expect(self.controller.isCard()).toBe(true);
      self.controller.model = modelEFT;
      expect(self.controller.isCard()).toBe(false);
    });
  });

  describe('editPaymentMethod()', () => {
    it('should call Edit Modal', () => {
      self.controller.model = modelCC;

      self.controller.successMessage = {};

      let callback = () => {
        self.controller.editPaymentMethodModal.close();
      };

      self.controller.editPaymentMethod();
      self.controller.editPaymentMethodModal.result.then(callback);

      expect(self.controller.$uibModal.open).toHaveBeenCalled();
      expect(self.controller.editPaymentMethodModal.close).toHaveBeenCalled();

      self.controller.model = modelEFT;
      self.controller.editPaymentMethod();
      expect(self.controller.$uibModal.open).toHaveBeenCalled();

      spyOn(self.controller, 'onPaymentFormStateChange');
      self.controller.$uibModal.open.calls.first().args[0].resolve.onPaymentFormStateChange()({ $event: {} });
      expect(self.controller.onPaymentFormStateChange).toHaveBeenCalled();
    });
  });

  describe('deletePaymentMethod()', () => {
    it('should call Delete Modal', () => {
      self.controller.model = modelEFT;
      self.controller.successMessage = {};
      self.controller.mailingAddress = 'address';
      self.controller.deletePaymentMethod();
      expect(self.controller.$uibModal.open).toHaveBeenCalled();
      expect(self.controller.$uibModal.open.calls.mostRecent().args[0].resolve.paymentMethod()).toEqual(modelEFT);
      expect(self.controller.$uibModal.open.calls.mostRecent().args[0].resolve.mailingAddress()).toEqual('address');
      expect(self.controller.$uibModal.open.calls.mostRecent().args[0].resolve.paymentMethodsList().length).toBe(1);
    });
  });

  describe('onPaymentFormStateChange()', () => {
    beforeEach(() => {
      self.controller.model = modelCC;
      self.controller.data = {
        creditCard:{
          'card-number': '0000',
          'last-four-digits': '0000',
          address: modelCC.address
        }
      };
    });

    it('should update paymentFormState', () => {
      self.controller.paymentFormResolve.state = 'unsubmitted';
      self.controller.onPaymentFormStateChange({ state: 'submitted' });
      expect(self.controller.paymentFormResolve.state).toEqual('submitted');
    });

    it('should throw an error', () => {
      spyOn(self.controller.profileService, 'updatePaymentMethod').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      self.controller.successMessage = {};
      self.controller.onPaymentFormStateChange({ state: 'loading', payload: self.controller.data });
      expect(self.controller.paymentFormResolve.state).toBe('error');
      expect(self.controller.paymentFormResolve.error).toBe('some error');
      expect(self.controller.$log.error.logs[0]).toEqual(['Error updating payment method', {data: 'some error'}]);
    });

    it('should edit payment method', () => {
      self.controller.editPaymentMethodModal = {
        close: jasmine.createSpy('close')
      };
      spyOn(self.controller.profileService, 'updatePaymentMethod').and.returnValue(Observable.of('data'));
      self.controller.onPaymentFormStateChange({ state: 'loading', payload: self.controller.data });
      expect(self.controller.model['card-number']).toBe('0000');
      expect(self.controller.editPaymentMethodModal.close).toHaveBeenCalled();

      self.controller.data.creditCard = undefined;
      self.controller.data.bankAccount = {
        'display-account-number': '9879'
      };
      self.controller.onPaymentFormStateChange({ state: 'loading', payload: self.controller.data });
      expect(self.controller.model['display-account-number']).toBe('9879');
    });
  });

  describe('$onDestroy()', () => {
    it('should destroy modal instances if they exist', () => {
      self.controller.deletePaymentMethodModal = jasmine.createSpyObj('deletePaymentMethodModal', ['dismiss']);
      self.controller.editPaymentMethodModal = jasmine.createSpyObj('editPaymentMethodModal', ['dismiss']);
      self.controller.$onDestroy();
      expect(self.controller.deletePaymentMethodModal.dismiss).toHaveBeenCalled();
      expect(self.controller.editPaymentMethodModal.dismiss).toHaveBeenCalled();
    });
  });

});
