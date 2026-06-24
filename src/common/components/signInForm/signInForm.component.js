import angular from 'angular';
import 'angular-gettext';
import uibTooltip from 'angular-ui-bootstrap/src/tooltip';
import sessionService from 'common/services/session/session.service';
import signInButtonComponent from './signInButton/signInButton.component';
import template from './signInForm.tpl.html';

const componentName = 'signInForm';

class SignInFormController {
  /* @ngInject */
  constructor($scope, gettext, sessionService) {
    this.$scope = $scope;
    this.gettext = gettext;
    this.sessionService = sessionService;
  }

  $onInit() {
    this.onSignInPage = this.onSignInPage || false;
    this.showSessionMismatchMessage = false;
    // The session service self-heals a shadowing parent-domain cortex-role
    // cookie on every session refresh and sets cortexRoleShadowed only when
    // a non-REGISTERED duplicate persists after that attempt — the one case
    // where the user has to clear the cookie manually.
    this.sessionSubscription = this.sessionService.sessionSubject.subscribe(
      (session) => {
        this.showSessionMismatchMessage = !!session.cortexRoleShadowed;
        this.$scope.$applyAsync();
      },
    );
  }

  $onDestroy() {
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
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
