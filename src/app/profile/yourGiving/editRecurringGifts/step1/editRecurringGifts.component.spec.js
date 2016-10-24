import angular from 'angular';
import 'angular-mocks';
import assign from 'lodash/assign';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './editRecurringGifts.component.js';

describe('editRecurringGiftsModal', () => {
  describe('step 1 editRecurringGifts', () => {
    beforeEach(angular.mock.module(module.name));
    var self = {};

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
        spyOn(self.controller.commonService, 'getNextDrawDate').and.returnValue(Observable.of('nextDrawDate response'));
        self.controller.loadGifts();
        expect(self.controller.loading).toEqual(false);
        expect(self.controller.loadingError).toEqual(false);
        expect(self.controller.recurringGifts).toEqual('gifts response');
        expect(self.controller.nextDrawDate).toEqual('nextDrawDate response');
      });
      it('should handle an error loading gifts', () => {
        spyOn(self.controller.donationsService, 'getRecurringGifts').and.returnValue(Observable.throw('gifts error'));
        spyOn(self.controller.commonService, 'getNextDrawDate').and.returnValue(Observable.throw('nextDrawDate error'));
        self.controller.loadGifts();
        expect(self.controller.loading).toEqual(false);
        expect(self.controller.loadingError).toEqual(true);
        expect(self.controller.recurringGifts).toBeUndefined();
        expect(self.controller.nextDrawDate).toBeUndefined();
        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading recurring gifts or nextDrawDate', 'gifts error']);
      });
    });

    describe('processChanges', () => {
      it('should filter out unchanged gifts and call next', () => {
        let emptyGift = {
          'updated-amount': '',
          'updated-payment-method-id': '',
          'updated-rate': {
            recurrence: {
              interval: ''
            }
          },
          'updated-recurring-day-of-month': '',
          'updated-start-month': '',
          'updated-start-year': ''
        };
        self.controller.recurringGifts = [
          assign({}, emptyGift, { 'updated-amount': 10 }),
          assign({}, emptyGift, { 'updated-payment-method-id': '<some id>' }),
          assign({}, emptyGift, { 'updated-rate': { recurrence: { interval: 'Quarterly' } } }),
          assign({}, emptyGift, { 'updated-recurring-day-of-month': '10' }),
          assign({}, emptyGift, { 'updated-start-month': '10' }),
          assign({}, emptyGift, { 'updated-start-year': '2015' }),
          assign({}, emptyGift, { 'amount': 10 }),
          emptyGift
        ];
        self.controller.processChanges();
        expect(self.controller.next).toHaveBeenCalledWith({ recurringGiftChanges: self.controller.recurringGifts.slice(0, -2) });
      });
    });
  });
});
