import angular from 'angular';
import 'angular-mocks';

import module from './stopGiftStep1.component';

describe('your giving', () => {
  describe('stopStartRecurringGiftsModal', () => {
    describe('stopGift', () => {
      describe('step1', () => {
        describe('stopGiftStep1', () => {
          beforeEach(angular.mock.module(module.name));
          let $ctrl;

          beforeEach(inject(($componentController) => {
            $ctrl = $componentController(
              module.name,
              {},
              {
                onSelectGifts: jest.fn(),
              },
            );
          }));

          it('is defined', () => {
            expect($ctrl).toBeDefined();
            expect($ctrl.find).toEqual(expect.any(Function));
          });

          describe('selectGifts()', () => {
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
              $ctrl.gifts[3]._selectedGift = true;
              $ctrl.selectGifts();

              expect($ctrl.onSelectGifts).toHaveBeenCalledWith({
                selectedGifts: [
                  { gift: 1, _selectedGift: true },
                  { gift: 4, _selectedGift: true },
                ],
              });
            });
          });
        });
      });
    });
  });
});
