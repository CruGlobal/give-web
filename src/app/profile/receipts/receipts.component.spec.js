import angular from 'angular';
import 'angular-mocks';
import module from './receipts.component';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import { SignOutEvent } from 'common/services/session/session.service';

describe('ReceiptsComponent', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl;

  beforeEach(inject((_$componentController_) => {
    $ctrl = _$componentController_(module.name, {
      $window: { location: '/receipts.html' },
    });
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
    expect($ctrl.$window).toBeDefined();
    expect($ctrl.$location).toBeDefined();
    expect($ctrl.sessionEnforcerService).toBeDefined();
    expect($ctrl.$rootScope).toBeDefined();
  });

  describe('$onInit()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'getReceipts').mockImplementation(() => {});
      jest.spyOn($ctrl, 'sessionEnforcerService').mockImplementation(() => {});
      jest.spyOn($ctrl.$rootScope, '$on').mockImplementation(() => {});
      jest.spyOn($ctrl, 'signedOut').mockImplementation(() => {});
    });

    it('registers signed-out callback', () => {
      $ctrl.$onInit();

      expect($ctrl.$rootScope.$on).toHaveBeenCalledWith(
        SignOutEvent,
        expect.any(Function),
      );
      $ctrl.$rootScope.$on.mock.calls[0][1]();

      expect($ctrl.signedOut).toHaveBeenCalled();
    });

    describe('sessionEnforcerService success', () => {
      it('executes success callback', () => {
        expect($ctrl.getReceipts).not.toHaveBeenCalled();

        $ctrl.$onInit();
        $ctrl.sessionEnforcerService.mock.calls[0][1]['sign-in']();

        expect($ctrl.getReceipts).toHaveBeenCalled();
      });
    });

    describe('sessionEnforcerService failure', () => {
      it('executes failure callback', () => {
        $ctrl.$onInit();
        $ctrl.sessionEnforcerService.mock.calls[0][1]['cancel']();

        expect($ctrl.$window.location).toEqual('/');
      });
    });
  });

  describe('getReceipts()', () => {
    it('should get a list of receipts for current year', () => {
      const receipts = [
        {
          'designation-names': ['Tom', ' John'],
          'total-amount': 25,
          'transaction-date': {
            'display-value': '2015-10-10',
            value: 123,
          },
          'transaction-number': '321',
        },
        {
          'designation-names': ['Tom', ' John'],
          'total-amount': 25,
          'transaction-date': {
            'display-value': '2014-10-10',
            value: 123,
          },
          'transaction-number': '322',
        },
      ];
      jest
        .spyOn($ctrl.donationsService, 'getReceipts')
        .mockReturnValue(Observable.of(receipts));
      $ctrl.$onInit();
      $ctrl.getReceipts();

      expect($ctrl.donationsService.getReceipts).toHaveBeenCalled();
    });

    it('should get a list of receipts for last year', () => {
      const receipts = [];
      jest
        .spyOn($ctrl.donationsService, 'getReceipts')
        .mockReturnValue(Observable.of(receipts));
      $ctrl.$onInit();
      $ctrl.getReceipts('2015', true);

      expect($ctrl.donationsService.getReceipts).toHaveBeenCalledTimes(2);
    });

    it('should fail retrieving receipts', () => {
      jest.spyOn($ctrl.donationsService, 'getReceipts').mockReturnValue(
        Observable.throw({
          data: 'some error',
        }),
      );
      $ctrl.$onInit();
      $ctrl.getReceipts();

      expect($ctrl.donationsService.getReceipts).toHaveBeenCalled();
      expect($ctrl.retrievingError).toBe('Failed retrieving receipts.');
    });
  });

  describe('setYear()', () => {
    it('sets year to display and resets the max shown items value', () => {
      jest.spyOn($ctrl, 'getReceipts').mockImplementation(() => {});
      $ctrl.setYear('2014');

      expect($ctrl.maxShow).toBe(25);
      expect($ctrl.getReceipts).toHaveBeenCalled();
    });
  });

  describe('getListYears()', () => {
    it('sets year to display and resets the max shown items value', () => {
      $ctrl.$onInit();

      expect($ctrl.getListYears().length).toBe(10);
    });
  });

  describe('$onDestroy()', () => {
    it('cleans up the component', () => {
      jest
        .spyOn($ctrl.sessionEnforcerService, 'cancel')
        .mockImplementation(() => {});
      $ctrl.enforcerId = '1234567890';
      $ctrl.$onDestroy();

      expect($ctrl.sessionEnforcerService.cancel).toHaveBeenCalledWith(
        '1234567890',
      );
    });
  });

  describe('signedOut( event )', () => {
    describe('default prevented', () => {
      it('does nothing', () => {
        $ctrl.signedOut({ defaultPrevented: true });

        expect($ctrl.$window.location).toEqual('/receipts.html');
      });
    });

    describe('default not prevented', () => {
      it("navigates to '\/'", () => {
        const spy = jest.fn();
        $ctrl.signedOut({ defaultPrevented: false, preventDefault: spy });

        expect(spy).toHaveBeenCalled();
        expect($ctrl.$window.location).toEqual('/');
      });
    });
  });
});
