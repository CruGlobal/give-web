import angular from 'angular';
import 'angular-mocks';
import module from './redirectGiftStep1.component';

describe('your giving', () => {
  describe('stopStartRecurringGiftsModal', () => {
    describe('redirectGift', () => {
      describe('step1', () => {
        describe('redirectGiftStep1', () => {
          beforeEach(angular.mock.module(module.name));
          let $ctrl;

          beforeEach(inject(($componentController) => {
            $ctrl = $componentController(
              module.name,
              {},
              {
                onSelectGift: jest.fn(),
              },
            );
          }));

          it('is defined', () => {
            expect($ctrl).toBeDefined();
            expect($ctrl.find).toEqual(expect.any(Function));
          });

          describe('selectGift()', () => {
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
              $ctrl.selectGift();

              expect($ctrl.onSelectGift).toHaveBeenCalledWith({
                gift: { gift: 1, _selectedGift: true },
              });
            });
          });

          describe('giftSelected( gift )', () => {
            beforeEach(() => {
              $ctrl.gifts = [
                { gift: 1 },
                { gift: 2 },
                { gift: 3 },
                { gift: 4 },
                { gift: 5 },
              ];
            });

            it('de-selects previously selected gift', () => {
              $ctrl.gifts[0]._selectedGift = true;
              // gift-list-item selects the gift before calling giftSelected
              $ctrl.gifts[2]._selectedGift = true;
              $ctrl.giftSelected($ctrl.gifts[2]);

              expect($ctrl.gifts[2]._selectedGift).toEqual(true);
              expect($ctrl.gifts[0]._selectedGift).toEqual(false);
            });
          });
        });
      });
    });
  });
});
