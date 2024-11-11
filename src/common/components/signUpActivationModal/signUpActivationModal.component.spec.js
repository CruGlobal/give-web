import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/of'
import module from './signUpActivationModal.component'
import { Sessions } from 'common/services/session/session.service'
import { cortexRole } from 'common/services/session/fixtures/cortex-role'
import { giveSession } from 'common/services/session/fixtures/give-session'
import { cruProfile } from 'common/services/session/fixtures/cru-profile'
import { createAccountDataCookieName } from 'common/services/session/session.service'

const lastPurchaseId = 'lastPurchaseId'

describe('signUpActivationModal', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings, $rootScope, $cookies, $window

  beforeEach(inject(function (_$rootScope_, _$cookies_, _$componentController_, _$window_) {
    $rootScope = _$rootScope_;
    $cookies = _$cookies_;
    $window = _$window_;
    bindings = {
      onStateChange: jest.fn(),
      onSuccess: jest.fn(),
      onFailure: jest.fn(),
      onCancel: jest.fn(),
      isInsideAnotherModal: false,
      lastPurchaseId,
    }
    const scope = { $apply: jest.fn() }
    scope.$apply.mockImplementation(() => {})
    $ctrl = _$componentController_(module.name, { $scope: scope }, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit() with an authenticated cortex-session', () => {
    beforeEach(() => {
      $cookies.put(Sessions.give, giveSession)
      $cookies.put(Sessions.profile, cruProfile)
      jest.spyOn($ctrl, 'onStateChange')
      $rootScope.$digest()
    })

    afterEach(() => {
      [Sessions.role, Sessions.give, Sessions.profile].forEach((name) => {
        $cookies.remove(name)
      })
      $ctrl.onStateChange.mockClear()
    })

    it('Redirects user to sign in modal', () => {
      $cookies.put(Sessions.role, cortexRole.registered)
      $rootScope.$digest()
      $ctrl.$onInit()

      expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'sign-in' })
    })

    it('Redirects user with identified role to sign in modal', () => {
      $cookies.put(Sessions.role, cortexRole.identified)
      $rootScope.$digest()
      $ctrl.$onInit()

      expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'sign-in' })
    })
  })

  describe('$onInit()', () => {

    beforeEach(() => {
      $cookies.put(Sessions.role, cortexRole.public)
      $rootScope.$digest()
      jest.useFakeTimers();
      jest.spyOn(global, 'setTimeout');
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should call getTotalQuantity set the cartTotal and initializes the variables', () => {
      jest.spyOn($ctrl.cartService, 'getTotalQuantity').mockImplementation(() => Observable.from([4]))
      jest.spyOn($ctrl, 'getUnverifiedAccount').mockImplementation(() => {})
      $ctrl.$onInit()

      expect($ctrl.cartCount).toEqual(4)
      expect($ctrl.loadingAccountErrorCount).toEqual(0)
      expect($ctrl.initialLoading).toEqual(true)
      expect($ctrl.getUnverifiedAccount).toHaveBeenCalledWith(false)
    })

    it('should set cartcount to 0 as getTotalQuantity returns error', () => {
      jest.spyOn($ctrl.cartService, 'getTotalQuantity').mockImplementation(() => Observable.throw('error'))
      jest.spyOn($ctrl, 'getUnverifiedAccount').mockImplementation(() => {})
      $ctrl.$onInit()

      expect($ctrl.cartCount).toEqual(0)
    })

    it('should call getUnverifiedAccount every 10 seconds', () => {
      jest.spyOn($ctrl.cartService, 'getTotalQuantity').mockImplementation(() => Observable.from([4]))
      jest.spyOn($ctrl, 'getUnverifiedAccount').mockImplementation(() => {})
      $ctrl.$onInit()

      expect($ctrl.getUnverifiedAccount).toHaveBeenCalledWith(false)
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 10000);

      jest.advanceTimersByTime(10000);
      expect($ctrl.getUnverifiedAccount).toHaveBeenCalledTimes(2);

      jest.advanceTimersByTime(10000);
      expect($ctrl.getUnverifiedAccount).toHaveBeenCalledTimes(3);

    })

    it('should destroy setInterval getUnverifiedAccount', () => {
      jest.spyOn($ctrl.cartService, 'getTotalQuantity').mockImplementation(() => Observable.from([4]))
      jest.spyOn($ctrl, 'getUnverifiedAccount').mockImplementation(() => {})
      $ctrl.$onInit()

      expect($ctrl.getUnverifiedAccount).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(10000);
      expect($ctrl.getUnverifiedAccount).toHaveBeenCalledTimes(2);

      $ctrl.$onDestroy()

      jest.advanceTimersByTime(20000);
      expect($ctrl.getUnverifiedAccount).toHaveBeenCalledTimes(2);
    })
  })


  describe('getUnverifiedAccount()', () => {
    const createAccountDataCookieData = {
      email: 'email@cruProfile.org',
    }
    describe('errors', () => {
      it('should error as checkCreateAccountStatus cookies cannot be found', () => {
        $ctrl.loadingAccountErrorCount = 0;
        $ctrl.getUnverifiedAccount(true);

        expect($ctrl.loadingAccountError).toEqual('error');
        expect($ctrl.loadingAccountErrorCount).toEqual(1);
        expect($ctrl.loadingAccount).toEqual(false);
      });

      it('should error due to checkCreateAccountStatus response', () => {
        $cookies.put(createAccountDataCookieName, JSON.stringify(createAccountDataCookieData));
        $rootScope.$digest()

        $ctrl.loadingAccountErrorCount = 0;
        $ctrl.loadingAccount = false
        jest.spyOn($ctrl.sessionService, 'checkCreateAccountStatus').mockImplementation(() => Promise.resolve({
          status: 'error',
          data: 'Test Error',
        }))

        $ctrl.getUnverifiedAccount(false).then(() => {
          expect($ctrl.loadingAccountError).toEqual('Test Error');
          expect($ctrl.loadingAccountErrorCount).toEqual(1);
          expect($ctrl.loadingAccount).toEqual(false);
        })
      });
    });

    describe('Succeeds', () => {
      const checkCreateAccountStatusData = {
        status: 'STAGED',
        otherData: 'test Data'
      }

      beforeEach(() => {
        $cookies.put(createAccountDataCookieName, JSON.stringify(createAccountDataCookieData));
        $ctrl.loadingAccountErrorCount = 0;
        $ctrl.loadingAccount = false
        $rootScope.$digest()
      });

      it('should return successfully and set status to "Sending Activation Email"', () => {
        jest.spyOn($ctrl.sessionService, 'checkCreateAccountStatus').mockImplementation(() => Promise.resolve({
          status: 'success',
          data: checkCreateAccountStatusData,
        }))

        $ctrl.getUnverifiedAccount(false).then(() => {
          expect($ctrl.loadingAccountError).toEqual(false);
          expect($ctrl.loadingAccountErrorCount).toEqual(0);
          expect($ctrl.loadingAccount).toEqual(false);

          expect ($ctrl.unverifiedAccount).toEqual({
            ...createAccountDataCookieData,
            ...checkCreateAccountStatusData,
            status: 'Sending Activation Email'
          })
        })
      });

      it('should return successfully and set status to "Pending Verification"', () => {
        checkCreateAccountStatusData.status = 'PROVISIONED'
        jest.spyOn($ctrl.sessionService, 'checkCreateAccountStatus').mockImplementation(() => Promise.resolve({
          status: 'success',
          data: checkCreateAccountStatusData,
        }))

        $ctrl.getUnverifiedAccount(false).then(() => {
          expect($ctrl.loadingAccountError).toEqual(false);
          expect($ctrl.loadingAccountErrorCount).toEqual(0);
          expect($ctrl.loadingAccount).toEqual(false);

          expect ($ctrl.unverifiedAccount).toEqual({
            ...createAccountDataCookieData,
            ...checkCreateAccountStatusData,
            status: 'Pending Verification'
          })
        })
      });

      it('should return successfully and set status to "Active"', () => {
        checkCreateAccountStatusData.status = 'ACTIVE';
        jest.spyOn(global, 'clearInterval');
        jest.spyOn($ctrl.sessionService, 'checkCreateAccountStatus').mockImplementation(() => Promise.resolve({
          status: 'success',
          data: checkCreateAccountStatusData,
        }))

        $ctrl.getUnverifiedAccount(false).then(() => {
          expect($ctrl.loadingAccountError).toEqual(false);
          expect($ctrl.loadingAccountErrorCount).toEqual(0);
          expect($ctrl.loadingAccount).toEqual(false);

          expect ($ctrl.unverifiedAccount).toEqual({
            ...createAccountDataCookieData,
            ...checkCreateAccountStatusData,
            status: 'Active'
          })

          expect(global.clearInterval).toHaveBeenCalled()
        })
      });
    });
  });


  describe('onSuccessfulSignIn', () => {
    it('runs onSuccess()', () => {
      $ctrl.onSuccessfulSignIn()
      expect($ctrl.onSuccess).toHaveBeenCalled()
    })
  })
})
