import angular from 'angular';
import 'angular-mocks';
import module from './confirmGifts.component';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import RecurringGiftModel from 'common/models/recurringGift.model';

describe('your giving', () => {
  describe('stopStartRecurringGiftsModal', () => {
    describe('restartGift', () => {
      describe('step2', () => {
        describe('confirmGifts', () => {
          beforeEach(angular.mock.module(module.name));
          let $ctrl;

          beforeEach(inject(($componentController) => {
            $ctrl = $componentController(
              module.name,
              {},
              { next: jest.fn(), previous: jest.fn(), setLoading: jest.fn() },
            );
          }));

          it('is defined', () => {
            expect($ctrl).toBeDefined();
            expect($ctrl.donationsService).toBeDefined();
          });

          describe('$onInit()', () => {
            it('initializes the component', () => {
              $ctrl.gifts = [
                new RecurringGiftModel({ 'designation-name': 'Batman' }),
                new RecurringGiftModel(
                  { 'designation-name': 'Charles Xavier' },
                  { 'donation-status': 'Active' },
                ),
              ];
              $ctrl.$onInit();

              expect($ctrl.updates).toEqual(expect.any(Array));
              expect($ctrl.adds).toEqual(expect.any(Array));
              expect($ctrl.saved).toEqual([]);
              expect($ctrl.updates[0].designationName).toEqual(
                'Charles Xavier',
              );
              expect($ctrl.adds[0].designationName).toEqual('Batman');
            });
          });

          describe('processRestarts()', () => {
            beforeEach(() => {
              jest
                .spyOn($ctrl.donationsService, 'addRecurringGifts')
                .mockImplementation(() => {});
              jest
                .spyOn($ctrl.donationsService, 'updateRecurringGifts')
                .mockImplementation(() => {});
            });

            describe('has additions', () => {
              beforeEach(() => {
                $ctrl.adds = [
                  new RecurringGiftModel({ 'designation-name': 'Batman' }),
                ];
                $ctrl.saved = [];
              });

              describe('addRecurringGifts success', () => {
                it('calls next()', () => {
                  $ctrl.donationsService.addRecurringGifts.mockReturnValue(
                    Observable.of([]),
                  );

                  expect($ctrl.saved.length).toEqual(0);
                  expect($ctrl.adds.length).toEqual(1);
                  $ctrl.processRestarts();

                  expect($ctrl.setLoading).toHaveBeenCalledWith({
                    loading: true,
                  });
                  expect(
                    $ctrl.donationsService.addRecurringGifts,
                  ).toHaveBeenCalled();
                  expect($ctrl.next).toHaveBeenCalled();
                  expect($ctrl.adds).toEqual([]);
                  expect($ctrl.saved.length).toEqual(1);
                });
              });

              describe('addRecurringGifts failure', () => {
                it('sets error state', () => {
                  $ctrl.donationsService.addRecurringGifts.mockReturnValue(
                    Observable.throw(''),
                  );
                  $ctrl.processRestarts();

                  expect($ctrl.setLoading).toHaveBeenCalledWith({
                    loading: true,
                  });
                  expect(
                    $ctrl.donationsService.addRecurringGifts,
                  ).toHaveBeenCalled();
                  expect($ctrl.setLoading).toHaveBeenCalledWith({
                    loading: false,
                  });
                  expect($ctrl.error).toEqual('error');
                  expect($ctrl.$log.error.logs[0]).toEqual([
                    'Error processing restarts.',
                    '',
                  ]);
                });
              });
            });

            describe('has updates', () => {
              beforeEach(() => {
                $ctrl.updates = [
                  new RecurringGiftModel({ 'designation-name': 'Batman' }),
                ];
                $ctrl.saved = [];
              });

              describe('updateRecurringGifts success', () => {
                it('calls next()', () => {
                  $ctrl.donationsService.updateRecurringGifts.mockReturnValue(
                    Observable.of([]),
                  );

                  expect($ctrl.saved.length).toEqual(0);
                  expect($ctrl.updates.length).toEqual(1);
                  $ctrl.processRestarts();

                  expect($ctrl.setLoading).toHaveBeenCalledWith({
                    loading: true,
                  });
                  expect(
                    $ctrl.donationsService.updateRecurringGifts,
                  ).toHaveBeenCalled();
                  expect($ctrl.next).toHaveBeenCalled();
                  expect($ctrl.updates).toEqual([]);
                  expect($ctrl.saved.length).toEqual(1);
                });
              });

              describe('updateRecurringGifts failure', () => {
                it('sets error state', () => {
                  $ctrl.donationsService.updateRecurringGifts.mockReturnValue(
                    Observable.throw(''),
                  );
                  $ctrl.processRestarts();

                  expect($ctrl.setLoading).toHaveBeenCalledWith({
                    loading: true,
                  });
                  expect(
                    $ctrl.donationsService.updateRecurringGifts,
                  ).toHaveBeenCalled();
                  expect($ctrl.setLoading).toHaveBeenCalledWith({
                    loading: false,
                  });
                  expect($ctrl.error).toEqual('error');
                });
              });
            });

            describe('has updates and additions', () => {
              beforeEach(() => {
                $ctrl.adds = [
                  new RecurringGiftModel({ 'designation-name': 'Batman' }),
                ];
                $ctrl.updates = [
                  new RecurringGiftModel({
                    'designation-name': 'Charles Xavier',
                  }),
                ];
                $ctrl.saved = [];
              });

              describe('addRecurringGifts and updateRecurringGifts success', () => {
                it('calls next()', () => {
                  $ctrl.donationsService.addRecurringGifts.mockReturnValue(
                    Observable.of([]),
                  );
                  $ctrl.donationsService.updateRecurringGifts.mockReturnValue(
                    Observable.of([]),
                  );

                  expect($ctrl.saved.length).toEqual(0);
                  expect($ctrl.updates.length).toEqual(1);
                  expect($ctrl.adds.length).toEqual(1);

                  $ctrl.processRestarts();

                  expect($ctrl.setLoading).toHaveBeenCalledWith({
                    loading: true,
                  });
                  expect(
                    $ctrl.donationsService.addRecurringGifts,
                  ).toHaveBeenCalled();
                  expect(
                    $ctrl.donationsService.updateRecurringGifts,
                  ).toHaveBeenCalled();
                  expect($ctrl.next).toHaveBeenCalled();
                  expect($ctrl.adds).toEqual([]);
                  expect($ctrl.updates).toEqual([]);
                  expect($ctrl.saved.length).toEqual(2);
                });
              });

              describe('addRecurringGifts failure and updateRecurringGifts success', () => {
                it('sets error state', () => {
                  $ctrl.donationsService.addRecurringGifts.mockReturnValue(
                    Observable.throw(''),
                  );
                  $ctrl.donationsService.updateRecurringGifts.mockReturnValue(
                    Observable.of([]),
                  );

                  expect($ctrl.saved.length).toEqual(0);
                  expect($ctrl.updates.length).toEqual(1);
                  expect($ctrl.adds.length).toEqual(1);

                  $ctrl.processRestarts();

                  expect($ctrl.setLoading).toHaveBeenCalledWith({
                    loading: true,
                  });
                  expect(
                    $ctrl.donationsService.addRecurringGifts,
                  ).toHaveBeenCalled();
                  expect(
                    $ctrl.donationsService.updateRecurringGifts,
                  ).toHaveBeenCalled();
                  expect($ctrl.adds).toEqual([expect.any(RecurringGiftModel)]);
                  expect($ctrl.updates).toEqual([]);
                  expect($ctrl.saved.length).toEqual(1);
                  expect($ctrl.next).not.toHaveBeenCalled();
                  expect($ctrl.setLoading).toHaveBeenCalledWith({
                    loading: false,
                  });
                  expect($ctrl.error).toEqual('error');
                });
              });

              describe('addRecurringGifts success and updateRecurringGifts failure', () => {
                it('sets error state', () => {
                  $ctrl.donationsService.addRecurringGifts.mockReturnValue(
                    Observable.of([]),
                  );
                  $ctrl.donationsService.updateRecurringGifts.mockReturnValue(
                    Observable.throw([]),
                  );

                  expect($ctrl.saved.length).toEqual(0);
                  expect($ctrl.updates.length).toEqual(1);
                  expect($ctrl.adds.length).toEqual(1);

                  $ctrl.processRestarts();

                  expect($ctrl.setLoading).toHaveBeenCalledWith({
                    loading: true,
                  });
                  expect(
                    $ctrl.donationsService.addRecurringGifts,
                  ).toHaveBeenCalled();
                  expect(
                    $ctrl.donationsService.updateRecurringGifts,
                  ).toHaveBeenCalled();
                  expect($ctrl.updates).toEqual([
                    expect.any(RecurringGiftModel),
                  ]);
                  expect($ctrl.adds).toEqual([]);
                  expect($ctrl.saved.length).toEqual(1);
                  expect($ctrl.next).not.toHaveBeenCalled();
                  expect($ctrl.setLoading).toHaveBeenCalledWith({
                    loading: false,
                  });
                  expect($ctrl.error).toEqual('error');
                });
              });
            });
          });
        });
      });
    });
  });
});
