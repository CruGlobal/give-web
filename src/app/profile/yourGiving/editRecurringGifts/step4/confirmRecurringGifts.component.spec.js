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
      it('should set hasChanges to true if there are changed gifts', () => {
        self.controller.recurringGiftChanges = ['change 1'];
        self.controller.$onInit();
        expect(self.controller.hasChanges).toEqual(true);
      });
      it('should set hasChanges to true if there are additions', () => {
        self.controller.additions = ['addition 1'];
        self.controller.$onInit();
        expect(self.controller.hasChanges).toEqual(true);
      });
      it('should set hasChanges to false if there are no recurring gift changes or additions', () => {
        self.controller.$onInit();
        expect(self.controller.hasChanges).toEqual(false);
      });
    });

    describe('saveChanges', () => {
      it('should update gifts', () => {
        self.controller.recurringGiftChanges = [{ testGift: 3 }];
        self.controller.additions = [{ testGift: 4 }];
        spyOn(self.controller.donationsService, 'updateRecurringGifts').and.returnValue(Observable.of('update gifts response')).calls.saveArgumentsByValue();
        spyOn(self.controller.donationsService, 'addRecurringGifts').and.returnValue(Observable.of('add gifts response')).calls.saveArgumentsByValue();
        self.controller.saveChanges();
        expect(self.controller.donationsService.updateRecurringGifts).toHaveBeenCalledWith([{ testGift: 3 }]);
        expect(self.controller.donationsService.addRecurringGifts).toHaveBeenCalledWith([jasmine.objectContaining({ testGift: 4 })]); // Jasmine saveArgumentsByValue doesn't deep clone. The object we are comparing with here contains _selectedGift also
        expect(self.controller.savedGifts).toEqual([{ testGift: 3 }, { testGift: 4, _selectedGift: false }]);
        expect(self.controller.recurringGiftChanges).toEqual([]);
        expect(self.controller.additions).toEqual([]);
        expect(self.controller.next).toHaveBeenCalled();
        expect(self.controller.savingError).toEqual('');
      });
      it('should handle an error updating recurring gifts', () => {
        self.controller.recurringGiftChanges = [ { testGift: 5 } ];
        self.controller.additions = [{ testGift: 6 }];
        spyOn(self.controller.donationsService, 'updateRecurringGifts').and.returnValue(Observable.throw({ data: 'update gifts error' }));
        spyOn(self.controller.donationsService, 'addRecurringGifts').and.returnValue(Observable.of('add gifts response'));
        self.controller.saveChanges();
        expect(self.controller.savedGifts).toEqual([{ testGift: 6, _selectedGift: false }]);
        expect(self.controller.recurringGiftChanges).toEqual([{ testGift: 5 }]);
        expect(self.controller.additions).toEqual([]);
        expect(self.controller.savingError).toEqual('update gifts error');
        expect(self.controller.$log.error.logs[0]).toEqual(['Error updating/adding recurring gifts', { data: 'update gifts error' }]);
        expect(self.controller.saving).toEqual(false);
      });
      it('should handle an unknown error adding gifts', () => {
        self.controller.recurringGiftChanges = [ { testGift: 7 } ];
        self.controller.additions = [{ testGift: 8 }];
        spyOn(self.controller.donationsService, 'updateRecurringGifts').and.returnValue(Observable.of('update gifts response'));
        spyOn(self.controller.donationsService, 'addRecurringGifts').and.returnValue(Observable.throw({}));
        self.controller.saveChanges();
        expect(self.controller.savedGifts).toEqual([{ testGift: 7 }]);
        expect(self.controller.recurringGiftChanges).toEqual([]);
        expect(self.controller.additions).toEqual([{ testGift: 8 }]);
        expect(self.controller.savingError).toEqual('unknown');
        expect(self.controller.$log.error.logs[0]).toEqual(['Error updating/adding recurring gifts', {}]);
        expect(self.controller.saving).toEqual(false);
      });
    });
  });
});
