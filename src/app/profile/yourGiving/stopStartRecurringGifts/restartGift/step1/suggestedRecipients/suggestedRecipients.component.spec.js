import angular from 'angular';
import 'angular-mocks';
import module from './suggestedRecipients.component';

describe('your giving', () => {
  describe('stopStartRecurringGiftsModal', () => {
    describe('restartGift', () => {
      describe('step1', () => {
        describe('suggestedRecipients', () => {
          beforeEach(angular.mock.module(module.name));
          let $ctrl;

          beforeEach(inject(($componentController) => {
            $ctrl = $componentController(
              module.name,
              {},
              { next: jest.fn(), previous: jest.fn() },
            );
          }));

          it('is defined', () => {
            expect($ctrl).toBeDefined();
          });

          describe('selectRecipients()', () => {
            beforeEach(() => {
              $ctrl.gifts = [
                { gift: 1 },
                { gift: 2 },
                { gift: 3 },
                { gift: 4 },
                { gift: 5 },
              ];
            });

            it('filters only selected gifts', () => {
              $ctrl.gifts[0]._selectedGift = true;
              $ctrl.gifts[2]._selectedGift = false;
              $ctrl.selectRecipients();

              expect($ctrl.next).toHaveBeenCalledWith({
                selected: [{ gift: 1, _selectedGift: true }],
              });
            });
          });
        });
      });
    });
  });
});
