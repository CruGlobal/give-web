import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import clone from 'lodash/clone';

import module from './confirmRecurringGifts.component.js';

describe('editRecurringGiftsModal', () => {
  describe('step 4 confirmRecurringGifts', () => {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(($componentController) => {
      self.controller = $componentController(
        module.name,
        {},
        {
          next: jest.fn(),
        },
      );
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
        let updatedGifts, addedGifts;
        self.controller.recurringGiftChanges = [{ testGift: 3 }];
        self.controller.additions = [{ testGift: 4 }];
        jest
          .spyOn(self.controller.donationsService, 'updateRecurringGifts')
          .mockImplementation((gifts) => {
            updatedGifts = clone(gifts);
            return Observable.of('update gifts response');
          });
        jest
          .spyOn(self.controller.donationsService, 'addRecurringGifts')
          .mockImplementation((gifts) => {
            addedGifts = clone(gifts);
            return Observable.of('add gifts response');
          });
        jest
          .spyOn(self.controller.analyticsFactory, 'track')
          .mockImplementation(() => {});
        self.controller.saveChanges();

        expect(
          self.controller.donationsService.updateRecurringGifts,
        ).toHaveBeenCalledWith(expect.anything());
        expect(updatedGifts).toEqual([{ testGift: 3 }]);
        expect(
          self.controller.donationsService.addRecurringGifts,
        ).toHaveBeenCalledWith(expect.anything());
        // Jasmine saveArgumentsByValue doesn't deep clone. The object we are comparing with here contains _selectedGift also
        expect(addedGifts).toEqual([expect.objectContaining({ testGift: 4 })]);
        expect(self.controller.savedGifts).toEqual([
          { testGift: 3 },
          { testGift: 4, _selectedGift: false },
        ]);
        expect(self.controller.recurringGiftChanges).toEqual([]);
        expect(self.controller.additions).toEqual([]);
        expect(self.controller.next).toHaveBeenCalled();
        expect(self.controller.savingError).toEqual('');
        expect(self.controller.analyticsFactory.track).toHaveBeenCalledWith(
          'ga-edit-recurring-submit',
        );
      });

      it('should handle an error updating recurring gifts', () => {
        self.controller.recurringGiftChanges = [{ testGift: 5 }];
        self.controller.additions = [{ testGift: 6 }];
        jest
          .spyOn(self.controller.donationsService, 'updateRecurringGifts')
          .mockReturnValue(Observable.throw({ data: 'update gifts error' }));
        jest
          .spyOn(self.controller.donationsService, 'addRecurringGifts')
          .mockReturnValue(Observable.of('add gifts response'));
        self.controller.saveChanges();

        expect(self.controller.savedGifts).toEqual([
          { testGift: 6, _selectedGift: false },
        ]);
        expect(self.controller.recurringGiftChanges).toEqual([{ testGift: 5 }]);
        expect(self.controller.additions).toEqual([]);
        expect(self.controller.savingError).toEqual('update gifts error');
        expect(self.controller.$log.error.logs[0]).toEqual([
          'Error updating/adding recurring gifts',
          { data: 'update gifts error' },
        ]);
        expect(self.controller.saving).toEqual(false);
      });

      it('should handle an unknown error adding gifts', () => {
        self.controller.recurringGiftChanges = [{ testGift: 7 }];
        self.controller.additions = [{ testGift: 8 }];
        jest
          .spyOn(self.controller.donationsService, 'updateRecurringGifts')
          .mockReturnValue(Observable.of('update gifts response'));
        jest
          .spyOn(self.controller.donationsService, 'addRecurringGifts')
          .mockReturnValue(Observable.throw({}));
        self.controller.saveChanges();

        expect(self.controller.savedGifts).toEqual([{ testGift: 7 }]);
        expect(self.controller.recurringGiftChanges).toEqual([]);
        expect(self.controller.additions).toEqual([{ testGift: 8 }]);
        expect(self.controller.savingError).toEqual('unknown');
        expect(self.controller.$log.error.logs[0]).toEqual([
          'Error updating/adding recurring gifts',
          {},
        ]);
        expect(self.controller.saving).toEqual(false);
      });
    });
  });
});
