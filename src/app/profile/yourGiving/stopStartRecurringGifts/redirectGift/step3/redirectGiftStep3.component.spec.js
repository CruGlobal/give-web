import angular from 'angular';
import 'angular-mocks';
import module from './redirectGiftStep3.component';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe('your giving', () => {
  describe('stopStartRecurringGiftsModal', () => {
    describe('redirectGift', () => {
      describe('step3', () => {
        describe('redirectGiftStep3', () => {
          beforeEach(angular.mock.module(module.name));
          let $ctrl;

          beforeEach(inject(($componentController) => {
            $ctrl = $componentController(
              module.name,
              {},
              {
                onComplete: jest.fn(),
                onCancel: jest.fn(),
                onPrevious: jest.fn(),
                setLoading: jest.fn(),
              },
            );
          }));

          it('is defined', () => {
            expect($ctrl).toBeDefined();
            expect($ctrl.state).toEqual('update');
            expect($ctrl.commonService).toBeDefined();
            expect($ctrl.donationsService).toBeDefined();
          });

          describe('submitGift', () => {
            beforeEach(() => {
              $ctrl.hasError = true;
              $ctrl.gift = {
                designationName: 'Javier',
                designationNumber: '6543210',
              };
            });

            describe('updateRecurringGifts success', () => {
              it('completes the gift redirect', () => {
                jest
                  .spyOn($ctrl.donationsService, 'updateRecurringGifts')
                  .mockReturnValue(Observable.of({}));
                $ctrl.submitGift();

                expect($ctrl.hasError).toEqual(false);
                expect($ctrl.setLoading).toHaveBeenCalledWith({
                  loading: true,
                });
                expect(
                  $ctrl.donationsService.updateRecurringGifts,
                ).toHaveBeenCalledWith({
                  designationName: 'Javier',
                  designationNumber: '6543210',
                });

                expect($ctrl.onComplete).toHaveBeenCalled();
              });
            });

            describe('updateRecurringGifts failure', () => {
              it('completes the gift redirect', () => {
                jest
                  .spyOn($ctrl.donationsService, 'updateRecurringGifts')
                  .mockReturnValue(Observable.throw('some error'));
                $ctrl.submitGift();

                expect($ctrl.hasError).toEqual(true);
                expect($ctrl.setLoading).toHaveBeenCalledWith({
                  loading: true,
                });
                expect($ctrl.setLoading).toHaveBeenCalledWith({
                  loading: false,
                });
                expect($ctrl.onComplete).not.toHaveBeenCalled();
                expect($ctrl.$log.error.logs[0]).toEqual([
                  'Error redirecting a gift',
                  'some error',
                ]);
              });
            });
          });

          describe('previous()', () => {
            beforeEach(() => {
              $ctrl.hasError = true;
            });

            describe("state = 'update'", () => {
              it('calls onPrevious()', () => {
                $ctrl.state = 'update';
                $ctrl.previous();

                expect($ctrl.hasError).toEqual(false);
                expect($ctrl.onPrevious).toHaveBeenCalled();
              });
            });

            describe("state = 'confirm'", () => {
              it("sets state to 'update'", () => {
                $ctrl.state = 'confirm';
                $ctrl.previous();

                expect($ctrl.hasError).toEqual(false);
                expect($ctrl.state).toEqual('update');
                expect($ctrl.onPrevious).not.toHaveBeenCalled();
              });
            });
          });
        });
      });
    });
  });
});
