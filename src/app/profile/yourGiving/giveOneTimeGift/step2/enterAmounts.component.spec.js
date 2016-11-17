import angular from 'angular';
import 'angular-mocks';

import module from './enterAmounts.component';

describe('giveOneTimeGiftModal', () => {
  describe('step 2 enterAmounts', () => {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(($componentController) => {
      self.controller = $componentController(module.name, {}, {
        next: jasmine.createSpy('next')
      });
    }));

    describe('$onInit', () => {
      it('should initialize hasSelectedRecipients if there are selectedRecipients', () => {
        self.controller.selectedRecipients = ['some gift'];
        self.controller.$onInit();
        expect(self.controller.hasSelectedRecipients).toEqual(true);
      });
      it('should initialize hasSelectedRecipients if selectedRecipients is an empty array', () => {
        self.controller.selectedRecipients = [];
        self.controller.$onInit();
        expect(self.controller.hasSelectedRecipients).toEqual(false);
      });
      it('should initialize hasSelectedRecipients if selectedRecipients is undefined', () => {
        self.controller.selectedRecipients = undefined;
        self.controller.$onInit();
        expect(self.controller.hasSelectedRecipients).toBeFalsy();
      });
    });
  });
});
