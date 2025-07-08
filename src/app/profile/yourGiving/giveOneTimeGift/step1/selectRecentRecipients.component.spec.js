import angular from 'angular';
import 'angular-mocks';

import module from './selectRecentRecipients.component';

describe('giveOneTimeGiftModal', () => {
  describe('step 1 selectRecentRecipients', () => {
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

    describe('gatherSelections', () => {
      it('should pass search=true through if the user clicks the search button', () => {
        self.controller.gatherSelections(true);

        expect(self.controller.next).toHaveBeenCalledWith({
          selectedRecipients: [],
          search: true,
        });
      });

      it('should set search to undefined if not called with it', () => {
        self.controller.gatherSelections();

        expect(self.controller.next).toHaveBeenCalledWith({
          selectedRecipients: [],
          search: undefined,
        });
      });

      it('should pick out all selected recent recipients', () => {
        self.controller.recentRecipients = [
          { designationName: 'a', _selectedGift: false },
          { designationName: 'b', _selectedGift: true },
        ];
        self.controller.gatherSelections();

        expect(self.controller.next).toHaveBeenCalledWith({
          selectedRecipients: [{ designationName: 'b', _selectedGift: true }],
          search: undefined,
        });
      });
    });
  });
});
