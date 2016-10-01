import angular from 'angular';
import 'angular-mocks';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './thankYou.component.js';

describe('thank you', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(($componentController) => {
    self.mockPurchase = {
      donorDetails: {
        'mailingAddress': {
          'street-address': '123 Mailing St'
        },
        'registration-state': 'MATCHED'
      },
      paymentMeans: {
        self: {
          type: "elasticpath.purchases.purchase.paymentmeans"
        },
        address: {
          'street-address': '123 Billing St'
        }
      },
      rateTotals: [{
        cost: {
          display: '$20.00',
          amount: 20
        },
        recurrence: {
          display: 'Monthly'
        }
      }],
      rawData: {
        'monetary-total': [
          {
            display: '$50.00',
            amount: 50
          }
        ]

      }
    };

    self.controller = $componentController(module.name, {
      orderService: {
        retrieveLastPurchaseLink: () => '/purchases/crugive/iiydanbt='
      },
      profileService: {
        getPurchase: () => Observable.of(self.mockPurchase),
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
      spyOn(self.controller.profileService, 'getPurchase').and.callThrough();
      self.controller.loadLastPurchase();
      expect(self.controller.profileService.getPurchase).toHaveBeenCalledWith('/purchases/crugive/iiydanbt=');
      expect(self.controller.purchase).toEqual(self.mockPurchase);
      expect(self.controller.rateTotals).toEqual([
        {
          frequency: 'Single',
          total: '$50.00',
          amount: 50
        },
        {
          frequency: 'Monthly',
          total: '$20.00',
          amount: 20
        }
      ]);
      expect(self.controller.loading).toEqual(false);
      expect(self.controller.loadingError).toBeUndefined();
    });
    it('should not request purchase data if lastPurchaseLink is not defined', () => {
      spyOn(self.controller.orderService, 'retrieveLastPurchaseLink').and.callFake(() => undefined);
      spyOn(self.controller.profileService, 'getPurchase');
      self.controller.loadLastPurchase();
      expect(self.controller.profileService.getPurchase).not.toHaveBeenCalled();
      expect(self.controller.purchase).not.toBeDefined();
      expect(self.controller.loading).toEqual(false);
      expect(self.controller.loadingError).toEqual('lastPurchaseLink missing');
    });
    it('should handle an api error', () => {
      spyOn(self.controller.profileService, 'getPurchase').and.returnValue(Observable.throw('some error'));
      self.controller.loadLastPurchase();
      expect(self.controller.purchase).not.toBeDefined();
      expect(self.controller.loading).toEqual(false);
      expect(self.controller.loadingError).toEqual('api error');
    });

    describe('accounts benefits modal', () => {
      let deferred, $rootScope;
      beforeEach(inject((_$q_, _$rootScope_) => {
        deferred = _$q_.defer();
        $rootScope = _$rootScope_;
        spyOn(self.controller.profileService, 'getPurchase').and.callThrough();
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
