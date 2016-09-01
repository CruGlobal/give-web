import angular from 'angular';
import 'angular-mocks';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './thank-you.component.js';

describe('thank you', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(module.name, {
      orderService: {
        retrieveLastPurchaseLink: () => '/purchases/crugive/iiydanbt='
      },
      purchasesService: {
        getPurchase: () => Observable.of('purchaseData')
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
      expect(self.controller.purchase).toEqual('purchaseData');
    });
    it('should not request purchase data if lastPurchaseLink is not defined', () => {
      spyOn(self.controller.orderService, 'retrieveLastPurchaseLink').and.callFake(() => undefined);
      spyOn(self.controller.purchasesService, 'getPurchase');
      self.controller.loadLastPurchase();
      expect(self.controller.purchasesService.getPurchase).not.toHaveBeenCalled();
      expect(self.controller.purchase).not.toBeDefined();
    });
  });
});
