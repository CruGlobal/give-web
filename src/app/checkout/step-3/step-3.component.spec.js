import angular from 'angular';
import 'angular-mocks';
import module from './step-3.component';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

describe('checkout', function() {
  describe('step 3', function() {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(function($rootScope, $componentController) {
      var $scope = $rootScope.$new();
      self.loadedPayment = {
        self: {
          type: null
        }
      };

      self.controller = $componentController(module.name, {
        $scope: $scope,
        // Mock services
        cartService: {
          getDonorDetails: () => Observable.of('donor details')
        },
        orderService: {
          getCurrentPayment: () => Observable.of(self.loadedPayment)
        }
      });
    }));

    describe('$onInit', () => {
      it('should load donor details', function() {
        self.loadedPayment.self.type = 'elasticpath.bankaccounts.bank-account';
        self.controller.$onInit();
        expect(self.controller.donorDetails).toEqual('donor details');
        self.controller.$log.assertEmpty();
      });
      it('should load bank account payment details', function() {
        self.loadedPayment.self.type = 'elasticpath.bankaccounts.bank-account';
        self.controller.$onInit();
        expect(self.controller.bankAccountPaymentDetails).toEqual(self.loadedPayment);
        expect(self.controller.creditCardPaymentDetails).toBeUndefined();
        self.controller.$log.assertEmpty();
      });
      it('should load credit card payment details', function() {
        self.loadedPayment.self.type = 'cru.creditcards.named-credit-card';
        self.controller.$onInit();
        expect(self.controller.bankAccountPaymentDetails).toBeUndefined();
        expect(self.controller.creditCardPaymentDetails).toEqual(self.loadedPayment);
        self.controller.$log.assertEmpty();
      });
      it('should throw an error if the type is unknown', function() {
        self.loadedPayment.self.type = 'some other type';
        self.controller.$onInit();
        expect(self.controller.bankAccountPaymentDetails).toBeUndefined();
        expect(self.controller.creditCardPaymentDetails).toBeUndefined();
        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading current payment info: current payment type is unknown']);
      });
    });
  });
});
