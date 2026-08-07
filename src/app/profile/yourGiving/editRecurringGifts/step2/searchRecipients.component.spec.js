import angular from 'angular';
import 'angular-mocks';
import map from 'lodash/map';

import RecurringGiftModel from 'common/models/recurringGift.model';

import module from './searchRecipients.component';

describe('editRecurringGiftsModal', () => {
  describe('step 2 searchRecipients', () => {
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

    describe('onChange', () => {
      it('should update additionalRecipients', () => {
        self.controller.onChange('newly selected recipients');

        expect(self.controller.additionalRecipients).toEqual(
          'newly selected recipients',
        );
      });

      it('should flag selections that are already in the recurring gifts', () => {
        self.controller.recurringGifts = [
          new RecurringGiftModel({ 'designation-number': '0123456' }),
        ];
        self.controller.onChange([
          { designationName: 'Name', designationNumber: '0123456' },
          { designationName: 'Name 2', designationNumber: '1234567' },
        ]);

        expect(self.controller.duplicatedRecipients).toEqual([
          { designationName: 'Name', designationNumber: '0123456' },
        ]);
      });

      it('should not flag selections when none are in the recurring gifts', () => {
        self.controller.recurringGifts = [
          new RecurringGiftModel({ 'designation-number': '7654321' }),
        ];
        self.controller.onChange([
          { designationName: 'Name', designationNumber: '0123456' },
        ]);

        expect(self.controller.duplicatedRecipients).toEqual([]);
      });

      it('should not flag selections when recurring gifts have not been loaded', () => {
        self.controller.recurringGifts = undefined;
        self.controller.onChange([
          { designationName: 'Name', designationNumber: '0123456' },
        ]);

        expect(self.controller.duplicatedRecipients).toEqual([]);
      });
    });

    describe('component bindings', () => {
      it('should accept the recurringGifts binding', inject(($injector) => {
        const directive = $injector.get(`${module.name}Directive`)[0];

        expect(directive.bindToController.recurringGifts).toEqual('<');
      }));
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
            }).setDefaults(),
            new RecurringGiftModel({
              'designation-name': 'Name 2',
              'designation-number': '1234567',
            }).setDefaults(),
          ],
          (recipient) => {
            recipient._selectedGift = true;
            return recipient;
          },
        );

        expect(self.controller.next).toHaveBeenCalledWith({
          additions: additionalRecipients,
        });
      });
    });
  });
});
