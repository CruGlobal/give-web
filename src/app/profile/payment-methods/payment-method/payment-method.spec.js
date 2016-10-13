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
      $uibModal: uibModal,
      profileService: {
        getDonorDetails: angular.noop,
        updatePaymentMethod: angular.noop
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

  describe('$onInit()', () => {
    it('should call loadDonorDetails', () => {
      spyOn(self.controller, 'loadDonorDetails');
      self.controller.$onInit();
      expect(self.controller.loadDonorDetails).toHaveBeenCalled();
    });
  });

  describe('loadDonorDetails()', () => {
    it('should get donor details', () => {
      spyOn(self.controller.profileService, 'getDonorDetails').and.returnValue(Observable.of({mailingAddress: 'address'}));
      self.controller.loadDonorDetails();
      expect(self.controller.mailingAddress).toBe('address');
    });
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

      let callback = () => {
        self.controller.editPaymentMethodModal.close();
      };

      self.controller.editPaymentMethod();
      self.controller.editPaymentMethodModal.result.then(callback);

      expect(self.controller.$uibModal.open).toHaveBeenCalled();
      expect(self.controller.editPaymentMethodModal.close).toHaveBeenCalled();
      expect(self.controller.$uibModal.open.calls.first().args[0].resolve.paymentMethod()).toEqual(modelCC);

      self.controller.model = modelEFT;
      self.controller.editPaymentMethod();
      expect(self.controller.$uibModal.open).toHaveBeenCalled();
      expect(self.controller.$uibModal.open.calls.first().args[0].resolve.paymentMethod()).toEqual(modelEFT);

      self.controller.onSubmit = () => 'hello';
      spyOn(self.controller.profileService, 'getDonorDetails').and.returnValue(Observable.of({mailingAddress: 'address'}));
      self.controller.$onInit();
      expect(self.controller.$uibModal.open.calls.first().args[0].resolve.onSubmit()()).toBe('hello');
      expect(self.controller.$uibModal.open.calls.first().args[0].resolve.submissionError()).toEqual({ error: '' });
      expect(self.controller.$uibModal.open.calls.first().args[0].resolve.mailingAddress()).toBe('address');
      expect(self.controller.$uibModal.open.calls.first().args[0].resolve.submitted()).toBe(false);
      expect(self.controller.$uibModal.open.calls.first().args[0].resolve.profileService()).toBeTruthy();
    });
  });

  describe('deletePaymentMethod()', () => {
    it('should call Delete Modal', () => {
      self.controller.model = modelEFT;
      self.controller.deletePaymentMethod();
      expect(self.controller.$uibModal.open).toHaveBeenCalled();
      expect(self.controller.$uibModal.open.calls.mostRecent().args[0].resolve.paymentMethod()).toEqual(modelEFT);
      expect(self.controller.$uibModal.open.calls.mostRecent().args[0].resolve.paymentMethodsList().length).toBe(1);
    });
  });

  describe('onSubmit()', () => {
    it('should throw an error', () => {
      spyOn(self.controller.profileService, 'updatePaymentMethod').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      self.controller.onSubmit({success:true, data: {}});
      expect(self.controller.submissionError.error).toBe('some error');
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
