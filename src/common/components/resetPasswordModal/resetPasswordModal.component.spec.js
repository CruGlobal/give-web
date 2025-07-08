import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import module from './resetPasswordModal.component';
import {
  showVerificationCodeField,
  injectBackButton,
  initializeFloatingLabels,
} from '../../lib/oktaSignInWidgetHelper/oktaSignInWidgetHelper';

jest.mock('../../lib/oktaSignInWidgetHelper/oktaSignInWidgetHelper');
showVerificationCodeField.mockImplementation(() => {});
injectBackButton.mockImplementation(() => {});
initializeFloatingLabels.mockImplementation(() => {});

describe('resetPasswordModal', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl, bindings, $rootScope, $flushPendingTasks;

  beforeEach(inject(function (
    _$rootScope_,
    _$componentController_,
    _$flushPendingTasks_,
  ) {
    $rootScope = _$rootScope_;
    $flushPendingTasks = _$flushPendingTasks_;
    bindings = {
      onSignIn: jest.fn(),
      resetPasswordModal: {
        $valid: false,
        $setSubmitted: jest.fn(),
      },
    };
    $ctrl = _$componentController_(module.name, {}, bindings);
    $flushPendingTasks();

    // Prevent the actual Okta widget from being created in tests
    jest.spyOn($ctrl, 'setUpSignUpWidget').mockImplementation(() => {});

    jest
      .spyOn($ctrl.sessionService, 'signIn')
      .mockReturnValue(Observable.of({}));
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  describe('$onInit()', () => {
    it('should initialize variables and set up Okta Sign Up widget', () => {
      $ctrl.$onInit();

      expect($ctrl.isLoading).toEqual(true);
      expect($ctrl.currentStep).toEqual(1);
      expect($ctrl.floatingLabelAbortControllers).toEqual([]);
      expect($ctrl.setUpSignUpWidget).toHaveBeenCalled();
    });
  });

  describe('$onDestroy()', () => {
    it('should close all subscriptions', () => {
      const remove = jest.fn();
      const off = jest.fn();
      $ctrl.oktaSignInWidget = {
        remove,
        off,
      };

      $ctrl.$onDestroy();
      expect(remove).toHaveBeenCalled();
      expect(off).toHaveBeenCalled();
    });
  });

  describe('afterRender()', () => {
    beforeEach(() => {
      jest
        .spyOn($ctrl, 'triggerNotificationClick')
        .mockImplementation(() => {});
      jest.spyOn($ctrl, 'reRenderWidget').mockImplementation(() => {});
      jest.spyOn($ctrl, 'onSignIn').mockImplementation(() => {});

      $ctrl.$onInit();
    });

    describe('steps', () => {
      afterEach(() => {
        expect(initializeFloatingLabels).toHaveBeenCalled();
      });

      it('sets up step 1', () => {
        $ctrl.currentStep = 0;
        $ctrl.afterRender({ formName: 'identify' });

        expect($ctrl.currentStep).toBe(1);
        expect(injectBackButton).toHaveBeenCalledWith($ctrl);
      });

      it('sets up step 2', () => {
        $ctrl.afterRender({ formName: 'select-authenticator-authenticate' });

        expect($ctrl.currentStep).toBe(2);
      });

      it('sets up step 3', () => {
        $ctrl.afterRender({ formName: 'authenticator-verification-data' });

        expect($ctrl.currentStep).toBe(3);
        expect($ctrl.triggerNotificationClick).toHaveBeenCalled();
      });

      it('sets up step 4 without showing verification code', () => {
        $ctrl.afterRender({
          formName: 'challenge-authenticator',
          authenticatorKey: 'google_otp',
        });

        expect($ctrl.currentStep).toBe(4);
        expect(showVerificationCodeField).not.toHaveBeenCalled();
      });

      it('sets up step 4 with showing verification code', () => {
        $ctrl.afterRender({
          formName: 'challenge-authenticator',
          authenticatorKey: 'okta_email',
        });

        expect($ctrl.currentStep).toBe(4);
        expect(showVerificationCodeField).toHaveBeenCalled();
      });

      it('sets up step 5', () => {
        $ctrl.afterRender({ formName: 'reset-authenticator' });

        expect($ctrl.currentStep).toBe(5);
      });
    });

    it('should re-render the widget', () => {
      $ctrl.afterRender({ formName: 'terminal' });

      expect($ctrl.reRenderWidget).toHaveBeenCalled();
    });
  });

  describe('reRenderWidget()', () => {
    it('should re-render the widget', (done) => {
      const remove = jest.fn();
      const renderEl = jest.fn();
      $ctrl.oktaSignInWidget = {
        remove,
        renderEl,
      };
      jest.spyOn($ctrl.$log, 'error').mockImplementation(() => {});
      $ctrl.reRenderWidget();
      expect(remove).toHaveBeenCalled();
      expect(renderEl).toHaveBeenCalled();

      const error = new Error('Render error');
      renderEl.mockImplementation((_, __, callback) => callback(error));
      $ctrl.reRenderWidget();
      setTimeout(() => {
        expect($ctrl.$log.error).toHaveBeenCalledWith(
          'Okta Forgot Password: Error rendering Okta widget.',
          error,
        );
        done();
      });
    });
  });

  describe('triggerNotificationClick()', () => {
    const handleClick = jest.fn();
    window.handleClick = handleClick;
    beforeEach(() => {
      handleClick.mockClear();
    });

    it('should trigger the email verification code to be sent', () => {
      document.body.innerHTML = `
        <div class="authenticator-verification-data--okta_email">
          <input class="button" type="submit" onclick="handleClick()">
            Send Verification Notification
          </input>
        </div>
      `;
      $ctrl.triggerNotificationClick();
      expect(handleClick).toHaveBeenCalled();
    });

    it('should trigger the sms verification code to be sent', () => {
      document.body.innerHTML = `
        <div class="authenticator-verification-data--phone_number">
          <input class="button" type="submit" onclick="handleClick()">
            Send Verification Notification
          </input>
        </div>
      `;
      $ctrl.triggerNotificationClick();
      expect(handleClick).toHaveBeenCalled();
    });

    it("shouldn't call handleClick if button link is not rendered", () => {
      document.body.innerHTML = `
        <div>Something else</div>
      `;

      $ctrl.triggerNotificationClick();
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('signIn()', () => {
    it('should authenticated and handle login', (done) => {
      jest.spyOn($ctrl.$log, 'error').mockImplementation(() => {});
      const showSignInAndRedirect = jest.fn().mockImplementation(() =>
        Promise.resolve({
          token: 'token',
        }),
      );
      const handleLoginRedirect = jest.fn();
      $ctrl.oktaSignInWidget = {
        showSignInAndRedirect,
        authClient: {
          handleLoginRedirect,
        },
      };

      $ctrl.signIn().then(() => {
        expect(showSignInAndRedirect).toHaveBeenCalledWith({
          el: '#osw-container',
        });
        expect(handleLoginRedirect).toHaveBeenCalledWith({
          token: 'token',
        });
        expect($ctrl.$log.error).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle an error with $log', (done) => {
      const error = new Error('Error signing in');
      jest.spyOn($ctrl.$log, 'error').mockImplementation(() => {});
      const showSignInAndRedirect = jest.fn().mockRejectedValue(error);
      const handleLoginRedirect = jest.fn();
      $ctrl.oktaSignInWidget = {
        showSignInAndRedirect,
        authClient: {
          handleLoginRedirect,
        },
      };

      $ctrl.signIn().then(() => {
        expect(handleLoginRedirect).not.toHaveBeenCalled();
        expect($ctrl.$log.error).toHaveBeenCalledWith(
          'Okta Forgot Password: Error showing Okta sign in widget.',
          error,
        );
        done();
      }, done);
    });
  });
});
