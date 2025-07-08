import angular from 'angular';
import 'angular-mocks';
import module from './payment-method.component.js';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe('PaymentMethodComponent', function () {
  beforeEach(angular.mock.module(module.name));
  var self = {};
  var envService = {
    read: angular.noop,
  };
  var fakeModal = function () {
    return {
      // eslint-disable-next-line jasmine/no-unsafe-spy
      close: jest.fn(),
      result: {
        then: function (confirmCallback) {
          confirmCallback();
        },
      },
    };
  };
  var modelCC = {
    'expiry-month': '05',
    'expiry-year': '2019',
    'card-type': 'American Express',
    'card-number': '767676767654',
    address: {
      'country-name': 'US',
      'street-address': '123',
      'extended-address': '',
      locality: 'SLC',
      region: 'UT',
      'postal-code': '44444',
    },
    recurringgifts: {
      donations: [],
    },
    self: {
      type: 'paymentinstruments.payment-instrument',
      uri: '',
    },
  };
  var modelEFT = {
    'account-type': 'Checking',
    'bank-name': 'Moral Bank',
    'display-account-number': '1234',
    'routing-number': '021000021',
    recurringgifts: {
      donations: [],
    },
    self: {
      type: 'paymentinstruments.payment-instrument',
    },
  };
  var uibModal = { open: jest.fn(fakeModal), close: jest.fn() };

  beforeEach(inject(function ($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(
      module.name,
      {
        $scope: $scope,
        envService: envService,
        $uibModal: uibModal,
        profileService: {
          getDonorDetails: angular.noop,
          updatePaymentMethod: angular.noop,
          getPaymentMethod: angular.noop,
        },
      },
      {
        paymentMethodsList: [{}],
        model: {},
        onDelete: () => {
          return 'delete';
        },
      },
    );
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

      const callback = () => {
        self.controller.editPaymentMethodModal.close();
      };

      self.controller.editPaymentMethod();
      self.controller.editPaymentMethodModal.result.then(callback);

      expect(self.controller.$uibModal.open).toHaveBeenCalled();
      expect(self.controller.editPaymentMethodModal.close).toHaveBeenCalled();

      self.controller.model = modelEFT;
      self.controller.editPaymentMethod();

      expect(self.controller.$uibModal.open).toHaveBeenCalled();

      jest
        .spyOn(self.controller, 'onPaymentFormStateChange')
        .mockImplementation(() => {});
      self.controller.$uibModal.open.mock.calls[0][0].resolve.onPaymentFormStateChange()(
        { $event: {} },
      );

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
      expect(
        self.controller.$uibModal.open.mock.calls[
          self.controller.$uibModal.open.mock.calls.length - 1
        ][0].resolve.paymentMethod(),
      ).toEqual(modelEFT);
      expect(
        self.controller.$uibModal.open.mock.calls[
          self.controller.$uibModal.open.mock.calls.length - 1
        ][0].resolve.mailingAddress(),
      ).toEqual('address');
      expect(
        self.controller.$uibModal.open.mock.calls[
          self.controller.$uibModal.open.mock.calls.length - 1
        ][0].resolve.paymentMethodsList().length,
      ).toBe(1);
    });
  });

  describe('onPaymentFormStateChange()', () => {
    beforeEach(() => {
      self.controller.model = modelCC;
      self.controller.data = {
        creditCard: {
          'card-number': '0000',
          'last-four-digits': '0000',
          address: modelCC.address,
        },
      };
    });

    it('should update paymentFormState', () => {
      self.controller.paymentFormResolve.state = 'unsubmitted';
      self.controller.onPaymentFormStateChange({ state: 'submitted' });

      expect(self.controller.paymentFormResolve.state).toEqual('submitted');
    });

    it('should throw an error', () => {
      jest
        .spyOn(self.controller.profileService, 'updatePaymentMethod')
        .mockReturnValue(
          Observable.throw({
            data: 'some error',
          }),
        );
      self.controller.successMessage = {};
      self.controller.onPaymentFormStateChange({
        state: 'loading',
        payload: self.controller.data,
      });

      expect(self.controller.paymentFormResolve.state).toBe('error');
      expect(self.controller.paymentFormResolve.error).toBe('some error');
      expect(self.controller.$log.error.logs[0]).toEqual([
        'Error updating payment method',
        { data: 'some error' },
      ]);
    });

    it('should edit payment method', () => {
      self.controller.editPaymentMethodModal = {
        close: jest.fn(),
      };
      jest
        .spyOn(self.controller.profileService, 'updatePaymentMethod')
        .mockReturnValue(Observable.of('data'));
      self.controller.onPaymentFormStateChange({
        state: 'loading',
        payload: self.controller.data,
      });

      expect(self.controller.model['card-number']).toBe('0000');
      expect(self.controller.editPaymentMethodModal.close).toHaveBeenCalled();

      self.controller.data.creditCard = undefined;
      self.controller.data.bankAccount = {
        'display-account-number': '9879',
      };
      self.controller.onPaymentFormStateChange({
        state: 'loading',
        payload: self.controller.data,
      });

      expect(self.controller.model['display-account-number']).toBe('9879');
    });
  });

  describe('$onDestroy()', () => {
    it('should destroy modal instances if they exist', () => {
      self.controller.deletePaymentMethodModal = { dismiss: jest.fn() };
      self.controller.editPaymentMethodModal = { dismiss: jest.fn() };
      self.controller.$onDestroy();

      expect(
        self.controller.deletePaymentMethodModal.dismiss,
      ).toHaveBeenCalled();
      expect(self.controller.editPaymentMethodModal.dismiss).toHaveBeenCalled();
    });
  });
});
