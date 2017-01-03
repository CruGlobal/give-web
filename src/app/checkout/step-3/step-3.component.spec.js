import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import {existingPaymentMethodFlag} from 'common/services/api/order.service';
import {cartUpdatedEvent} from 'common/components/nav/navCart/navCart.component';

import module from './step-3.component';

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
          cartService: {},
          orderService: {
            getDonorDetails: () => Observable.of('donor details'),
            getCurrentPayment: () => Observable.of(self.loadedPayment),
            checkErrors: () => Observable.of(['email-info']),
            submit: () => Observable.of('called submit'),
            retrieveCardSecurityCode: () => self.storedCcv,
            clearCardSecurityCode: () => {}
          },
          $window: {
            location: '/checkout.html'
          }
        },
        {
          onSubmitBtnChangeState: jasmine.createSpy('onSubmitBtnChangeState'),
          onSubmitted: jasmine.createSpy('onSubmitted'),
          onSubmittingOrder: jasmine.createSpy('onSubmittingOrder'),
          submittingOrder: false
        });
    }));

    describe('$onInit', () => {
      it('should load needed info', () => {
        spyOn(self.controller, 'loadDonorDetails');
        spyOn(self.controller, 'loadCurrentPayment');
        spyOn(self.controller, 'checkErrors');
        self.controller.$onInit();
        expect(self.controller.loadDonorDetails).toHaveBeenCalled();
        expect(self.controller.loadCurrentPayment).toHaveBeenCalled();
        expect(self.controller.checkErrors).toHaveBeenCalled();
      });
    });

    describe('$onChanges', () => {
      beforeEach(() => {
        spyOn(self.controller, 'submitOrder');
      });

      it('should submit order if the submit binding is true', () => {
        self.controller.$onChanges({ submit: {
          currentValue: true
        }});
        expect(self.controller.submitOrder).toHaveBeenCalled();
      });
      it('should not submit order if the submit binding is false', () => {
        self.controller.$onChanges({ submit: {
          currentValue: false
        }});
        expect(self.controller.submitOrder).not.toHaveBeenCalled();
      });
      it('should not submit order if the submit binding was not changed', () => {
        self.controller.$onChanges({});
        expect(self.controller.submitOrder).not.toHaveBeenCalled();
      });
    });

    describe('loadDonorDetails', () => {
      it('should load donor details', () => {
        self.controller.loadDonorDetails();
        expect(self.controller.donorDetails).toEqual('donor details');
        self.controller.$log.assertEmpty();
      });
      it('should log error on failure', () => {
        spyOn(self.controller.orderService, 'getDonorDetails').and.returnValue(Observable.throw('some error'));
        self.controller.loadDonorDetails();
        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading donorDetails', 'some error']);
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
      it('should log an error on failure', () => {
        spyOn(self.controller.orderService, 'getCurrentPayment').and.returnValue(Observable.throw('some error'));
        self.controller.loadCurrentPayment();
        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading current payment info', 'some error']);
      });
    });

    describe('checkErrors', () => {
      it('should load any needinfo errors', () => {
        self.controller.checkErrors();
        expect(self.controller.needinfoErrors).toEqual(['email-info']);
        self.controller.$log.assertEmpty();
      });
      it('should log and error on failure', () => {
        spyOn(self.controller.orderService, 'checkErrors').and.returnValue(Observable.throw('some error'));
        self.controller.checkErrors();
        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading checkErrors', 'some error']);
      });
    });

    describe('canSubmitOrder', () => {
      function runCanSubmitOrder(config){
        self.controller.cartData = config.cartData;
        self.controller.donorDetails = config.donorDetails;
        self.controller.bankAccountPaymentDetails = config.bankAccountPaymentDetails;
        self.controller.creditCardPaymentDetails = config.creditCardPaymentDetails;
        self.controller.needinfoErrors = config.needinfoErrors;
        self.controller.submittingOrder = config.submittingOrder;
        expect(self.controller.canSubmitOrder()).toEqual(config.outcome);
        expect(self.controller.onSubmitBtnChangeState).toHaveBeenCalledWith({
          $event: {
            enabled: config.outcome
          }
        });
      }

      it('should let you submit the order with a bank account if everything is loaded and there are no errors', () => {
        runCanSubmitOrder({
          cartData: {},
          donorDetails: {},
          bankAccountPaymentDetails: {},
          creditCardPaymentDetails: undefined,
          needinfoErrors: undefined,
          outcome: true,
          submittingOrder: false
        });
      });
      it('should let you submit the order with a credit card if everything is loaded and there are no errors', () => {
        runCanSubmitOrder({
          cartData: {},
          donorDetails: {},
          bankAccountPaymentDetails: undefined,
          creditCardPaymentDetails: {},
          needinfoErrors: undefined,
          outcome: true,
          submittingOrder: false
        });
      });
      it('should not let you submit the order if there are errors', () => {
        runCanSubmitOrder({
          cartData: {},
          donorDetails: {},
          bankAccountPaymentDetails: {},
          creditCardPaymentDetails: undefined,
          needinfoErrors: [],
          outcome: false,
          submittingOrder: false
        });
      });
      it('should not let you submit the order if both payment methods aren\'t loaded', () => {
        runCanSubmitOrder({
          cartData: {},
          donorDetails: {},
          bankAccountPaymentDetails: undefined,
          creditCardPaymentDetails: undefined,
          needinfoErrors: undefined,
          outcome: false,
          submittingOrder: false
        });
      });
      it('should not let you submit the order if cart data isn\'t loaded', () => {
        runCanSubmitOrder({
          cartData: undefined,
          donorDetails: {},
          bankAccountPaymentDetails: {},
          creditCardPaymentDetails: undefined,
          needinfoErrors: undefined,
          outcome: false,
          submittingOrder: false
        });
      });
      it('should not let you submit the order if donorDetails isn\'t loaded', () => {
        runCanSubmitOrder({
          cartData: {},
          donorDetails: undefined,
          bankAccountPaymentDetails: {},
          creditCardPaymentDetails: undefined,
          needinfoErrors: undefined,
          outcome: false,
          submittingOrder: false
        });
      });
      it('should not let you submit the order if the order is currently submitting', () => {
        runCanSubmitOrder({
          cartData: {},
          donorDetails: {},
          bankAccountPaymentDetails: {},
          creditCardPaymentDetails: undefined,
          needinfoErrors: undefined,
          outcome: false,
          submittingOrder: true
        });
      });
    });

    describe('submitOrder', () => {
      beforeEach(() => {
        spyOn(self.controller.orderService, 'submit').and.callThrough();
        spyOn(self.controller.orderService, 'clearCardSecurityCode');
      });

      describe('another order submission in progress', () => {
        it('should not submit the order twice', () => {
          self.controller.submittingOrder = true;
          self.controller.submitOrder();
          expect(self.controller.onSubmittingOrder).not.toHaveBeenCalled();
          expect(self.controller.onSubmitted).not.toHaveBeenCalled();
        });
      });

      describe('submit single order', () => {
        beforeEach(() => {
          spyOn(self.controller.$scope, '$emit');
        });

        afterEach(() => {
          expect(self.controller.onSubmittingOrder).toHaveBeenCalledWith({value: true});
          expect(self.controller.onSubmittingOrder).toHaveBeenCalledWith({value: false});
          expect(self.controller.onSubmitted).toHaveBeenCalled();
        });

        it('should submit the order normally if paying with a bank account', () => {
          self.controller.bankAccountPaymentDetails = {};
          self.controller.submitOrder();
          expect(self.controller.orderService.submit).toHaveBeenCalled();
          expect(self.controller.orderService.clearCardSecurityCode).toHaveBeenCalled();
          expect(self.controller.$window.location).toEqual('/thank-you.html');
          expect(self.controller.$scope.$emit).toHaveBeenCalledWith(cartUpdatedEvent);
        });
        it('should handle an error submitting an order with a bank account', () => {
          self.controller.orderService.submit.and.callFake(() => Observable.throw('error saving bank account'));
          self.controller.bankAccountPaymentDetails = {};
          self.controller.submitOrder();
          expect(self.controller.orderService.submit).toHaveBeenCalled();
          expect(self.controller.orderService.clearCardSecurityCode).not.toHaveBeenCalled();
          expect(self.controller.$log.error.logs[0]).toEqual(['Error submitting purchase:', 'error saving bank account']);
          expect(self.controller.$window.location).toEqual('/checkout.html');
          expect(self.controller.submissionError).toEqual('error saving bank account');
        });
        it('should submit the order with a CCV if paying with a credit card', () => {
          self.controller.creditCardPaymentDetails = {};
          self.storedCcv = '1234';
          self.controller.submitOrder();
          expect(self.controller.orderService.submit).toHaveBeenCalledWith('1234');
          expect(self.controller.orderService.clearCardSecurityCode).toHaveBeenCalled();
          expect(self.controller.$window.location).toEqual('/thank-you.html');
          expect(self.controller.$scope.$emit).toHaveBeenCalledWith(cartUpdatedEvent);
        });
        it('should submit the order without a CCV if paying with an existing credit card', () => {
          self.controller.creditCardPaymentDetails = {};
          self.storedCcv = existingPaymentMethodFlag;
          self.controller.submitOrder();
          expect(self.controller.orderService.submit).toHaveBeenCalledWith();
          expect(self.controller.orderService.clearCardSecurityCode).toHaveBeenCalled();
          expect(self.controller.$window.location).toEqual('/thank-you.html');
          expect(self.controller.$scope.$emit).toHaveBeenCalledWith(cartUpdatedEvent);
        });
        it('should handle an error submitting an order with a credit card', () => {
          self.controller.orderService.submit.and.callFake(() => Observable.throw('error saving credit card'));
          self.controller.creditCardPaymentDetails = {};
          self.storedCcv = '1234';
          self.controller.submitOrder();
          expect(self.controller.orderService.submit).toHaveBeenCalledWith('1234');
          expect(self.controller.orderService.clearCardSecurityCode).not.toHaveBeenCalled();
          expect(self.controller.$log.error.logs[0]).toEqual(['Error submitting purchase:', 'error saving credit card']);
          expect(self.controller.$window.location).toEqual('/checkout.html');
          expect(self.controller.submissionError).toEqual('error saving credit card');
        });
        it('should throw an error if paying with a credit card and the CCV is missing', () => {
          self.controller.creditCardPaymentDetails = {};
          self.controller.submitOrder();
          expect(self.controller.orderService.submit).not.toHaveBeenCalled();
          expect(self.controller.orderService.clearCardSecurityCode).not.toHaveBeenCalled();
          expect(self.controller.$log.error.logs[0]).toEqual(['Error submitting purchase:', 'Submitting a credit card purchase requires a CCV and the CCV was not retrieved correctly']);
          expect(self.controller.$window.location).toEqual('/checkout.html');
          expect(self.controller.submissionError).toEqual('Submitting a credit card purchase requires a CCV and the CCV was not retrieved correctly');
        });
        it('should throw an error if neither bank account or credit card details are loaded', () => {
          self.controller.submitOrder();
          expect(self.controller.orderService.submit).not.toHaveBeenCalled();
          expect(self.controller.orderService.clearCardSecurityCode).not.toHaveBeenCalled();
          expect(self.controller.$log.error.logs[0]).toEqual(['Error submitting purchase:', 'Current payment type is unknown']);
          expect(self.controller.$window.location).toEqual('/checkout.html');
          expect(self.controller.submissionError).toEqual('Current payment type is unknown');
        });
      });
    });
  });
});
