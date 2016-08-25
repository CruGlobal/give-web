import angular from 'angular';
import 'angular-mocks';
import module from './step-3.component';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

describe('checkout', () => {
  describe('step 3', () => {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(function($rootScope, $componentController) {
      var $scope = $rootScope.$new();
      self.loadedPayment = {
        self: {
          type: null
        }
      };
      self.storedCcv = null;

      self.controller = $componentController(module.name, {
        $scope: $scope,
        // Mock services
        cartService: {
        },
        orderService: {
          getDonorDetails: () => Observable.of('donor details'),
          getCurrentPayment: () => Observable.of(self.loadedPayment),
          getBillingAddress: () => Observable.of({ address: 'billing address' }),
          checkErrors: () => Observable.of(['email-info']),
          submit: () => Observable.of('called submit'),
          submitWithCcv: (ccv) => Observable.of('called submit with a CCV of' + ccv),
          retrieveCardSecurityCode: () => self.storedCcv,
          clearCardSecurityCode: () => {}
        }
      });
    }));

    describe('$onInit', () => {
      it('should load needed info', () => {
        spyOn(self.controller, 'loadDonorDetails');
        spyOn(self.controller, 'loadCurrentPayment');
        spyOn(self.controller, 'loadBillingAddress');
        spyOn(self.controller, 'checkErrors');
        self.controller.$onInit();
        expect(self.controller.loadDonorDetails).toHaveBeenCalled();
        expect(self.controller.loadCurrentPayment).toHaveBeenCalled();
        expect(self.controller.loadBillingAddress).toHaveBeenCalled();
        expect(self.controller.checkErrors).toHaveBeenCalled();
      });
    });

    describe('loadDonorDetails', () => {
      it('should load donor details', () => {
        self.controller.loadDonorDetails();
        expect(self.controller.donorDetails).toEqual('donor details');
        self.controller.$log.assertEmpty();
      });
    });

    describe('loadCurrentPayment', () => {
      it('should load bank account payment details', () => {
        self.loadedPayment.self.type = 'elasticpath.bankaccounts.bank-account';
        self.controller.loadCurrentPayment();
        expect(self.controller.bankAccountPaymentDetails).toEqual(self.loadedPayment);
        expect(self.controller.creditCardPaymentDetails).toBeUndefined();
        self.controller.$log.assertEmpty();
      });
      it('should load credit card payment details', () => {
        self.loadedPayment.self.type = 'cru.creditcards.named-credit-card';
        self.controller.loadCurrentPayment();
        expect(self.controller.bankAccountPaymentDetails).toBeUndefined();
        expect(self.controller.creditCardPaymentDetails).toEqual(self.loadedPayment);
        self.controller.$log.assertEmpty();
      });
      it('should throw an error if the payments aren\'t loaded', () => {
        self.loadedPayment = undefined;
        self.controller.loadCurrentPayment();
        expect(self.controller.bankAccountPaymentDetails).toBeUndefined();
        expect(self.controller.creditCardPaymentDetails).toBeUndefined();
        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading current payment info: current payment doesn\'t seem to exist']);
      });
      it('should throw an error if the type is unknown', () => {
        self.loadedPayment.self.type = 'some other type';
        self.controller.loadCurrentPayment();
        expect(self.controller.bankAccountPaymentDetails).toBeUndefined();
        expect(self.controller.creditCardPaymentDetails).toBeUndefined();
        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading current payment info: current payment type is unknown']);
      });
    });

    describe('loadBillingAddress', () => {
      it('should load donor details', () => {
        self.controller.loadBillingAddress();
        expect(self.controller.billingAddress).toEqual('billing address');
        self.controller.$log.assertEmpty();
      });
    });

    describe('checkErrors', () => {
      it('should load any needinfo errors', () => {
        self.controller.checkErrors();
        expect(self.controller.errors).toEqual(['email-info']);
        self.controller.$log.assertEmpty();
      });
    });

    describe('canSubmitOrder', () => {
      it('should let you submit the order with a bank account if everything is loaded and there are no errors', () => {
        self.controller.cartData = {};
        self.controller.donorDetails = {};
        self.controller.bankAccountPaymentDetails = {};
        self.controller.creditCardPaymentDetails = undefined;
        self.controller.errors = undefined;
        expect(self.controller.canSubmitOrder()).toEqual(true);
      });
      it('should let you submit the order with a credit card if everything is loaded and there are no errors', () => {
        self.controller.cartData = {};
        self.controller.donorDetails = {};
        self.controller.bankAccountPaymentDetails = undefined;
        self.controller.creditCardPaymentDetails = {};
        self.controller.errors = undefined;
        expect(self.controller.canSubmitOrder()).toEqual(true);
      });
      it('should not let you submit the order if there are errors', () => {
        self.controller.cartData = {};
        self.controller.donorDetails = {};
        self.controller.bankAccountPaymentDetails = {};
        self.controller.creditCardPaymentDetails = undefined;
        self.controller.errors = [];
        expect(self.controller.canSubmitOrder()).toEqual(false);
      });
      it('should not let you submit the order if both payment methods aren\'t loaded', () => {
        self.controller.cartData = {};
        self.controller.donorDetails = {};
        self.controller.bankAccountPaymentDetails = undefined;
        self.controller.creditCardPaymentDetails = undefined;
        self.controller.errors = undefined;
        expect(self.controller.canSubmitOrder()).toEqual(false);
      });
      it('should not let you submit the order if cart data isn\'t loaded', () => {
        self.controller.cartData = undefined;
        self.controller.donorDetails = {};
        self.controller.bankAccountPaymentDetails = {};
        self.controller.creditCardPaymentDetails = undefined;
        self.controller.errors = undefined;
        expect(self.controller.canSubmitOrder()).toEqual(false);
      });
      it('should not let you submit the order if donorDetails isn\'t loaded', () => {
        self.controller.cartData = {};
        self.controller.donorDetails = undefined;
        self.controller.bankAccountPaymentDetails = {};
        self.controller.creditCardPaymentDetails = undefined;
        self.controller.errors = undefined;
        expect(self.controller.canSubmitOrder()).toEqual(false);
      });
    });

    describe('submitOrder', () => {
      beforeEach(() => {
        spyOn(self.controller.orderService, 'submit').and.callThrough();
        spyOn(self.controller.orderService, 'submitWithCcv').and.callThrough();
        spyOn(self.controller.orderService, 'clearCardSecurityCode');
      });

      it('should submit the order normally if paying with a bank account', () => {
        self.controller.bankAccountPaymentDetails = {};
        self.controller.submitOrder();
        expect(self.controller.orderService.submit).toHaveBeenCalled();
        expect(self.controller.orderService.clearCardSecurityCode).toHaveBeenCalled();
      });
      it('should submit the order with a CCV if paying with a credit card', () => {
        self.controller.creditCardPaymentDetails = {};
        self.storedCcv = '1234';
        self.controller.submitOrder();
        expect(self.controller.orderService.submit).toHaveBeenCalledWith('1234');
        expect(self.controller.orderService.clearCardSecurityCode).toHaveBeenCalled();
      });
      it('should throw an error if paying with a credit card and the CCV is missing', () => {
        self.controller.creditCardPaymentDetails = {};
        self.controller.submitOrder();
        expect(self.controller.orderService.submit).not.toHaveBeenCalled();
        expect(self.controller.orderService.submitWithCcv).not.toHaveBeenCalled();
        expect(self.controller.orderService.clearCardSecurityCode).not.toHaveBeenCalled();
        expect(self.controller.$log.error.logs[0]).toEqual(['Error submitting purchase:', 'Submitting a credit card purchase requires a CCV and the CCV was not retrieved correctly']);
      });
      it('should throw an error if neither bank account or credit card details are loaded', () => {
        self.controller.submitOrder();
        expect(self.controller.orderService.submit).not.toHaveBeenCalled();
        expect(self.controller.orderService.submitWithCcv).not.toHaveBeenCalled();
        expect(self.controller.orderService.clearCardSecurityCode).not.toHaveBeenCalled();
        expect(self.controller.$log.error.logs[0]).toEqual(['Error submitting purchase:', 'Current payment type is unknown']);
      });
    });
  });
});
