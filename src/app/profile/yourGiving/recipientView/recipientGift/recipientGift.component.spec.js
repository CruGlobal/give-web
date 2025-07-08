import angular from 'angular';
import 'angular-mocks';
import module from './recipientGift.component';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import RecurringGiftModel from 'common/models/recurringGift.model';

describe('your giving', function () {
  describe('recipient view', () => {
    describe('recipient gift', () => {
      beforeEach(angular.mock.module(module.name));
      let $ctrl;

      beforeEach(inject((_$componentController_) => {
        $ctrl = _$componentController_(
          module.name,
          {},
          {
            recipient: {
              donations: [],
            },
          },
        );
      }));

      it('to be defined', function () {
        expect($ctrl).toBeDefined();
        expect($ctrl.donationsService).toBeDefined();
        expect($ctrl.profileService).toBeDefined();
        expect($ctrl.productModalService).toBeDefined();
        expect($ctrl.showDetails).toEqual(false);
        expect($ctrl.detailsLoaded).toEqual(false);
        expect($ctrl.currentDate).toEqual(expect.any(Date));
      });

      describe('toggleDetails', () => {
        let subject;
        beforeEach(() => {
          subject = new ReplaySubject([]);
          jest
            .spyOn($ctrl.profileService, 'getPaymentMethod')
            .mockImplementation(() => subject);
        });

        it('shows the details section', () => {
          $ctrl.toggleDetails();

          expect($ctrl.isLoading).toEqual(false);
          expect($ctrl.detailsLoaded).toEqual(true);
        });

        it('set payment method on donation', () => {
          $ctrl.profileService.getPaymentMethod.mockReturnValue(
            Observable.of({
              id: 'aaa111',
              self: {
                uri: '/payment/uri',
              },
            }),
          );

          $ctrl.recipient = {
            donations: [
              {
                'payment-instrument-link': {
                  uri: '/payment/uri',
                },
                'historical-donation-line': {
                  'payment-method-id': 'aaa111',
                },
              },
            ],
          };

          $ctrl.toggleDetails();

          expect($ctrl.recipient.donations[0].paymentmethod).toBeDefined();
        });

        it('doesnt load details a second time', () => {
          $ctrl.detailsLoaded = true;
          $ctrl.toggleDetails();

          expect($ctrl.profileService.getPaymentMethod).not.toHaveBeenCalled();
        });

        it('should log and error on failure', () => {
          $ctrl.profileService.getPaymentMethod.mockReturnValue(
            Observable.throw('some error'),
          );
          $ctrl.recipient = {
            donations: [
              {
                'payment-instrument-link': {
                  uri: '/payment/uri',
                },
                'historical-donation-line': {
                  'payment-method-id': 'aaa111',
                },
              },
            ],
          };

          $ctrl.toggleDetails();

          expect($ctrl.showDetails).toEqual(false);
          expect($ctrl.isLoading).toEqual(false);
          expect($ctrl.loadingDetailsError).toEqual(true);
          expect($ctrl.$log.error.logs[0]).toEqual([
            'Error loading recipient details',
            'some error',
          ]);
        });
      });

      describe('giveNewGift()', () => {
        beforeEach(() => {
          jest
            .spyOn($ctrl.productModalService, 'configureProduct')
            .mockImplementation(() => {});
        });

        it('displays productConfig modal', () => {
          $ctrl.recipient = { 'designation-number': '01234567' };
          $ctrl.giveNewGift();

          expect(
            $ctrl.productModalService.configureProduct,
          ).toHaveBeenCalledWith('01234567');
        });
      });

      describe('recurringGift( recurring )', () => {
        it('returns a gift model', () => {
          const gift = $ctrl.recurringGift({
            'donation-lines': [
              { amount: 300, 'designation-name': 'Damien Wilberforce' },
            ],
          });

          expect(gift).toEqual(expect.any(RecurringGiftModel));
        });
      });
    });
  });
});
