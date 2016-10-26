import angular from 'angular';
import 'angular-mocks';

import module from './addRecentRecipients.component';

describe('editRecurringGiftsModal', () => {
  describe('step 2 addRecentRecipients', () => {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(($componentController) => {
      self.controller = $componentController(module.name, {}, {
        next: jasmine.createSpy('next')
      });
    }));

    describe('gatherSelections', () => {
      it('should get all selected gifts and pass them to the next step', () => {
        self.controller.recentRecipients = [ {}, {_selectedGift: true} ];
        self.controller.gatherSelections();
        expect(self.controller.next).toHaveBeenCalledWith({ additions: [{_selectedGift: true}] });
      });
    });
  });
});
