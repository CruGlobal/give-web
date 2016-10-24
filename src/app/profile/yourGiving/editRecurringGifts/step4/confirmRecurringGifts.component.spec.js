import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './confirmRecurringGifts.component.js';

describe('editRecurringGiftsModal', () => {
  describe('step 4 confirmRecurringGifts', () => {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(($componentController) => {
      self.controller = $componentController(module.name, {}, {
        next: jasmine.createSpy('next')
      });
    }));

    describe('$onInit', () => {
      it('should filter out unchanged gifts', () => {
        self.controller.recurringGifts = [
          {
            testGift: 1,
            hasChanges: () => true
          },
          {
            testGift: 2,
            hasChanges: () => false
          }
        ];
        self.controller.$onInit();
        expect(self.controller.recurringGiftChanges).toEqual([ self.controller.recurringGifts[0] ]);
      });
    });

    describe('saveChanges', () => {
      it('should update gifts', () => {
        self.controller.recurringGiftChanges = [{ testGift: 3 }];
        spyOn(self.controller.donationsService, 'updateRecurringGifts').and.returnValue(Observable.of('gifts response'));
        self.controller.saveChanges();
        expect(self.controller.donationsService.updateRecurringGifts).toHaveBeenCalledWith([{ testGift: 3 }]);
        expect(self.controller.next).toHaveBeenCalled();
        expect(self.controller.savingError).toEqual('');
      });
      it('should handle an error updating gifts', () => {
        spyOn(self.controller.donationsService, 'updateRecurringGifts').and.returnValue(Observable.throw({ data: 'gifts error' }));
        self.controller.saveChanges();
        expect(self.controller.savingError).toEqual('gifts error');
        expect(self.controller.$log.error.logs[0]).toEqual(['Error updating recurring gifts', { data: 'gifts error' }]);
        expect(self.controller.saving).toEqual(false);
      });
      it('should handle an unknown error updating gifts', () => {
        spyOn(self.controller.donationsService, 'updateRecurringGifts').and.returnValue(Observable.throw({}));
        self.controller.saveChanges();
        expect(self.controller.savingError).toEqual('unknown');
        expect(self.controller.$log.error.logs[0]).toEqual(['Error updating recurring gifts', {}]);
        expect(self.controller.saving).toEqual(false);
      });
    });
  });
});
