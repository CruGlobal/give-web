import angular from 'angular';
import 'angular-mocks';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import module from './signInForm.component';

describe('signInForm', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl, bindings;

  beforeEach(inject(function (_$componentController_) {
    bindings = {
      onSuccess: jest.fn(),
      onFailure: jest.fn(),
    };

    const scope = { $applyAsync: jest.fn() };
    $ctrl = _$componentController_(module.name, { $scope: scope }, bindings);
    $ctrl.sessionService.sessionSubject = new BehaviorSubject({});
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  describe('session mismatch warning', () => {
    it('stays hidden while the session has no shadowed cortex-role', () => {
      $ctrl.$onInit();

      expect($ctrl.showSessionMismatchMessage).toBe(false);
    });

    it('shows when the session service reports a shadow it could not heal', () => {
      $ctrl.$onInit();

      $ctrl.sessionService.sessionSubject.next({ cortexRoleShadowed: true });

      expect($ctrl.showSessionMismatchMessage).toBe(true);
      expect($ctrl.$scope.$applyAsync).toHaveBeenCalled();
    });

    it('shows immediately when the session is already shadowed at init', () => {
      $ctrl.sessionService.sessionSubject.next({ cortexRoleShadowed: true });

      $ctrl.$onInit();

      expect($ctrl.showSessionMismatchMessage).toBe(true);
    });

    it('clears once a later session refresh heals the shadow', () => {
      $ctrl.$onInit();
      $ctrl.sessionService.sessionSubject.next({ cortexRoleShadowed: true });

      $ctrl.sessionService.sessionSubject.next({ role: 'REGISTERED' });

      expect($ctrl.showSessionMismatchMessage).toBe(false);
    });

    it('unsubscribes from the session on $onDestroy', () => {
      $ctrl.$onInit();
      const unsubscribeSpy = jest.spyOn(
        $ctrl.sessionSubscription,
        'unsubscribe',
      );

      $ctrl.$onDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
});
