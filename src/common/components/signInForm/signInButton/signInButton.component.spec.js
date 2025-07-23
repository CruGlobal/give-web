import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import module from './signInButton.component';

describe('signInButton', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl, bindings, $rootScope, $timeout;

  beforeEach(inject(function (
    _$rootScope_,
    _$componentController_,
    _$timeout_,
  ) {
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    bindings = {
      onSuccess: jest.fn(),
      onFailure: jest.fn(),
    };

    const scope = { $apply: jest.fn() };
    scope.$apply.mockImplementation(() => {});
    $ctrl = _$componentController_(module.name, { $scope: scope }, bindings);
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  describe('$onInit', () => {
    describe('handle Okta redirect', () => {
      let deferred;
      beforeEach(inject(function (_$q_) {
        $ctrl.errorMessage = undefined;
        deferred = _$q_.defer();
        jest
          .spyOn($ctrl.sessionService, 'handleOktaRedirect')
          .mockImplementation(() => Observable.from(deferred.promise));
        $ctrl.$onInit();
      }));

      it('calls sessionService handleOktaRedirect', () => {
        expect($ctrl.sessionService.handleOktaRedirect).toHaveBeenCalled();
      });

      it('should successfully handle Okta redirect', () => {
        deferred.resolve({});
        $rootScope.$digest();
        expect($ctrl.errorMessage).not.toBeDefined();
      });

      it('should throw an error coming back from Okta', () => {
        const errorMessage = 'generic';
        deferred.reject(errorMessage);
        $rootScope.$digest();
        expect($ctrl.errorMessage).toEqual(errorMessage);
      });
    });
  });

  describe('signInWithOkta', () => {
    let deferred;
    beforeEach(inject(function (_$q_) {
      deferred = _$q_.defer();
      jest
        .spyOn($ctrl.sessionService, 'signIn')
        .mockImplementation(() => Observable.from(deferred.promise));
      $ctrl.signInWithOkta();
    }));

    it('calls sessionService signIn', () => {
      expect($ctrl.isSigningIn).toEqual(true);
      expect($ctrl.sessionService.signIn).toHaveBeenCalledWith(undefined);
    });

    it('signs in successfully', () => {
      deferred.resolve({});
      $rootScope.$digest();

      expect($ctrl.isSigningIn).toEqual(false);
      expect($ctrl.errorMessage).toEqual(undefined);
    });

    it('has unknown error signing in', () => {
      deferred.reject({ data: { error: 'invalid_grant' } });
      $rootScope.$digest();

      expect(bindings.onFailure).toHaveBeenCalled();
      expect($ctrl.errorMessage).toEqual('generic');
      expect($ctrl.isSigningIn).toEqual(false);
    });

    it('has missing error signing in', () => {
      deferred.reject({ data: null });
      $rootScope.$digest();

      expect(bindings.onFailure).toHaveBeenCalled();
      expect($ctrl.errorMessage).toEqual('generic');
      expect($ctrl.isSigningIn).toEqual(false);
    });

    it('removes password from error log', () => {
      deferred.reject({
        config: {
          data: {
            username: 'username',
            password: $ctrl.password,
          },
        },
      });
      $rootScope.$digest();

      expect(bindings.onFailure).toHaveBeenCalled();
      expect($ctrl.$log.error.logs[0]).toEqual([
        'Sign In Error',
        {
          config: {
            data: {
              username: 'username',
            },
          },
        },
      ]);
    });

    it('has Siebel down error signing in', () => {
      deferred.reject({
        data: {
          code: 'SIEB-DOWN',
          message:
            'This functionality is not currently available. Please try again later.',
        },
      });
      $rootScope.$digest();
      expect(bindings.onFailure).toHaveBeenCalled();
      expect($ctrl.errorMessage).toEqual(
        'This functionality is not currently available. Please try again later.',
      );
      expect($ctrl.isSigningIn).toEqual(false);
    });

    describe('watchSigningIn', () => {
      it('should reset isSigningIn after timeout', () => {
        $ctrl.isSigningIn = true;
        $ctrl.watchSigningIn();
        $timeout.flush();
        expect($ctrl.isSigningIn).toEqual(false);
      });
    });
  });
});
