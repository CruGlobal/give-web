import angular from 'angular';
import 'angular-mocks';
import map from 'lodash/map';

import RecurringGiftModel from 'common/models/recurringGift.model';

import module from './searchRecipients.component';

describe('giveOneTimeGiftModal', () => {
  describe('step 1 searchRecipients', () => {
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

    describe('onChange', () => {
      it('should update additionalRecipients when selectedRecipients changes', () => {
        self.controller.onChange([
          'first selected recipient',
          'second selected recipient',
        ]);

        expect(self.controller.additionalRecipients).toEqual([
          'first selected recipient',
          'second selected recipient',
        ]);
      });
    });

    describe('gatherSelections', () => {
      it('should call next with the additionalRecipients after having mapped them to a gift model', () => {
        self.controller.additionalRecipients = [
          { designationName: 'Name', designationNumber: '0123456' },
          { designationName: 'Name 2', designationNumber: '1234567' },
        ];
        self.controller.gatherSelections();
        const additionalRecipients = map(
          [
            new RecurringGiftModel({
              'designation-name': 'Name',
              'designation-number': '0123456',
            }).setDefaultsSingleGift(),
            new RecurringGiftModel({
              'designation-name': 'Name 2',
              'designation-number': '1234567',
            }).setDefaultsSingleGift(),
          ],
          (recipient) => {
            recipient._selectedGift = true;
            return recipient;
          },
        );

        expect(self.controller.next).toHaveBeenCalledWith({
          additionalRecipients: additionalRecipients,
        });
      });
    });
  });
});
