import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import RecurringGiftModel from 'common/models/recurringGift.model';

import module from './editRecurringGifts.component.js';

describe('editRecurringGiftsModal', () => {
  describe('step 1 editRecurringGifts', () => {
    beforeEach(angular.mock.module(module.name));
    let self = {};

    beforeEach(inject(($componentController) => {
      self.controller = $componentController(module.name, {}, {
        next: jasmine.createSpy('next')
      });
    }));

    describe('$onInit', () => {
      it('should call load gifts', () => {
        spyOn(self.controller, 'loadGifts');
        self.controller.$onInit();
        expect(self.controller.loadGifts).toHaveBeenCalled();
      });
    });

    describe('loadGifts', () => {
      it('should load gifts', () => {
        spyOn(self.controller.donationsService, 'getRecurringGifts').and.returnValue(Observable.of('gifts response'));
        self.controller.loadGifts();
        expect(self.controller.loading).toEqual(false);
        expect(self.controller.loadingError).toEqual(false);
        expect(self.controller.recurringGifts).toEqual('gifts response');
      });
      it('should handle an error loading gifts', () => {
        spyOn(self.controller.donationsService, 'getRecurringGifts').and.returnValue(Observable.throw('gifts error'));
        self.controller.loadGifts();
        expect(self.controller.loading).toEqual(false);
        expect(self.controller.loadingError).toEqual(true);
        expect(self.controller.recurringGifts).toBeUndefined();
        expect(self.controller.nextDrawDate).toBeUndefined();
        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading recurring gifts', 'gifts error']);
      });
    });

    describe('allPaymentMethodsValid', () => {
      beforeEach(() => {
        RecurringGiftModel.paymentMethods = [
          {
            self: { uri: "/selfservicepaymentmethods/crugive/giydgnrxgm=" }
          }
        ];
      });
      it('should return true if all payment methods are valid', () => {
        self.controller.recurringGifts = [new RecurringGiftModel({}).setDefaults(), new RecurringGiftModel({}).setDefaults()];
        expect(self.controller.allPaymentMethodsValid()).toEqual(true);
      });
      it('should return false if any payment methods is invalid', () => {
        self.controller.recurringGifts = [new RecurringGiftModel({}).setDefaults(), new RecurringGiftModel({}).setDefaults()];
        self.controller.recurringGifts[0].paymentMethodId = 'something invalid';
        expect(self.controller.allPaymentMethodsValid()).toEqual(false);
      });
    });
  });
});
