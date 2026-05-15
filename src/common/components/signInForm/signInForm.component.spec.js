import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import { Roles } from 'common/services/session/session.service';
import module from './signInForm.component';

describe('signInForm', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl, bindings, $timeout;

  beforeEach(inject(function (_$componentController_, _$timeout_) {
    $timeout = _$timeout_;
    bindings = {
      onSuccess: jest.fn(),
      onFailure: jest.fn(),
    };

    const scope = { $applyAsync: jest.fn() };
    scope.$applyAsync.mockImplementation(() => {});
    $ctrl = _$componentController_(module.name, { $scope: scope }, bindings);
    $ctrl.sessionService.sessionSubject = new BehaviorSubject({});
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  describe('session mismatch detection', () => {
    it('shows the mismatch message when Okta is authenticated but Cortex role is PUBLIC', () => {
      jest
        .spyOn($ctrl.sessionService, 'oktaIsUserAuthenticated')
        .mockReturnValue(Observable.of(true));
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.public);

      $ctrl.$onInit();
      $timeout.flush();

      expect($ctrl.showSessionMismatchMessage).toBe(true);
    });

    it('shows the mismatch message when Okta is authenticated but Cortex role is IDENTIFIED', () => {
      jest
        .spyOn($ctrl.sessionService, 'oktaIsUserAuthenticated')
        .mockReturnValue(Observable.of(true));
      jest
        .spyOn($ctrl.sessionService, 'getRole')
        .mockReturnValue(Roles.identified);

      $ctrl.$onInit();
      $timeout.flush();

      expect($ctrl.showSessionMismatchMessage).toBe(true);
    });

    it('does not show the mismatch message when Okta is not authenticated', () => {
      jest
        .spyOn($ctrl.sessionService, 'oktaIsUserAuthenticated')
        .mockReturnValue(Observable.of(false));
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.public);

      $ctrl.$onInit();
      $timeout.flush();

      expect($ctrl.showSessionMismatchMessage).toBe(false);
    });

    it('does not show the mismatch message when the user is already registered', () => {
      jest
        .spyOn($ctrl.sessionService, 'oktaIsUserAuthenticated')
        .mockReturnValue(Observable.of(true));
      jest
        .spyOn($ctrl.sessionService, 'getRole')
        .mockReturnValue(Roles.registered);

      $ctrl.$onInit();
      $timeout.flush();

      expect($ctrl.showSessionMismatchMessage).toBe(false);
    });

    it('clears the mismatch message when the role updates to REGISTERED after the initial check', () => {
      const getRoleSpy = jest
        .spyOn($ctrl.sessionService, 'getRole')
        .mockReturnValue(Roles.public);
      jest
        .spyOn($ctrl.sessionService, 'oktaIsUserAuthenticated')
        .mockReturnValue(Observable.of(true));

      $ctrl.$onInit();
      $timeout.flush();
      expect($ctrl.showSessionMismatchMessage).toBe(true);

      getRoleSpy.mockReturnValue(Roles.registered);
      $ctrl.sessionService.sessionSubject.next({});

      expect($ctrl.showSessionMismatchMessage).toBe(false);
    });

    it('unsubscribes from the session on $onDestroy', () => {
      jest
        .spyOn($ctrl.sessionService, 'oktaIsUserAuthenticated')
        .mockReturnValue(Observable.of(false));
      jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.public);

      $ctrl.$onInit();
      $timeout.flush();
      const unsubscribeSpy = jest.spyOn(
        $ctrl.sessionSubscription,
        'unsubscribe',
      );

      $ctrl.$onDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
});
