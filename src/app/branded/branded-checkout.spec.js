import angular from 'angular';
import 'angular-mocks';

import module from './branded-checkout.component';
import { Observable } from 'rxjs/Observable';

const scrollIntoViewMock = jest.fn();

describe('branded checkout', () => {
  beforeEach(angular.mock.module(module.name));
  let $ctrl;

  const querySelectorMock = jest.fn((selector) =>
    selector === 'loading' ? null : element,
  );
  const element = {
    getBoundingClientRect: jest.fn(() => ({ top: 300 })),
    querySelector: querySelectorMock,
    scrollIntoView: scrollIntoViewMock,
  };
  element.parentElement = element;

  beforeEach(inject(($componentController) => {
    $ctrl = $componentController(
      module.name,
      {
        $element: [element],
        $window: {
          MutationObserver: jest.fn((callback) => ({
            observe: jest.fn(() => {
              callback();
            }),
            disconnect: jest.fn(),
          })),
          scrollY: 100,
          scrollTo: jest.fn(),
          sessionStorage: {
            removeItem: jest.fn(),
          },
        },
        brandedAnalyticsFactory: {
          savePurchase: jest.fn(),
          purchase: jest.fn(),
        },
        tsysService: {
          setDevice: jest.fn(),
        },
      },
      {
        designationNumber: '1234567',
        tsysDevice: 'test-env',
        onOrderCompleted: jest.fn(),
        onOrderFailed: jest.fn(),
      },
    );
  }));

  describe('$onInit', () => {
    beforeEach(() => {
      jest
        .spyOn($ctrl.checkoutService, 'initializeRecaptcha')
        .mockImplementation(() => {});
    });

    it('should set API Url if custom one is set', () => {
      $ctrl.apiUrl = 'https://custom-api.cru.org';
      $ctrl.$onInit();

      expect($ctrl.envService.read('apiUrl')).toEqual('//custom-api.cru.org');
      expect($ctrl.envService.read('isBrandedCheckout')).toEqual(true);
    });

    it('should set initial checkout step and call formatDonorDetails', () => {
      jest
        .spyOn($ctrl.sessionService, 'signOutWithoutRedirectToOkta')
        .mockReturnValue(Observable.of(''));
      jest.spyOn($ctrl, 'formatDonorDetails').mockImplementation(() => {});
      $ctrl.$onInit();

      expect(
        $ctrl.sessionService.signOutWithoutRedirectToOkta,
      ).toHaveBeenCalled();
      expect($ctrl.code).toEqual('1234567');
      expect($ctrl.tsysService.setDevice).toHaveBeenCalledWith('test-env');
      expect($ctrl.checkoutStep).toEqual('giftContactPayment');
      expect($ctrl.formatDonorDetails).toHaveBeenCalled();
      expect($ctrl.$window.sessionStorage.removeItem).toHaveBeenCalledWith(
        'initialLoadComplete',
      );
    });

    it('should initialize recaptcha', () => {
      $ctrl.$onInit();
      expect($ctrl.checkoutService.initializeRecaptcha).toHaveBeenCalled();
    });
  });

  describe('normalizeApiUrl', () => {
    it('should handle URLs with https:// protocol', () => {
      const result = $ctrl.normalizeApiUrl('https://give.domain.com');
      expect(result).toEqual('//give.domain.com');
    });

    it('should handle URLs with http:// protocol', () => {
      const result = $ctrl.normalizeApiUrl('http://give.domain.com');
      expect(result).toEqual('//give.domain.com');
    });

    it('should handle URLs without protocol', () => {
      const result = $ctrl.normalizeApiUrl('give.domain.com');
      expect(result).toEqual('//give.domain.com');
    });

    it('should handle URLs already in protocol-relative format', () => {
      const result = $ctrl.normalizeApiUrl('//give.domain.com');
      expect(result).toEqual('//give.domain.com');
    });

    it('should remove trailing slashes', () => {
      const result = $ctrl.normalizeApiUrl('https://give.domain.com/');
      expect(result).toEqual('//give.domain.com');
    });

    it('should remove multiple trailing slashes', () => {
      const result = $ctrl.normalizeApiUrl('https://give.domain.com///');
      expect(result).toEqual('//give.domain.com');
    });

    it('should preserve port in URL', () => {
      const result = $ctrl.normalizeApiUrl('http://give.domain.com:3000/');
      expect(result).toEqual('//give.domain.com:3000');
    });

    it('should preserve query parameters', () => {
      const result = $ctrl.normalizeApiUrl('https://give.domain.com/?ref=abc');
      expect(result).toEqual('//give.domain.com?ref=abc');
    });
  });

  describe('formatDonorDetails', () => {
    it('should do nothing if donorDetails is undefined', () => {
      $ctrl.formatDonorDetails();

      expect($ctrl.donorDetails).toBeUndefined();
    });

    it('should convert donorDetails to param case except for mailingAddress', () => {
      $ctrl.$window.donorDetails = {
        donorType: 'Household',
        name: {
          title: '',
          givenName: 'First Name',
          middleInitial: '',
          familyName: 'Last Name',
          suffix: '',
        },
        organizationName: '',
        phoneNumber: '',
        spouseName: {
          title: '',
          givenName: 'First Name',
          middleInitial: '',
          familyName: 'Last Name',
          suffix: '',
        },
        mailingAddress: {
          country: 'US',
          streetAddress: '123 Some Street',
          extendedAddress: 'Address Line 2',
          locality: 'City',
          region: 'CA',
          postalCode: '12345',
        },
        email: 'email@example.com',
      };
      $ctrl.donorDetailsVariable = 'donorDetails';

      $ctrl.formatDonorDetails();

      expect($ctrl.donorDetails).toEqual({
        'donor-type': 'Household',
        name: {
          title: '',
          'given-name': 'First Name',
          'middle-initial': '',
          'family-name': 'Last Name',
          suffix: '',
        },
        'organization-name': '',
        'phone-number': '',
        'spouse-name': {
          title: '',
          'given-name': 'First Name',
          'middle-initial': '',
          'family-name': 'Last Name',
          suffix: '',
        },
        mailingAddress: {
          country: 'US',
          streetAddress: '123 Some Street',
          extendedAddress: 'Address Line 2',
          locality: 'City',
          region: 'CA',
          postalCode: '12345',
        },
        email: 'email@example.com',
      });
    });
  });

  describe('next', () => {
    afterEach(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
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
    beforeEach(() => {
      $ctrl.checkoutStep = 'review';
    });

    it('should transition from review to giftContactPayment', () => {
      $ctrl.previous('contact');
      expect($ctrl.checkoutStep).toEqual('giftContactPayment');
      expect($ctrl.$window.scrollTo).toHaveBeenCalledWith({
        top: 300,
        behavior: 'smooth',
      });
    });

    it('should scroll to the contact form when change contact info was clicked', () => {
      $ctrl.previous('contact');
      expect(querySelectorMock).toHaveBeenCalledWith('contact-info');
      expect($ctrl.$window.scrollTo).toHaveBeenCalledWith({
        top: 300,
        behavior: 'smooth',
      });
    });

    it('should scroll to the contact form when change cart was clicked', () => {
      $ctrl.previous('cart');
      expect(querySelectorMock).toHaveBeenCalledWith('product-config-form');
      expect($ctrl.$window.scrollTo).toHaveBeenCalledWith({
        top: 300,
        behavior: 'smooth',
      });
    });

    it('should scroll to the contact form when change payment was clicked', () => {
      $ctrl.previous('payment');
      expect(querySelectorMock).toHaveBeenCalledWith('checkout-step-2');
      expect($ctrl.$window.scrollTo).toHaveBeenCalledWith({
        top: 300,
        behavior: 'smooth',
      });
    });

    it('should scroll even when MutationObserver is unavailable', () => {
      $ctrl.$window.MutationObserver = undefined;
      $ctrl.previous('contact');
      expect($ctrl.checkoutStep).toEqual('giftContactPayment');
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('onThankYouPurchaseLoaded', () => {
    const purchaseData = {
      donorDetails: {
        'donor-type': 'Household',
      },
      paymentInstruments: {},
      lineItems: {},
      rawData: {},
    };

    beforeEach(() => {
      $ctrl.onThankYouPurchaseLoaded();
    });

    it('should pass the purchase info to the onOrderCompleted binding', () => {
      $ctrl.onThankYouPurchaseLoaded(purchaseData);

      expect($ctrl.onOrderCompleted).toHaveBeenCalledWith({
        $event: {
          $window: $ctrl.$window,
          purchase: {
            donorDetails: {
              donorType: 'Household',
            },
            lineItems: {},
          },
        },
      });
    });

    it('should call purchase', () => {
      $ctrl.onThankYouPurchaseLoaded(purchaseData);

      expect($ctrl.brandedAnalyticsFactory.savePurchase).toHaveBeenCalledWith(
        purchaseData,
      );
      expect($ctrl.brandedAnalyticsFactory.purchase).toHaveBeenCalled();
    });
  });

  describe('onPaymentFailed', () => {
    it('should pass donorDetails info to the onPaymentFailed binding', () => {
      $ctrl.onPaymentFailed({
        'donor-type': 'Household',
      });

      expect($ctrl.onOrderFailed).toHaveBeenCalledWith({
        $event: {
          $window: $ctrl.$window,
          donorDetails: {
            donorType: 'Household',
          },
        },
      });
    });
  });
});
