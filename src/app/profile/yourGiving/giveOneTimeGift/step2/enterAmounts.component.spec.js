import angular from 'angular';
import 'angular-mocks';

import module from './enterAmounts.component';

describe('giveOneTimeGiftModal', () => {
  describe('step 2 enterAmounts', () => {
    beforeEach(angular.mock.module(module.name));
    const self = {};

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

    describe('$onChanges', () => {
      it('should set addingToCart to false when submitted is true', () => {
        self.controller.addingToCart = true;
        self.controller.$onChanges({ submitted: { currentValue: true } });

        expect(self.controller.addingToCart).toEqual(false);
      });

      it('should not set addingToCart to false when submitted is not true', () => {
        self.controller.addingToCart = true;
        self.controller.$onChanges({ submitted: { currentValue: false } });

        expect(self.controller.addingToCart).toEqual(true);
        self.controller.$onChanges({});

        expect(self.controller.addingToCart).toEqual(true);
      });
    });

    describe('addToCart', () => {
      it('should set addingToCart to true and call next', () => {
        self.controller.addingToCart = false;
        self.controller.selectedRecipients = [{ designationNumber: '0123456' }];
        self.controller.addToCart();

        expect(self.controller.addingToCart).toEqual(true);
        expect(self.controller.next).toHaveBeenCalledWith({
          selectedRecipients: [{ designationNumber: '0123456' }],
        });
      });
    });
  });
});
