import angular from 'angular';
import 'angular-mocks';
import module from './historicalGift.component';

describe('your giving', function () {
  describe('historical view', () => {
    describe('recipient gift', () => {
      beforeEach(angular.mock.module(module.name));
      let $ctrl;

      beforeEach(inject((_$componentController_) => {
        $ctrl = _$componentController_(
          module.name,
          {},
          {
            gift: {},
            onManageGift: jest.fn(),
          },
        );
      }));

      it('to be defined', function () {
        expect($ctrl).toBeDefined();
        expect($ctrl.productModalService).toBeDefined();
      });

      describe('manageGift()', () => {
        it('calls onManageGift', () => {
          $ctrl.manageGift();

          expect($ctrl.onManageGift).toHaveBeenCalled();
        });
      });

      describe('giveNewGift()', () => {
        beforeEach(() => {
          jest
            .spyOn($ctrl.productModalService, 'configureProduct')
            .mockImplementation(() => {});
        });

        it('displays productConfig modal', () => {
          $ctrl.gift = {
            'historical-donation-line': { 'designation-number': '01234567' },
          };
          $ctrl.giveNewGift();

          expect(
            $ctrl.productModalService.configureProduct,
          ).toHaveBeenCalledWith('01234567');
        });
      });
    });
  });
});
