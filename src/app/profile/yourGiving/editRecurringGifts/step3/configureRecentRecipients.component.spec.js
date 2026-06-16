import angular from 'angular';
import 'angular-mocks';

import RecurringGiftModel from 'common/models/recurringGift.model';

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

    describe('allGiftsValid', () => {
      beforeEach(() => {
        RecurringGiftModel.paymentMethods = [
          {
            self: { uri: '/selfservicepaymentinstruments/crugive/giydgnrxgm=' },
          },
        ];
        self.controller.additions = [
          new RecurringGiftModel({}).setDefaults(),
          new RecurringGiftModel({}).setDefaults(),
        ];
      });

      it('should return true if all gifts have valid amounts and payment methods', () => {
        expect(self.controller.allGiftsValid()).toEqual(true);
      });

      it('should return false if any amount is invalid', () => {
        self.controller.additions[0].amount = undefined;

        expect(self.controller.allGiftsValid()).toEqual(false);
      });

      it('should return false if any payment method is invalid', () => {
        self.controller.additions[0].paymentMethodId = 'something invalid';

        expect(self.controller.allGiftsValid()).toEqual(false);
      });
    });
  });
});
