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
          document,
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

  describe('premium minimum', () => {
    beforeEach(() => {
      jest
        .spyOn($ctrl.checkoutService, 'initializeRecaptcha')
        .mockImplementation(() => {});
      $ctrl.premiumCode = 'BOOKS01';
    });

    it('should parse the configured minimum', () => {
      $ctrl.premiumMinimumAmount = '50';
      $ctrl.$onInit();

      expect($ctrl.premiumMinimum).toEqual(50);
    });

    it('should parse a minimum with cents', () => {
      $ctrl.premiumMinimumAmount = '49.99';
      $ctrl.$onInit();

      expect($ctrl.premiumMinimum).toEqual(49.99);
    });

    it('should be null when no minimum is configured', () => {
      $ctrl.$onInit();

      expect($ctrl.premiumMinimum).toBeNull();
    });

    it('should be null when the configured minimum is not a number', () => {
      $ctrl.premiumMinimumAmount = 'abc';
      $ctrl.$onInit();

      expect($ctrl.premiumMinimum).toBeNull();
    });

    it('should be null when the configured minimum is zero', () => {
      $ctrl.premiumMinimumAmount = '0';
      $ctrl.$onInit();

      expect($ctrl.premiumMinimum).toBeNull();
    });

    it('should be null when the configured minimum is negative', () => {
      $ctrl.premiumMinimumAmount = '-5';
      $ctrl.$onInit();

      expect($ctrl.premiumMinimum).toBeNull();
    });

    it('should be null without a premium code, since there is no premium to earn', () => {
      $ctrl.premiumCode = undefined;
      $ctrl.premiumMinimumAmount = '50';
      $ctrl.$onInit();

      expect($ctrl.premiumMinimum).toBeNull();
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

  describe('parseAmounts', () => {
    it('should return nothing when no amounts are given', () => {
      expect($ctrl.parseAmounts(undefined, 'single-amounts')).toBeUndefined();
      expect($ctrl.parseAmounts('', 'single-amounts')).toBeUndefined();
    });

    it('should read a comma separated list', () => {
      expect($ctrl.parseAmounts('25, 50,100', 'single-amounts')).toEqual([
        { amount: 25, order: 1 },
        { amount: 50, order: 2 },
        { amount: 100, order: 3 },
      ]);
    });

    it('should read a json array with descriptions', () => {
      const json =
        '[{"amount":50,"description":"Feeds a family"},{"amount":100}]';

      expect($ctrl.parseAmounts(json, 'single-amounts')).toEqual([
        { amount: 50, label: 'Feeds a family', order: 1 },
        { amount: 100, label: undefined, order: 2 },
      ]);
    });

    it('should drop entries that are not positive numbers', () => {
      expect($ctrl.parseAmounts('25,abc,0,-5,50', 'single-amounts')).toEqual([
        { amount: 25, order: 1 },
        { amount: 50, order: 2 },
      ]);
    });

    it('should report an error and ignore malformed json', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(
        $ctrl.parseAmounts('[{"amount":50,}]', 'single-amounts'),
      ).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('single-amounts'),
      );
    });

    it('should report an error when nothing usable is left', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      expect($ctrl.parseAmounts('abc,-5', 'monthly-amounts')).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('monthly-amounts'),
      );
    });
  });

  describe('resolveGivingAmounts', () => {
    it('should parse both attributes', () => {
      $ctrl.singleAmountsInput = '25,50';
      $ctrl.monthlyAmountsInput = '15,30';

      $ctrl.resolveGivingAmounts();

      expect($ctrl.singleAmounts).toEqual([
        { amount: 25, order: 1 },
        { amount: 50, order: 2 },
      ]);
      expect($ctrl.monthlyAmounts).toEqual([
        { amount: 15, order: 1 },
        { amount: 30, order: 2 },
      ]);
    });

    it('should leave amounts unset when no attributes are given', () => {
      $ctrl.resolveGivingAmounts();

      expect($ctrl.singleAmounts).toBeUndefined();
      expect($ctrl.monthlyAmounts).toBeUndefined();
    });
  });

  describe('resolveThankYouMessage', () => {
    const addTemplate = (id, html) => {
      const template = document.createElement('template');
      template.id = id;
      template.innerHTML = html;
      document.body.appendChild(template);
      return template;
    };

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should do nothing if no thank you message id is set', () => {
      $ctrl.resolveThankYouMessage();

      expect($ctrl.thankYouMessage).toBeUndefined();
    });

    it('should read the message html from the matching element', () => {
      addTemplate(
        'flThankYou',
        '<p>Thank you!</p><p><a href="guide.pdf" download>Download the guide</a></p>',
      );
      $ctrl.thankYouMessageId = 'flThankYou';

      $ctrl.resolveThankYouMessage();

      expect($ctrl.thankYouMessage).toEqual(
        '<p>Thank you!</p><p><a href="guide.pdf" download="">Download the guide</a></p>',
      );
    });

    it('should report an error if no element has that id', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      $ctrl.thankYouMessageId = 'elementThatWasNeverAdded';

      $ctrl.resolveThankYouMessage();

      expect($ctrl.thankYouMessage).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('elementThatWasNeverAdded'),
      );
    });

    it('should report an error if the element is empty', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      addTemplate('emptyThankYou', '   ');
      $ctrl.thankYouMessageId = 'emptyThankYou';

      $ctrl.resolveThankYouMessage();

      expect($ctrl.thankYouMessage).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('emptyThankYou'),
      );
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

    it('should not read the thank you message when moving to review', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      $ctrl.thankYouMessageId = 'missingThankYou';
      $ctrl.checkoutStep = 'giftContactPayment';

      $ctrl.next();

      expect($ctrl.checkoutStep).toEqual('review');
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should read the thank you message on transition', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      $ctrl.thankYouMessageId = 'lateThankYou';
      $ctrl.resolveThankYouMessage();

      const template = document.createElement('template');
      template.id = 'lateThankYou';
      template.innerHTML = '<p>Defined later</p>';
      document.body.appendChild(template);

      $ctrl.checkoutStep = 'review';
      $ctrl.next();

      expect($ctrl.thankYouMessage).toEqual('<p>Defined later</p>');
      document.body.innerHTML = '';
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

    it('should swallow errors thrown by onOrderCompleted', () => {
      $ctrl.onOrderCompleted = jest.fn(() => {
        throw new Error('Callback failed');
      });

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

    it('should swallow errors thrown by onOrderFailed', () => {
      $ctrl.onOrderFailed = jest.fn(() => {
        throw new Error('Callback failed');
      });

      expect(() =>
        $ctrl.onPaymentFailed({ 'donor-type': 'Household' }),
      ).not.toThrow();
    });
  });
});

describe('branded checkout thank you step', () => {
  let element;
  let scope;
  let compile;
  let httpBackend;

  beforeEach(
    angular.mock.module(module.name, ($provide) => {
      $provide.value('checkoutService', { initializeRecaptcha: jest.fn() });
    }),
  );

  beforeEach(inject((_$compile_, $rootScope, $httpBackend, sessionService) => {
    jest
      .spyOn(sessionService, 'signOutWithoutRedirectToOkta')
      .mockReturnValue(Observable.of(''));
    httpBackend = $httpBackend;
    httpBackend.whenGET(/.*/).respond(200, {});
    httpBackend.whenPOST(/.*/).respond(200, {});
    compile = _$compile_;
    scope = $rootScope.$new();
  }));

  const renderGiftForm = (attributes = '') => {
    element = compile(
      `<branded-checkout designation-number="1234567" use-v3="true" ${attributes}></branded-checkout>`,
    )(scope);
    element[0].scrollIntoView = jest.fn();
    scope.$digest();
    httpBackend.flush();

    return element[0];
  };

  const advanceToThankYou = () => {
    element.controller('brandedCheckout').next();
    scope.$digest();
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should render the custom message when the thank you step is reached', () => {
    const template = document.createElement('template');
    template.id = 'specThankYou';
    template.innerHTML =
      '<p>Thank you!</p><p><a href="guide.pdf" download>Download the guide</a></p>';
    document.body.appendChild(template);

    const dom = renderGiftForm('thank-you-message="specThankYou"');

    expect(dom.querySelector('branded-checkout-step-1')).not.toBeNull();
    expect(dom.querySelector('thank-you-summary')).toBeNull();

    advanceToThankYou();

    expect(dom.querySelector('branded-checkout-step-1')).toBeNull();
    const message = dom.querySelector('.custom-thank-you');
    expect(message.querySelector('a[download]').getAttribute('href')).toEqual(
      'guide.pdf',
    );
  });

  it('should render the default copy when no custom message is given', () => {
    const dom = renderGiftForm();

    advanceToThankYou();

    expect(dom.querySelector('.custom-thank-you')).toBeNull();
    expect(dom.querySelector('thank-you-summary')).not.toBeNull();
  });
});
