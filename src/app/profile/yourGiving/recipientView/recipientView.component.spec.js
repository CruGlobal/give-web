import angular from 'angular';
import 'angular-mocks';
import module from './recipientView.component';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe('your giving', function () {
  describe('recipient view', () => {
    beforeEach(angular.mock.module(module.name));
    let $ctrl;

    beforeEach(inject((_$componentController_) => {
      $ctrl = _$componentController_(
        module.name,
        {},
        {
          filter: 'recent',
          setLoading: jest.fn(),
        },
      );
    }));

    it('to be defined', function () {
      expect($ctrl).toBeDefined();
      expect($ctrl.donationsService).toBeDefined();
    });

    describe('$onChanges( changes )', () => {
      beforeEach(() => {
        jest.spyOn($ctrl, 'loadRecipients').mockImplementation(() => {});
      });

      it("loads recipients based on filter='recent'", () => {
        $ctrl.filter = 'recent';
        $ctrl.$onChanges({ filter: { currentValue: 'recent' } });

        expect($ctrl.loadRecipients).toHaveBeenCalledWith(undefined);
      });

      it('loads recipients based on filter=2016', () => {
        $ctrl.filter = 2017;
        $ctrl.$onChanges({ filter: { currentValue: 2017 } });

        expect($ctrl.loadRecipients).toHaveBeenCalledWith(2017);
      });

      it('should reload recipients when reload is changed to true', () => {
        $ctrl.filter = 2016;
        $ctrl.$onChanges({ reload: { currentValue: true } });

        expect($ctrl.loadRecipients).toHaveBeenCalledWith(2016);
      });

      it('should not reload recipients when reload is changed to false', () => {
        $ctrl.$onChanges({ reload: { currentValue: false } });

        expect($ctrl.loadRecipients).not.toHaveBeenCalled();
      });

      it('should not reload recipients when there are no changes', () => {
        $ctrl.$onChanges({});

        expect($ctrl.loadRecipients).not.toHaveBeenCalled();
      });
    });

    describe('loadRecipients(year)', () => {
      let subscriberSpy;
      beforeEach(() => {
        subscriberSpy = { unsubscribe: jest.fn() };
        jest
          .spyOn($ctrl.donationsService, 'getRecipients')
          .mockImplementation(() => {});
      });

      it('loads recent recipients', () => {
        $ctrl.donationsService.getRecipients.mockImplementation(() =>
          Observable.of([]),
        );
        $ctrl.subscriber = subscriberSpy;
        $ctrl.loadRecipients();

        expect($ctrl.loadingRecipientsError).toEqual(false);
        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
        expect(subscriberSpy.unsubscribe).toHaveBeenCalled();
        expect($ctrl.donationsService.getRecipients).toHaveBeenCalledWith(
          undefined,
        );
        expect($ctrl.recipients).toEqual([]);
        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });

        $ctrl.donationsService.getRecipients.mockReturnValue(
          Observable.of([{ 'recurring-donations-link': '/aaa111' }]),
        );
        jest
          .spyOn($ctrl.donationsService, 'getRecipientsRecurringGifts')
          .mockReturnValue(Observable.of([{ id: 'donation1' }]));
        $ctrl.loadRecipients();

        expect($ctrl.recipients[0]['recurring-donations'][0].id).toEqual(
          'donation1',
        );
      });

      it('loads recipients by year', () => {
        $ctrl.donationsService.getRecipients.mockImplementation(() =>
          Observable.of([]),
        );
        $ctrl.loadRecipients(2016);

        expect($ctrl.loadingRecipientsError).toEqual(false);
        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
        expect(subscriberSpy.unsubscribe).not.toHaveBeenCalled();
        expect($ctrl.donationsService.getRecipients).toHaveBeenCalledWith(2016);
        expect($ctrl.recipients).toEqual([]);
        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });
      });

      it('sets loading false on error ', () => {
        $ctrl.donationsService.getRecipients.mockImplementation(() =>
          Observable.throw('error'),
        );
        $ctrl.loadRecipients(2016);

        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true });
        expect($ctrl.recipients).not.toBeDefined();
        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false });
        expect($ctrl.loadingRecipientsError).toEqual(true);
        expect($ctrl.$log.error.logs[0]).toEqual([
          'Error loading recipients',
          'error',
        ]);
      });
    });
  });
});
