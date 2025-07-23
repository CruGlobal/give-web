import angular from 'angular';
import 'angular-mocks';
import module from './redirectGiftStep2.component';

describe('your giving', () => {
  describe('stopStartRecurringGiftsModal', () => {
    describe('redirectGift', () => {
      describe('step2', () => {
        describe('redirectGiftStep2', () => {
          beforeEach(angular.mock.module(module.name));
          let $ctrl;

          beforeEach(inject(($componentController) => {
            $ctrl = $componentController(
              module.name,
              {},
              {
                onSelectResult: jest.fn(),
              },
            );
          }));

          it('is defined', () => {
            expect($ctrl).toBeDefined();
          });

          describe('onSelection', () => {
            it('should store the selectedRecipient', () => {
              const gift = {
                designationNumber: '0123456',
                designationName: 'Some Staff',
              };
              $ctrl.onSelection(gift);

              expect($ctrl.selected).toEqual(gift);
            });
          });
        });
      });
    });
  });
});
