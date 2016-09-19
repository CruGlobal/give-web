import angular from 'angular';
import 'angular-mocks';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './thankYou.component.js';

describe('thank you', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(($componentController) => {
    self.mockPurchase = {
      donorDetails: {
        'mailing-address': {
          'street-address': '123 Mailing St'
        },
        'registration-state': 'MATCHED'
      },
      paymentMeans: {
        self: {
          type: "elasticpath.purchases.purchase.paymentmeans"
        },
        'billing-address': {
          address: {
            'street-address': '123 Billing St'
          }
        }
      },
      rateTotals: [{
        cost: {
          display: '$20.00'
        },
        recurrence: {
          display: 'Monthly'
        }
      }],
      rawData: {
        'monetary-total': [
          {
            display: '$50.00'
          }
        ]

      }
    };

    self.controller = $componentController(module.name, {
      orderService: {
        retrieveLastPurchaseLink: () => '/purchases/crugive/iiydanbt=',
        formatAddressForTemplate: (address) => address
      },
      purchasesService: {
        getPurchase: () => Observable.of(self.mockPurchase)
      },
      profileService: {
        getEmail: () => Observable.of('someperson@someaddress.com')
      }
    });
  }));

  describe('$onInit', () => {
    it('should call all methods needed to load data for the component', () => {
      spyOn(self.controller, 'loadLastPurchase');
      self.controller.$onInit();
      expect(self.controller.loadLastPurchase).toHaveBeenCalled();
    });
  });

  describe('loadLastPurchase', () => {
    it('should load all data from the last completed purchase', () => {
      spyOn(self.controller.purchasesService, 'getPurchase').and.callThrough();
      self.controller.loadLastPurchase();
      expect(self.controller.purchasesService.getPurchase).toHaveBeenCalledWith('/purchases/crugive/iiydanbt=');
      expect(self.controller.purchase).toEqual(self.mockPurchase);
      expect(self.controller.mailingAddress).toEqual({'street-address': '123 Mailing St'});
      expect(self.controller.billingAddress).toEqual({'street-address': '123 Billing St'});
      expect(self.controller.rateTotals).toEqual([
        {
          frequency: 'Single',
          total: '$50.00'
        },
        {
          frequency: 'Monthly',
          total: '$20.00'
        }
      ]);
    });
    it('should not request purchase data if lastPurchaseLink is not defined', () => {
      spyOn(self.controller.orderService, 'retrieveLastPurchaseLink').and.callFake(() => undefined);
      spyOn(self.controller.purchasesService, 'getPurchase');
      self.controller.loadLastPurchase();
      expect(self.controller.purchasesService.getPurchase).not.toHaveBeenCalled();
      expect(self.controller.purchase).not.toBeDefined();
    });
    it('should not try to parse the billing address if it is not a credit card payment', () => {
      spyOn(self.controller.purchasesService, 'getPurchase').and.callThrough();
      self.mockPurchase.paymentMeans.self.type = 'elasticpath.bankaccountpurchases.payment-means-bank-account';
      self.controller.loadLastPurchase();
      expect(self.controller.purchasesService.getPurchase).toHaveBeenCalledWith('/purchases/crugive/iiydanbt=');
      expect(self.controller.purchase).toEqual(self.mockPurchase);
      expect(self.controller.mailingAddress).toEqual({'street-address': '123 Mailing St'});
      expect(self.controller.billingAddress).toBeUndefined();
    });

    describe('accounts benefits modal', () => {
      let deferred, $rootScope;
      beforeEach(inject((_$q_, _$rootScope_) => {
        deferred = _$q_.defer();
        $rootScope = _$rootScope_;
        spyOn(self.controller.purchasesService, 'getPurchase').and.callThrough();
        spyOn(self.controller.sessionModalService, 'accountBenefits').and.returnValue(deferred.promise);
        spyOn(self.controller.sessionModalService, 'userMatch');
      }));

      it( 'should show accountBenefits modal on matched user', () => {
        self.controller.loadLastPurchase();
        expect(self.controller.sessionModalService.accountBenefits).toHaveBeenCalled();
        deferred.resolve();
        $rootScope.$digest();
        expect(self.controller.sessionModalService.userMatch).toHaveBeenCalled();
      });
    });
  });
  describe('loadEmail', () => {
    it('should load the user\'s email', () => {
      self.controller.loadEmail();
      expect(self.controller.email).toEqual('someperson@someaddress.com');
    });
  });
});
