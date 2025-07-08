import angular from 'angular';
import 'angular-mocks';

import module from './addRecentRecipients.component';

describe('editRecurringGiftsModal', () => {
  describe('step 2 addRecentRecipients', () => {
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
      it('should skip this step if there are no recent recipients', () => {
        jest
          .spyOn(self.controller, 'loadedNoRecentRecipients')
          .mockReturnValue(false);
        self.controller.$onInit();

        expect(self.controller.next).not.toHaveBeenCalled();
      });

      it('should not skip this step if there are recent recipients', () => {
        jest
          .spyOn(self.controller, 'loadedNoRecentRecipients')
          .mockReturnValue(true);
        self.controller.$onInit();

        expect(self.controller.next).toHaveBeenCalled();
      });
    });

    describe('loadedNoRecentRecipients', () => {
      it('should return true if finished loading recipients and there are no recent recipients', () => {
        self.controller.loadingRecentRecipients = false;
        self.controller.hasRecentRecipients = false;

        expect(self.controller.loadedNoRecentRecipients()).toEqual(true);
      });

      it('should return false if finished loading recipients and there are recent recipients', () => {
        self.controller.loadingRecentRecipients = false;
        self.controller.hasRecentRecipients = true;

        expect(self.controller.loadedNoRecentRecipients()).toEqual(false);
      });

      it('should return false if still loading', () => {
        self.controller.loadingRecentRecipients = true;
        self.controller.hasRecentRecipients = true;

        expect(self.controller.loadedNoRecentRecipients()).toEqual(false);
        self.controller.hasRecentRecipients = false;

        expect(self.controller.loadedNoRecentRecipients()).toEqual(false);
      });
    });

    describe('gatherSelections', () => {
      it('should get all selected gifts and pass them to the next step', () => {
        self.controller.recentRecipients = [{}, { _selectedGift: true }];
        self.controller.gatherSelections();

        expect(self.controller.next).toHaveBeenCalledWith({
          additions: [{ _selectedGift: true }],
        });
      });
    });
  });
});
