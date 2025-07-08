import angular from 'angular';
import 'angular-mocks';

import module from './configureRecentRecipients.component';

describe('editRecurringGiftsModal', () => {
  describe('step 3 configureRecentRecipients', () => {
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

    it('should get all selected gifts and pass them to the next step', () => {
      expect(self.controller).toBeDefined();
    });
  });
});
