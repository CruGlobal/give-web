import angular from 'angular';
import 'angular-mocks';
import { advanceTo, clear } from 'jest-date-mock';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import RecurringGiftModel from 'common/models/recurringGift.model';
import { RecurringGiftsType } from 'common/services/api/donations.service';

import module from './restartGift.component';

describe('your giving', () => {
  describe('stopStartRecurringGiftsModal', () => {
    describe('restartGift', () => {
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
            cancel: jest.fn(),
          },
        );
      }));

      it('is defined', () => {
        expect($ctrl).toBeDefined();
        expect($ctrl.donationsService).toBeDefined();
        expect($ctrl.profileService).toBeDefined();
        expect($ctrl.commonService).toBeDefined();
      });

      describe('$onInit', () => {
        beforeEach(() => {
          jest.spyOn($ctrl, 'loadPaymentMethods').mockImplementation(() => {});
        });

        it('initializes the component', () => {
          $ctrl.$onInit();

          expect($ctrl.selectedGifts).toEqual({
            suspended: [],
            suggested: [],
            search: [],
          });

          expect($ctrl.loadPaymentMethods).toHaveBeenCalled();
          expect($ctrl.step).toEqual('loading');
        });
      });

      describe('loadPaymentMethods()', () => {
        beforeEach(() => {
          advanceTo(new Date(2015, 0, 10));
          jest
            .spyOn($ctrl.profileService, 'getPaymentMethods')
            .mockImplementation(() => {});
          jest
            .spyOn($ctrl.commonService, 'getNextDrawDate')
            .mockImplementation(() => {});
          jest
            .spyOn($ctrl, 'loadGiftsAndRecipients')
            .mockImplementation(() => {});
        });

        afterEach(clear);

        describe('valid payment methods and nextDrawDate', () => {
          it('sets payment methods and next start date', () => {
            const paymentMethods = [
              {
                self: {
                  type: 'paymentinstruments.payment-instrument',
                },
                'account-type': 'Checking',
              },
              {
                self: {
                  type: 'paymentinstruments.payment-instrument',
                },
                'expiry-month': '01',
                'expiry-year': '2015',
              },
              {
                self: {
                  type: 'paymentinstruments.payment-instrument',
                },
                'expiry-month': '12',
                'expiry-year': '2014',
              },
            ];
            $ctrl.profileService.getPaymentMethods.mockReturnValue(
              Observable.of(paymentMethods),
            );
            $ctrl.commonService.getNextDrawDate.mockReturnValue(
              Observable.of('2015-02-04'),
            );

            $ctrl.loadPaymentMethods();

            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
            expect($ctrl.profileService.getPaymentMethods).toHaveBeenCalled();
            expect($ctrl.commonService.getNextDrawDate).toHaveBeenCalled();
            expect($ctrl.paymentMethods).toEqual(paymentMethods);
            expect($ctrl.nextDrawDate).toEqual('2015-02-04');
            expect($ctrl.hasPaymentMethods).toEqual(true);
            expect($ctrl.validPaymentMethods).toEqual([
              paymentMethods[0],
              paymentMethods[1],
            ]);
            expect($ctrl.hasValidPaymentMethods).toEqual(true);
            expect($ctrl.loadGiftsAndRecipients).toHaveBeenCalled();
            expect($ctrl.setLoading).not.toHaveBeenCalledWith({
              loading: false,
            });
          });
        });

        describe('no payment methods and nextDrawDate', () => {
          it('sets payment methods and next start date', () => {
            const paymentMethods = [];
            $ctrl.profileService.getPaymentMethods.mockReturnValue(
              Observable.of(paymentMethods),
            );
            $ctrl.commonService.getNextDrawDate.mockReturnValue(
              Observable.of('2015-02-04'),
            );

            $ctrl.loadPaymentMethods();

            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
            expect($ctrl.profileService.getPaymentMethods).toHaveBeenCalled();
            expect($ctrl.commonService.getNextDrawDate).toHaveBeenCalled();
            expect($ctrl.paymentMethods).toEqual(paymentMethods);
            expect($ctrl.nextDrawDate).toEqual('2015-02-04');
            expect($ctrl.hasPaymentMethods).toEqual(false);
            expect($ctrl.validPaymentMethods).toBeUndefined();
          });
        });

        describe('has payment methods but all are invalid', () => {
          it('should offer to update/add payment method', () => {
            const paymentMethods = [
              {
                self: {
                  type: '',
                },
                'expiry-year': '2000',
              },
            ];
            $ctrl.profileService.getPaymentMethods.mockReturnValue(
              Observable.of(paymentMethods),
            );
            $ctrl.commonService.getNextDrawDate.mockReturnValue(
              Observable.of('2015-02-04'),
            );

            $ctrl.loadPaymentMethods();

            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
            expect($ctrl.step).toBe('select-payment-method');
          });
        });

        describe('getPaymentMethods error', () => {
          it('sets error', () => {
            $ctrl.profileService.getPaymentMethods.mockReturnValue(
              Observable.throw('invalid'),
            );
            $ctrl.commonService.getNextDrawDate.mockReturnValue(
              Observable.of('2015-02-04'),
            );

            $ctrl.loadPaymentMethods();

            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
            expect($ctrl.profileService.getPaymentMethods).toHaveBeenCalled();
            expect($ctrl.commonService.getNextDrawDate).toHaveBeenCalled();
            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });
            expect($ctrl.error).toEqual(true);
            expect($ctrl.$log.error.logs[0]).toEqual([
              'Error loading paymentMethods',
              'invalid',
            ]);
          });
        });

        describe('getNextDrawDate error', () => {
          it('sets error', () => {
            $ctrl.profileService.getPaymentMethods.mockReturnValue(
              Observable.of([]),
            );
            $ctrl.commonService.getNextDrawDate.mockReturnValue(
              Observable.throw(''),
            );

            $ctrl.loadPaymentMethods();

            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
            expect($ctrl.profileService.getPaymentMethods).toHaveBeenCalled();
            expect($ctrl.commonService.getNextDrawDate).toHaveBeenCalled();
            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });
            expect($ctrl.error).toEqual(true);
            expect($ctrl.$log.error.logs[0]).toEqual([
              'Error loading paymentMethods',
              '',
            ]);
          });
        });
      });

      describe('loadGiftsAndRecipients()', () => {
        beforeEach(() => {
          jest
            .spyOn($ctrl.donationsService, 'getRecurringGifts')
            .mockImplementation(() => {});
          jest
            .spyOn($ctrl.donationsService, 'getSuggestedRecipients')
            .mockImplementation(() => {});
          jest.spyOn($ctrl, 'next').mockImplementation(() => {});
        });

        describe('getRecurringGifts and getSuggestedRecipients success', () => {
          it('sets suggestedRecipients', () => {
            $ctrl.donationsService.getRecurringGifts.mockReturnValue(
              Observable.of(null),
            );
            $ctrl.donationsService.getSuggestedRecipients.mockReturnValue(
              Observable.of([{ 'designation-name': 'Batman' }]),
            );

            $ctrl.loadGiftsAndRecipients();

            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
            expect(
              $ctrl.donationsService.getRecurringGifts,
            ).toHaveBeenCalledWith(RecurringGiftsType.suspended, true);
            expect(
              $ctrl.donationsService.getSuggestedRecipients,
            ).toHaveBeenCalled();

            expect($ctrl.suspendedGifts).toEqual([]);
            expect($ctrl.includeSuspendedGifts).toEqual(false);
            expect($ctrl.suggestedRecipients).toEqual([
              expect.any(RecurringGiftModel),
            ]);
            expect($ctrl.includeSuggestedRecipients).toEqual(true);
            expect($ctrl.next).toHaveBeenCalled();
          });

          it('sets suspendedGifts', () => {
            $ctrl.donationsService.getRecurringGifts.mockReturnValue(
              Observable.of([
                new RecurringGiftModel({ 'designation-name': 'Batman' }),
              ]),
            );
            $ctrl.donationsService.getSuggestedRecipients.mockReturnValue(
              Observable.of(null),
            );

            $ctrl.loadGiftsAndRecipients();

            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
            expect(
              $ctrl.donationsService.getRecurringGifts,
            ).toHaveBeenCalledWith(RecurringGiftsType.suspended, true);
            expect(
              $ctrl.donationsService.getSuggestedRecipients,
            ).toHaveBeenCalled();

            expect($ctrl.suspendedGifts).toEqual([
              expect.any(RecurringGiftModel),
            ]);
            expect($ctrl.includeSuspendedGifts).toEqual(true);
            expect($ctrl.suggestedRecipients).toEqual([]);
            expect($ctrl.includeSuggestedRecipients).toEqual(false);
            expect($ctrl.next).toHaveBeenCalled();
          });

          it('sets suspendedGifts and suggestedRecipients', () => {
            $ctrl.donationsService.getRecurringGifts.mockReturnValue(
              Observable.of([
                new RecurringGiftModel({ 'designation-name': 'Batman' }),
              ]),
            );
            $ctrl.donationsService.getSuggestedRecipients.mockReturnValue(
              Observable.of([{ 'designation-name': 'Charles Xavier' }]),
            );

            $ctrl.loadGiftsAndRecipients();

            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
            expect(
              $ctrl.donationsService.getRecurringGifts,
            ).toHaveBeenCalledWith(RecurringGiftsType.suspended, true);
            expect(
              $ctrl.donationsService.getSuggestedRecipients,
            ).toHaveBeenCalled();

            expect($ctrl.suspendedGifts).toEqual([
              expect.any(RecurringGiftModel),
            ]);
            expect($ctrl.includeSuspendedGifts).toEqual(true);
            expect($ctrl.suggestedRecipients).toEqual([
              expect.any(RecurringGiftModel),
            ]);
            expect($ctrl.includeSuggestedRecipients).toEqual(true);
            expect($ctrl.next).toHaveBeenCalled();
          });
        });

        describe('getRecurringGifts error', () => {
          it('sets error', () => {
            $ctrl.donationsService.getRecurringGifts.mockReturnValue(
              Observable.throw(''),
            );
            $ctrl.donationsService.getSuggestedRecipients.mockReturnValue(
              Observable.of([{ 'designation-name': 'Charles Xavier' }]),
            );

            $ctrl.loadGiftsAndRecipients();

            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
            expect(
              $ctrl.donationsService.getRecurringGifts,
            ).toHaveBeenCalledWith(RecurringGiftsType.suspended, true);
            expect(
              $ctrl.donationsService.getSuggestedRecipients,
            ).toHaveBeenCalled();

            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });
            expect($ctrl.error).toEqual(true);
            expect($ctrl.next).not.toHaveBeenCalled();
            expect($ctrl.$log.error.logs[0]).toEqual([
              'Error loading gifts and receipts',
              '',
            ]);
          });
        });

        describe('getSuggestedRecipients error', () => {
          it('sets error', () => {
            $ctrl.donationsService.getRecurringGifts.mockReturnValue(
              Observable.of([]),
            );
            $ctrl.donationsService.getSuggestedRecipients.mockReturnValue(
              Observable.throw('some error'),
            );

            $ctrl.loadGiftsAndRecipients();

            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
            expect(
              $ctrl.donationsService.getRecurringGifts,
            ).toHaveBeenCalledWith(RecurringGiftsType.suspended, true);
            expect(
              $ctrl.donationsService.getSuggestedRecipients,
            ).toHaveBeenCalled();

            expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });
            expect($ctrl.error).toEqual(true);
            expect($ctrl.next).not.toHaveBeenCalled();
            expect($ctrl.$log.error.logs[0]).toEqual([
              'Error loading gifts and receipts',
              'some error',
            ]);
          });
        });
      });

      describe('next( selected, configured )', () => {
        beforeEach(() => {
          jest.spyOn($ctrl, 'scrollModalToTop').mockImplementation(() => {});
        });

        afterEach(() => {
          expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });
        });

        it('should scroll to the top of the modal', () => {
          $ctrl.next();

          expect($ctrl.scrollModalToTop).toHaveBeenCalled();
        });

        describe("step = 'loading'", () => {
          beforeEach(() => {
            $ctrl.step = 'loading';
          });

          it("sets step to 'suspended'", () => {
            $ctrl.includeSuspendedGifts = true;
            $ctrl.next();

            expect($ctrl.step).toEqual('suspended');
          });

          it("sets step to 'suggested'", () => {
            $ctrl.includeSuspendedGifts = false;
            $ctrl.includeSuggestedRecipients = true;
            $ctrl.next();

            expect($ctrl.step).toEqual('suggested');
          });

          it("sets step to 'search'", () => {
            $ctrl.includeSuspendedGifts = false;
            $ctrl.includeSuggestedRecipients = false;
            $ctrl.next();

            expect($ctrl.step).toEqual('search');
          });
        });

        describe('step = undefined', () => {
          it("sets step to 'suspended'", () => {
            $ctrl.includeSuspendedGifts = true;
            $ctrl.next();

            expect($ctrl.step).toEqual('suspended');
          });

          it("sets step to 'suggested'", () => {
            $ctrl.includeSuspendedGifts = false;
            $ctrl.includeSuggestedRecipients = true;
            $ctrl.next();

            expect($ctrl.step).toEqual('suggested');
          });

          it("sets step to 'search'", () => {
            $ctrl.includeSuspendedGifts = false;
            $ctrl.includeSuggestedRecipients = false;
            $ctrl.next();

            expect($ctrl.step).toEqual('search');
          });
        });

        describe("step = 'suspended'", () => {
          beforeEach(() => {
            $ctrl.step = 'suspended';
            $ctrl.selectedGifts = {
              suspended: [],
              suggested: [],
              search: [],
            };
            jest.spyOn($ctrl, 'configureGifts').mockImplementation(() => {});
          });

          it("sets step to 'suggested'", () => {
            $ctrl.includeSuggestedRecipients = true;
            $ctrl.next([]);

            expect($ctrl.step).toEqual('suggested');
            expect($ctrl.selectedGifts.suspended).toEqual([]);
            expect($ctrl.configureGifts).not.toHaveBeenCalled();
          });

          it("sets step to 'search'", () => {
            $ctrl.includeSuggestedRecipients = false;
            $ctrl.next();

            expect($ctrl.step).toEqual('search');
            expect($ctrl.configureGifts).not.toHaveBeenCalled();
          });

          it('calls configureGifts()', () => {
            $ctrl.includeSuggestedRecipients = false;
            $ctrl.next(['a']);

            expect($ctrl.selectedGifts.suspended).toEqual(['a']);
            expect($ctrl.configureGifts).toHaveBeenCalled();
          });
        });

        describe("step = 'suggested'", () => {
          beforeEach(() => {
            $ctrl.step = 'suggested';
            $ctrl.selectedGifts = {
              suspended: [],
              suggested: [],
              search: [],
            };
            jest.spyOn($ctrl, 'configureGifts').mockImplementation(() => {});
          });

          it("sets step to 'search'", () => {
            $ctrl.next();

            expect($ctrl.step).toEqual('search');
            expect($ctrl.configureGifts).not.toHaveBeenCalled();
          });

          it('calls configureGifts()', () => {
            $ctrl.next(['a']);

            expect($ctrl.selectedGifts.suggested).toEqual(['a']);
            expect($ctrl.configureGifts).toHaveBeenCalled();
          });
        });

        describe("step = 'search'", () => {
          beforeEach(() => {
            $ctrl.step = 'search';
            $ctrl.selectedGifts = {
              suspended: [],
              suggested: [],
              search: [],
            };
            jest.spyOn($ctrl, 'configureGifts').mockImplementation(() => {});
          });

          describe('selected array', () => {
            it('calls configureGifts()', () => {
              $ctrl.next([
                { designationName: 'Batman', designationNumber: '0123456' },
              ]);

              expect($ctrl.selectedGifts.search).toEqual([
                expect.any(RecurringGiftModel),
              ]);
              expect($ctrl.configureGifts).toHaveBeenCalled();
            });
          });

          describe('selected item', () => {
            it('calls configureGifts()', () => {
              $ctrl.next({
                designationName: 'Batman',
                designationNumber: '0123456',
              });

              expect($ctrl.selectedGifts.search).toEqual([
                expect.any(RecurringGiftModel),
              ]);
              expect($ctrl.configureGifts).toHaveBeenCalled();
            });
          });

          describe('no selected search', () => {
            it('does not call configureGifts()', () => {
              $ctrl.next();

              expect($ctrl.configureGifts).not.toHaveBeenCalled();
            });
          });
        });

        describe("step = 'configure'", () => {
          beforeEach(() => {
            $ctrl.step = 'configure';
          });

          it("sets step to 'confirm'", () => {
            $ctrl.next(null, ['a', 'b']);

            expect($ctrl.gifts).toEqual(['a', 'b']);
            expect($ctrl.step).toEqual('confirm');
          });
        });

        describe("step = 'add-update-payment-method'", () => {
          beforeEach(() => {
            $ctrl.step = 'add-update-payment-method';
          });

          it("sets step to 'suspended'", () => {
            jest
              .spyOn($ctrl, 'loadPaymentMethods')
              .mockImplementation(() => {});
            $ctrl.next();

            expect($ctrl.loadPaymentMethods).toHaveBeenCalled();
            expect($ctrl.step).toEqual('suspended');
          });
        });

        describe("step = 'confirm'", () => {
          beforeEach(() => {
            $ctrl.step = 'confirm';
          });

          it('calls complete()', () => {
            $ctrl.next();

            expect($ctrl.complete).toHaveBeenCalled();
          });
        });
      });

      describe('configureGifts()', () => {
        it("creates gifts and sets 'configure' step", () => {
          $ctrl.selectedGifts = {
            suspended: [
              new RecurringGiftModel({ 'designation-name': 'Batman' }),
            ],
            suggested: [
              new RecurringGiftModel({ 'designation-name': 'Charles Xavier' }),
            ],
            search: [
              new RecurringGiftModel({ 'designation-name': 'Tony Stark' }),
            ],
          };
          $ctrl.configureGifts();

          expect($ctrl.gifts).toEqual(expect.any(Array));
          expect($ctrl.gifts.length).toEqual(3);
          expect($ctrl.step).toEqual('configure');
        });
      });

      describe('previous()', () => {
        beforeEach(() => {
          $ctrl.selectedGifts = {
            suspended: [],
            suggested: [],
            search: [],
          };
          jest.spyOn($ctrl, 'scrollModalToTop').mockImplementation(() => {});
        });

        it('should scroll to the top of the modal', () => {
          $ctrl.previous();

          expect($ctrl.scrollModalToTop).toHaveBeenCalled();
        });

        describe("step = 'confirm'", () => {
          it("sets step to 'configure'", () => {
            $ctrl.step = 'confirm';
            $ctrl.previous();

            expect($ctrl.step).toEqual('configure');
          });
        });

        describe("step = 'suspended'", () => {
          it('calls setState()', () => {
            $ctrl.step = 'suspended';
            $ctrl.previous();

            expect($ctrl.changeState).toHaveBeenCalledWith({ state: 'step-0' });
          });
        });

        describe("step = 'configure'", () => {
          beforeEach(() => {
            $ctrl.step = 'configure';
          });

          it("sets step to 'search'", () => {
            $ctrl.previous();

            expect($ctrl.step).toEqual('search');
          });

          it("sets step to 'suggested'", () => {
            $ctrl.selectedGifts.suggested.push('a');
            $ctrl.includeSuggestedRecipients = true;
            $ctrl.previous();

            expect($ctrl.step).toEqual('suggested');
          });

          it("sets step to 'suspended'", () => {
            $ctrl.selectedGifts.suspended.push('a');
            $ctrl.includeSuggestedRecipients = false;
            $ctrl.includeSuspendedGifts = true;
            $ctrl.previous();

            expect($ctrl.step).toEqual('suspended');
          });

          it('calls setState()', () => {
            $ctrl.selectedGifts.suspended.push('a');
            $ctrl.selectedGifts.suggested.push('a');
            $ctrl.includeSuggestedRecipients = false;
            $ctrl.includeSuspendedGifts = false;
            $ctrl.previous();

            expect($ctrl.changeState).toHaveBeenCalledWith({ state: 'step-0' });
          });
        });

        describe("step = 'search'", () => {
          beforeEach(() => {
            $ctrl.step = 'search';
          });

          it("sets step to 'suggested'", () => {
            $ctrl.includeSuggestedRecipients = true;
            $ctrl.previous();

            expect($ctrl.step).toEqual('suggested');
          });

          it("sets step to 'suspended'", () => {
            $ctrl.includeSuggestedRecipients = false;
            $ctrl.includeSuspendedGifts = true;
            $ctrl.previous();

            expect($ctrl.step).toEqual('suspended');
          });

          it('calls setState()', () => {
            $ctrl.includeSuggestedRecipients = false;
            $ctrl.includeSuspendedGifts = false;
            $ctrl.previous();

            expect($ctrl.changeState).toHaveBeenCalledWith({ state: 'step-0' });
          });
        });

        describe("step = 'suggested'", () => {
          beforeEach(() => {
            $ctrl.step = 'suggested';
          });

          it("sets step to 'suspended'", () => {
            $ctrl.includeSuggestedRecipients = false;
            $ctrl.includeSuspendedGifts = true;
            $ctrl.previous();

            expect($ctrl.step).toEqual('suspended');
          });

          it('calls setState()', () => {
            $ctrl.includeSuggestedRecipients = false;
            $ctrl.includeSuspendedGifts = false;
            $ctrl.previous();

            expect($ctrl.changeState).toHaveBeenCalledWith({ state: 'step-0' });
          });
        });

        describe("step = 'add-update-payment-method'", () => {
          it("sets step to 'add-update-payment-method'", () => {
            $ctrl.step = 'add-update-payment-method';
            $ctrl.previous();

            expect($ctrl.changeState).toHaveBeenCalledWith({ state: 'step-0' });
          });
        });

        describe("step = 'select-payment-method'", () => {
          it("sets step to 'select-payment-method'", () => {
            $ctrl.step = 'select-payment-method';
            $ctrl.next(null, null, 'data');

            expect($ctrl.paymentMethod).toBe('data');
          });
        });
      });
    });
  });
});
