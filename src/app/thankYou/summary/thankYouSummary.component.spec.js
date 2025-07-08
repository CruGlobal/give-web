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
});
