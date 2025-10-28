import angular from 'angular';
import 'angular-mocks';
import module from './signIn.component';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe('signIn', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl;

  beforeEach(inject(function (_$componentController_) {
    $ctrl = _$componentController_(module.name, {
      $window: { location: '/sign-in.html' },
    });
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  describe("as 'GUEST'", () => {
    beforeEach(() => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue('GUEST');
      jest.spyOn($ctrl, 'sessionChanged');
      $ctrl.$onInit();
    });

    afterEach(() => {
      $ctrl.$onDestroy();
    });

    it('has does not change location', () => {
      expect($ctrl.sessionChanged).toHaveBeenCalled();
      expect($ctrl.$window.location).toEqual('/sign-in.html');
    });
  });

  describe("as 'IDENTIFIED'", () => {
    beforeEach(() => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue('IDENTIFIED');
      jest.spyOn($ctrl, 'sessionChanged');
      $ctrl.$onInit();
    });

    afterEach(() => {
      $ctrl.$onDestroy();
    });

    it('has does not change location', () => {
      expect($ctrl.sessionChanged).toHaveBeenCalled();
      expect($ctrl.$window.location).toEqual('/sign-in.html');
    });
  });

  describe("as 'REGISTERED'", () => {
    beforeEach(() => {
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue('REGISTERED');
      jest.spyOn($ctrl, 'sessionChanged');
      $ctrl.$onInit();
    });

    afterEach(() => {
      $ctrl.$onDestroy();
    });

    it('navigates to checkout', () => {
      expect($ctrl.sessionChanged).toHaveBeenCalled();
      expect($ctrl.$window.location).toEqual('/checkout.html');
    });
  });

  describe('checkoutAsGuest()', () => {
    describe('downgradeToGuest success', () => {
      it('navigates to checkout', () => {
        jest
          .spyOn($ctrl.sessionService, 'downgradeToGuest')
          .mockReturnValue(Observable.of({}));
        $ctrl.checkoutAsGuest();

        expect($ctrl.$window.location).toEqual('/checkout.html');
      });
    });

    describe('downgradeToGuest failure', () => {
      it('navigates to checkout', () => {
        jest
          .spyOn($ctrl.sessionService, 'downgradeToGuest')
          .mockReturnValue(Observable.throw({}));
        $ctrl.checkoutAsGuest();

        expect($ctrl.$window.location).toEqual('/checkout.html');
      });
    });
  });
});
