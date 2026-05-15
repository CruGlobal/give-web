import angular from 'angular';
import 'angular-gettext';
import uibTooltip from 'angular-ui-bootstrap/src/tooltip';
import sessionService, { Roles } from 'common/services/session/session.service';
import signInButtonComponent from './signInButton/signInButton.component';
import template from './signInForm.tpl.html';

const componentName = 'signInForm';

class SignInFormController {
  /* @ngInject */
  constructor($scope, $timeout, gettext, sessionService) {
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.gettext = gettext;
    this.sessionService = sessionService;
  }

  $onInit() {
    this.onSignInPage = this.onSignInPage || false;
    this.showSessionMismatchMessage = false;
    // Delay the initial check so a normal Okta-redirect flow has time to set
    // the Cortex session cookies before we conclude the user is in a stuck
    // state. After the delay, subscribe to sessionSubject so the warning
    // clears automatically if the role updates later (e.g. the /okta/login
    // POST was just slow).
    this.mismatchCheck = this.$timeout(() => {
      this.sessionSubscription = this.sessionService.sessionSubject.subscribe(
        () => this.evaluateMismatch(),
      );
    }, 2000);
  }

  $onDestroy() {
    if (this.mismatchCheck) {
      this.$timeout.cancel(this.mismatchCheck);
    }
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
  }

  evaluateMismatch() {
    this.sessionService
      .oktaIsUserAuthenticated()
      .subscribe((isAuthenticated) => {
        // Mismatch = Okta says signed in, Cortex says anything other than
        // REGISTERED (PUBLIC, IDENTIFIED, or any future non-REGISTERED state).
        const mismatch =
          isAuthenticated && this.sessionService.getRole() !== Roles.registered;
        if (this.showSessionMismatchMessage !== mismatch) {
          this.showSessionMismatchMessage = mismatch;
          this.$scope.$applyAsync();
        }
      });
  }
}

export default angular
  .module(componentName, [
    signInButtonComponent.name,
    sessionService.name,
    uibTooltip,
    'gettext',
  ])
  .component(componentName, {
    controller: SignInFormController,
    templateUrl: template,
    bindings: {
      onSuccess: '&',
      onFailure: '&',
      onResetPassword: '&',
      lastPurchaseId: '<',
      // Optional if on-sign-in-page is true
      onSignUpWithOkta: '&?',
      onSignInPage: '<',
    },
  });
