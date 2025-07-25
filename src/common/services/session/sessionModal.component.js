import angular from 'angular';

import signUpModal from 'common/components/signUpModal/signUpModal.component';
import userMatchModal from 'common/components/userMatchModal/userMatchModal.component';
import contactInfoModal from 'common/components/contactInfoModal/contactInfoModal.component';
import accountBenefitsModal from 'common/components/accountBenefitsModal/accountBenefitsModal.component';
import registerAccountModal from 'common/components/registerAccountModal/registerAccountModal.component';
import analyticsFactory from 'app/analytics/analytics.factory';

import { scrollModalToTop } from 'common/services/modalState.service';

import template from './sessionModal.tpl.html';

const componentName = 'sessionModal';

class SessionModalController {
  /* @ngInject */
  constructor(sessionService, analyticsFactory) {
    this.sessionService = sessionService;
    this.analyticsFactory = analyticsFactory;
    this.isLoading = false;
    this.scrollModalToTop = scrollModalToTop;
  }

  $onInit() {
    this.stateChanged(this.resolve.state);
    this.hideCloseButton = this.resolve.hideCloseButton;
    this.lastPurchaseId = this.resolve.lastPurchaseId;
    this.registerAccountSignUp = this.resolve.registerAccountSignUp;
  }

  stateChanged(state) {
    this.state = state;
    this.scrollModalToTop();
  }

  onSignIn() {
    this.stateChanged('register-account');
  }

  onSignUpSuccess() {
    this.analyticsFactory.track('ga-sign-in-create-login');
    this.sessionService.removeOktaRedirectIndicator();
    this.close();
  }

  onAccountBenefitsRegister() {
    this.sessionService.removeOktaRedirectIndicator();
    this.registerAccountSignUp = true;
    this.stateChanged('register-account');
  }

  onAccountBenefitsSuccess() {
    this.sessionService.removeOktaRedirectIndicator();
    this.stateChanged('register-account');
  }

  onFailure() {
    this.sessionService.removeOktaRedirectIndicator();
    this.dismiss({ $value: 'error' });
  }

  onCancel() {
    this.sessionService.removeOktaRedirectIndicator();
    this.dismiss({ $value: 'cancel' });
  }

  setLoading(loading) {
    this.isLoading = !!loading;
  }
}

export default angular
  .module(componentName, [
    signUpModal.name,
    userMatchModal.name,
    contactInfoModal.name,
    accountBenefitsModal.name,
    registerAccountModal.name,
    analyticsFactory.name,
  ])
  .component(componentName, {
    controller: SessionModalController,
    templateUrl: template,
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&',
    },
  });
