import angular from 'angular';
import 'angular-mocks';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './thankYouSummary.component.js';

import { SignOutEvent } from 'common/services/session/session.service';

describe('thank you summary', () => {
  beforeEach(angular.mock.module(module.name));
  const self = {};

  beforeEach(inject(($componentController) => {
    self.mockPurchase = {
      donorDetails: {
        mailingAddress: {
          'street-address': '123 Mailing St',
        },
        'registration-state': 'MATCHED',
      },
      paymentInstruments: {
        self: {
          type: 'paymentinstruments.purchase-payment-instrument',
        },
        address: {
          'street-address': '123 Billing St',
        },
      },
      rateTotals: [
        {
          cost: {
            display: '$50.00',
            amount: 50,
          },
          recurrence: {
            display: 'Single',
          },
        },
        {
          cost: {
            display: '$20.00',
            amount: 20,
          },
          recurrence: {
            display: 'Monthly',
          },
        },
      ],
      lineItems: [
        {
          code: {
            code: '0123456',
          },
        },
        {
          code: {
            code: '1234567',
          },
        },
      ],
      rawData: {
        'monetary-total': [
          {
            display: '$50.00',
            amount: 50,
          },
        ],
      },
    };

    self.controller = $componentController(
      module.name,
      {
        orderService: {
          retrieveLastPurchaseLink: () => '/purchases/crugive/iiydanbt=',
        },
        profileService: {
          getPurchase: () => Observable.of(self.mockPurchase),
          getEmails: () =>
            Observable.of([{ email: 'someperson@someaddress.com' }]),
        },
        $window: { location: '/thank-you.html' },
      },
      {
        onPurchaseLoaded: jest.fn(),
      },
    );
  }));

  describe('$onInit', () => {
    beforeEach(() => {
      jest
        .spyOn(self.controller.$rootScope, '$on')
        .mockImplementation(() => {});
      jest.spyOn(self.controller, 'signedOut').mockImplementation(() => {});
      jest
        .spyOn(self.controller, 'loadLastPurchase')
        .mockImplementation(() => {});
      jest.spyOn(self.controller, 'loadEmail').mockImplementation(() => {});
    });

    it('should call all methods needed to load data for the component', () => {
      self.controller.$onInit();

      expect(self.controller.$rootScope.$on).toHaveBeenCalledWith(
        SignOutEvent,
        expect.any(Function),
      );
      self.controller.$rootScope.$on.mock.calls[0][1]();

      expect(self.controller.signedOut).toHaveBeenCalled();
      expect(self.controller.loadLastPurchase).toHaveBeenCalled();
      expect(self.controller.loadEmail).toHaveBeenCalled();
    });
  });

  describe('signedOut( event )', () => {
    describe('default prevented', () => {
      it('does nothing', () => {
        self.controller.signedOut({ defaultPrevented: true });

        expect(self.controller.$window.location).toEqual('/thank-you.html');
      });
    });

    describe('default not prevented', () => {
      it("navigates to '\/'", () => {
        const spy = jest.fn();
        self.controller.signedOut({
          defaultPrevented: false,
          preventDefault: spy,
        });

        expect(spy).toHaveBeenCalled();
        expect(self.controller.$window.location).toEqual('/');
      });
    });
  });

  describe('loadLastPurchase', () => {
    it('should load all data from the last completed purchase', () => {
      jest.spyOn(self.controller.profileService, 'getPurchase');
      jest.spyOn(self.controller.analyticsFactory, 'transactionEvent');
      jest.spyOn(self.controller.envService, 'read').mockReturnValue(false);
      jest
        .spyOn(self.controller, 'loadThankYouImage')
        .mockImplementation(() => {});
      self.controller.loadLastPurchase();

      expect(self.controller.profileService.getPurchase).toHaveBeenCalledWith(
        '/purchases/crugive/iiydanbt=',
      );
      expect(self.controller.purchase).toEqual(self.mockPurchase);
      expect(self.controller.rateTotals).toEqual([
        {
          frequency: 'Single',
          total: '$50.00',
          amount: 50,
        },
        {
          frequency: 'Monthly',
          total: '$20.00',
          amount: 20,
        },
      ]);

      expect(self.controller.loadThankYouImage).toHaveBeenCalled();
      expect(self.controller.loading).toEqual(false);
      expect(self.controller.loadingError).toBeUndefined();
      expect(self.controller.onPurchaseLoaded).toHaveBeenCalledWith({
        $event: { purchase: self.mockPurchase },
      });
      expect(
        self.controller.analyticsFactory.transactionEvent,
      ).toHaveBeenCalledWith(self.mockPurchase);
    });

    it('does not trigger analytics event in branded checkout', () => {
      jest.spyOn(self.controller.analyticsFactory, 'transactionEvent');
      jest.spyOn(self.controller.envService, 'read').mockReturnValue(true);
      self.controller.loadLastPurchase();

      expect(
        self.controller.analyticsFactory.transactionEvent,
      ).not.toHaveBeenCalled();
    });

    it('should not request purchase data if lastPurchaseLink is not defined', () => {
      jest
        .spyOn(self.controller.orderService, 'retrieveLastPurchaseLink')
        .mockImplementation(() => undefined);
      jest
        .spyOn(self.controller.profileService, 'getPurchase')
        .mockImplementation(() => {});
      self.controller.loadLastPurchase();

      expect(self.controller.profileService.getPurchase).not.toHaveBeenCalled();
      expect(self.controller.purchase).not.toBeDefined();
      expect(self.controller.loading).toEqual(false);
      expect(self.controller.loadingError).toEqual('lastPurchaseLink missing');
    });

    it('should handle an api error', () => {
      jest
        .spyOn(self.controller.profileService, 'getPurchase')
        .mockReturnValue(Observable.throw('some error'));
      self.controller.loadLastPurchase();

      expect(self.controller.purchase).not.toBeDefined();
      expect(self.controller.loading).toEqual(false);
      expect(self.controller.loadingError).toEqual('api error');
    });
  });

  describe('loadEmail', () => {
    it("should load the user's email", () => {
      self.controller.loadEmail();

      expect(self.controller.email).toEqual('someperson@someaddress.com');
    });
  });

  describe('loadFacebookPixel', () => {
    beforeEach(() => {
      self.controller.$window.document = document;
    });

    it('should not continue if missing designation code', () => {
      self.controller.loadFacebookPixel({});
    });

    it('should not append facebook pixel to page', () => {
      jest
        .spyOn(self.controller.designationsService, 'facebookPixel')
        .mockReturnValue(Observable.of(undefined));

      self.controller.loadFacebookPixel({
        itemCode: {
          code: '555111',
        },
        rate: {
          cost: [{ amount: 100 }],
        },
      });

      expect(
        self.controller.designationsService.facebookPixel,
      ).toHaveBeenCalled();
      expect(self.controller.$window.document.body.innerHTML).not.toContain(
        'img',
      );
    });

    it('should append facebook pixel to page', () => {
      jest
        .spyOn(self.controller.designationsService, 'facebookPixel')
        .mockReturnValue(Observable.of(123456));

      self.controller.loadFacebookPixel({
        itemCode: {
          code: '555111',
        },
        rate: {
          cost: [{ amount: 100 }],
        },
      });

      expect(
        self.controller.designationsService.facebookPixel,
      ).toHaveBeenCalled();
      expect(self.controller.$window.document.body.innerHTML).toContain('img');
    });
  });

  describe('shouldShowThankYouImage', () => {
    it('should not show if we are in branded checkout', () => {
      self.controller.isBrandedCheckout = true;
      self.controller.shouldShowThankYouImage();
      expect(self.controller.showImage).toEqual(false);
    });

    it('should show the thank you image', () => {
      jest
        .spyOn(self.controller.thankYouService, 'shouldShowThankYouImage')
        .mockReturnValue(Observable.of(true));
      self.controller.shouldShowThankYouImage();
      expect(self.controller.showImage).toEqual(true);
    });
  });

  describe('loadThankYouImage', () => {
    const defaultImage = '/content/dam/give/thank-you-images/some/image.jpg';
    const defaultImageLink = 'https://localhost.cru.org:9000';
    beforeEach(() => {
      jest
        .spyOn(self.controller.thankYouService, 'getThankYouData')
        .mockReturnValue(
          Observable.of({
            defaultImage: defaultImage,
            defaultThankYouImageLink: defaultImageLink,
          }),
        );
      self.controller.purchase = self.mockPurchase;
    });

    it('should return the default image if there are no specific images', () => {
      setupSingleOrgId();
      jest
        .spyOn(self.controller.thankYouService, 'getOrgIdThankYouData')
        .mockReturnValue(Observable.of({}));

      self.controller.loadThankYouImage();
      expect(self.controller.thankYouImage).toEqual(defaultImage);
    });

    it('should return the specific ministry image if there is only one to pick from', () => {
      const onlyImage = '/content/dam/give/thank-you-images/1-TF-1.jpg';
      jest
        .spyOn(self.controller.thankYouService, 'getOrgIdThankYouData')
        .mockReturnValue(
          Observable.of({
            thankYouImage: onlyImage,
          }),
        );
      setupSingleOrgId();

      self.controller.loadThankYouImage();
      expect(self.controller.thankYouImage).toEqual(onlyImage);
    });

    it('should return the default image if there are multiple orgIds in the order', () => {
      setupMultipleOrgIds();
      jest
        .spyOn(self.controller.thankYouService, 'getOrgIdThankYouData')
        .mockReturnValue(
          Observable.of({
            thankYouImage: '/content/dam/give/thank-you-images/1-TF-1.jpg',
          }),
        );

      self.controller.loadThankYouImage();
      expect(self.controller.thankYouImage).toEqual(defaultImage);
    });

    it('should ignore staff orgIds', () => {
      jest
        .spyOn(self.controller.designationsService, 'designationData')
        .mockReturnValueOnce(
          Observable.of({
            organizationId: '1-TF-1',
          }),
        )
        .mockReturnValueOnce(
          Observable.of({
            organizationId: self.controller.STAFF_ORG_ID,
          }),
        );
      const customImage = '/content/dam/give/thank-you-images/1-TF-1.jpg';
      jest
        .spyOn(self.controller.thankYouService, 'getOrgIdThankYouData')
        .mockReturnValue(
          Observable.of({
            thankYouImage: customImage,
          }),
        );
      self.controller.loadThankYouImage();
      expect(self.controller.thankYouImage).toEqual(customImage);
    });

    it('should return a customized thank you image link if one is set and there is only one orgId', () => {
      const customLink = 'https://custom.com';
      jest
        .spyOn(self.controller.thankYouService, 'getOrgIdThankYouData')
        .mockReturnValue(
          Observable.of({
            thankYouImage: '/some/custom/image.jpg',
            thankYouImageLink: customLink,
          }),
        );
      setupSingleOrgId();

      self.controller.loadThankYouImage();
      expect(self.controller.thankYouImageLink).toEqual(customLink);
    });

    it('should return the default thank you image link if there are multiple orgIds', () => {
      const customLink = 'https://custom.com';
      jest
        .spyOn(self.controller.thankYouService, 'getOrgIdThankYouData')
        .mockReturnValue(
          Observable.of({
            thankYouImageLink: customLink,
          }),
        );
      setupMultipleOrgIds();

      self.controller.loadThankYouImage();
      expect(self.controller.thankYouImageLink).toEqual(defaultImageLink);
    });

    it('should return the default image and link when there is an error loading designation data', () => {
      jest
        .spyOn(self.controller.designationsService, 'designationData')
        .mockReturnValue(Observable.throw(new Error()));
      self.controller.loadThankYouImage();
      expect(self.controller.thankYouImage).toEqual(defaultImage);
      expect(self.controller.thankYouImageLink).toEqual(defaultImageLink);
    });

    it('should not set image details if there is an error loading thank you image details', () => {
      jest
        .spyOn(self.controller.thankYouService, 'getThankYouData')
        .mockReturnValue(Observable.throw(new Error()));
      self.controller.loadThankYouImage();
      expect(self.controller.thankYouImage).not.toBeDefined();
      expect(self.controller.thankYouImageLink).not.toBeDefined();
    });

    const setupSingleOrgId = () => {
      jest
        .spyOn(self.controller.designationsService, 'designationData')
        .mockReturnValue(
          Observable.of({
            organizationId: '1-TF-1',
          }),
        );
    };

    const setupMultipleOrgIds = () => {
      jest
        .spyOn(self.controller.designationsService, 'designationData')
        .mockReturnValueOnce(
          Observable.of({
            organizationId: '1-TF-1',
          }),
        )
        .mockReturnValueOnce(
          Observable.of({
            organizationId: '1-TZ-2',
          }),
        );
    };
  });
});
