import angular from 'angular';
import 'angular-mocks';

import module from './branded-checkout.component';

describe('branded checkout', () => {
  beforeEach(angular.mock.module(module.name));
  let $ctrl;

  beforeEach(inject($componentController => {
    $ctrl = $componentController(module.name, {
      $window: { scrollTo: jasmine.createSpy('scrollTo') }
    }, {
      onOrderCompleted: jasmine.createSpy('onOrderCompleted')
    });
  }));

  describe('$onInit', () => {
    it('should set initial checkout step', () => {
      $ctrl.$onInit();
      expect($ctrl.checkoutStep).toEqual('giftContactPayment');
    });
  });

  describe('next', () => {
    afterEach(() => {
      expect($ctrl.$window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should transition from giftContactPayment to review', () => {
      $ctrl.checkoutStep = 'giftContactPayment';
      $ctrl.next();
      expect($ctrl.checkoutStep).toEqual('review');
    });
    it('should transition from review to thankYou ', () => {
      $ctrl.checkoutStep = 'review';
      $ctrl.next();
      expect($ctrl.checkoutStep).toEqual('thankYou');
    });
  });

  describe('previous', () => {
    afterEach(() => {
      expect($ctrl.$window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should transition from review to giftContactPayment', () => {
      $ctrl.checkoutStep = 'review';
      $ctrl.previous();
      expect($ctrl.checkoutStep).toEqual('giftContactPayment');
    });
  });

  describe('onThankYouPurchaseLoaded', () => {
    it('should pass the purchase info to the onOrderCompleted binding', () => {
      $ctrl.onThankYouPurchaseLoaded({
        donorDetails: {
          'donor-type': 'Household'
        },
        paymentMeans: {},
        lineItems: {},
        rawData: {}
      });
      expect($ctrl.onOrderCompleted).toHaveBeenCalledWith({$event: {$window: $ctrl.$window, purchase: {
        donorDetails: {
          donorType: 'Household'
        },
        lineItems: {}
      }}});
    });
  });
});
