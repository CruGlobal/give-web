import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './redirectGift.component';

describe('your giving', () => {
  describe('stopStartRecurringGiftsModal', () => {
    describe('redirectGift', () => {
      beforeEach(angular.mock.module(module.name));
      let $ctrl;

      beforeEach(inject(($componentController) => {
        $ctrl = $componentController(
          module.name,
          {},
          {
            changeState: jest.fn(),
            setLoading: jest.fn(),
            complete: jest.fn(),
          },
        );
      }));

      it('is defined', () => {
        expect($ctrl).toBeDefined();
        expect($ctrl.donationsService).toBeDefined();
      });

      describe('$onInit', () => {
        it('initializes the component', () => {
          jest.spyOn($ctrl, 'loadRecurringGifts').mockImplementation(() => {});
          $ctrl.$onInit();

          expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
          expect($ctrl.loadRecurringGifts).toHaveBeenCalled();
        });
      });

      describe('setStep( step )', () => {
        beforeEach(() => {
          jest.spyOn($ctrl, 'scrollModalToTop').mockImplementation(() => {});
        });

        it('should scroll to the top of the modal', () => {
          $ctrl.setStep();

          expect($ctrl.scrollModalToTop).toHaveBeenCalled();
        });

        it('sets the current step', () => {
          expect($ctrl.step).not.toBeDefined();
          $ctrl.setStep('step-1');

          expect($ctrl.step).toEqual('step-1');
        });
      });

      describe('previous()', () => {
        beforeEach(() => {
          jest.spyOn($ctrl, 'scrollModalToTop').mockImplementation(() => {});
        });

        it('should scroll to the top of the modal', () => {
          $ctrl.previous();

          expect($ctrl.scrollModalToTop).toHaveBeenCalled();
        });

        describe('undefined current step', () => {
          it("changes step to 'step-0'", () => {
            $ctrl.previous();

            expect($ctrl.changeState).toHaveBeenCalledWith({ state: 'step-0' });
          });
        });

        describe("current step 'step-1'", () => {
          it("changes step to 'step-0'", () => {
            $ctrl.step = 'step-1';
            $ctrl.previous();

            expect($ctrl.changeState).toHaveBeenCalledWith({ state: 'step-0' });
          });
        });

        describe("current step 'step-2'", () => {
          it("changes step to 'step-1'", () => {
            $ctrl.step = 'step-2';
            $ctrl.previous();

            expect($ctrl.step).toEqual('step-1');
            expect($ctrl.changeState).not.toHaveBeenCalled();
          });
        });

        describe("current step 'step-3'", () => {
          it("changes step to 'step-2'", () => {
            $ctrl.step = 'step-3';
            $ctrl.previous();

            expect($ctrl.step).toEqual('step-2');
            expect($ctrl.changeState).not.toHaveBeenCalled();
          });
        });
      });

      describe('loadRecurringGifts()', () => {
        it('loads recurring gifts and changes step', () => {
          jest
            .spyOn($ctrl.donationsService, 'getRecurringGifts')
            .mockReturnValue(Observable.of(['a', 'b']));
          jest.spyOn($ctrl, 'setStep').mockImplementation(() => {});
          $ctrl.loadRecurringGifts();

          expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
          expect($ctrl.loadingRecurringGiftsError).toEqual(false);
          expect($ctrl.donationsService.getRecurringGifts).toHaveBeenCalled();
          expect($ctrl.gifts).toEqual(['a', 'b']);
          expect($ctrl.setStep).toHaveBeenCalledWith('step-1');
          expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });
        });

        it('should log an error on failure', () => {
          jest
            .spyOn($ctrl.donationsService, 'getRecurringGifts')
            .mockReturnValue(Observable.throw('some error'));
          $ctrl.loadRecurringGifts();

          expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
          expect($ctrl.loadingRecurringGiftsError).toEqual(true);
          expect($ctrl.$log.error.logs[0]).toEqual([
            'Error loading recurring gifts',
            'some error',
          ]);
          expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });
        });
      });

      describe('selectGift( gift )', () => {
        it("sets selectedGift and moves to 'step-2'", () => {
          jest.spyOn($ctrl, 'setStep').mockImplementation(() => {});
          $ctrl.selectGift('c');

          expect($ctrl.selectedGift).toEqual('c');
          expect($ctrl.setStep).toHaveBeenCalledWith('step-2');
        });
      });

      describe('selectResult( result )', () => {
        it("creates redirectedGift and moves to 'step-3'", () => {
          jest.spyOn($ctrl, 'setStep').mockImplementation(() => {});
          $ctrl.selectedGift = {
            clone: jest.fn(() => ({
              designationName: 'Bob',
              designationNumber: '0123456',
            })),
          };
          $ctrl.selectResult({
            designationName: 'Javier',
            designationNumber: '6543210',
            _selectedGift: true,
          });

          expect($ctrl.selectedGift.clone).toHaveBeenCalled();
          expect($ctrl.redirectedGift).toEqual({
            designationName: 'Javier',
            designationNumber: '6543210',
          });
          expect($ctrl.setStep).toHaveBeenCalledWith('step-3');
        });
      });
    });
  });
});
