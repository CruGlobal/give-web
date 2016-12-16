import angular from 'angular';

import signInModal from 'common/components/signInModal/signInModal.component';
import signUpModal from 'common/components/signUpModal/signUpModal.component';
import resetPasswordModal from 'common/components/resetPasswordModal/resetPasswordModal.component';
import forgotPasswordModal from 'common/components/forgotPasswordModal/forgotPasswordModal.component';
import userMatchModal from 'common/components/userMatchModal/userMatchModal.component';
import contactInfoModal from 'common/components/contactInfoModal/contactInfoModal.component';
import accountBenefitsModal from 'common/components/accountBenefitsModal/accountBenefitsModal.component';
import registerAccountModal from 'common/components/registerAccountModal/registerAccountModal.component';

import {scrollModalToTop} from 'common/services/modalState.service';

let controllerName = 'sessionModalController';

class SessionModalController {

  /* @ngInject */
  constructor( $uibModalInstance, sessionService, state ) {
    this.$uibModalInstance = $uibModalInstance;
    this.sessionService = sessionService;
    this.isLoading = false;
    this.scrollModalToTop = scrollModalToTop;
    this.stateChanged( state );
  }

  stateChanged( state ) {
    this.state = state;
    this.scrollModalToTop();
  }

  onSignInSuccess() {
    this.$uibModalInstance.close();
  }

  onSignUpSuccess() {
    this.$uibModalInstance.close();
  }

  onFailure() {
    this.$uibModalInstance.dismiss( 'error' );
  }

  onCancel() {
    this.$uibModalInstance.dismiss( 'cancel' );
  }

  setLoading( loading ) {
    this.isLoading = !!loading;
  }
}

export default angular
  .module( controllerName, [
    signInModal.name,
    signUpModal.name,
    resetPasswordModal.name,
    forgotPasswordModal.name,
    userMatchModal.name,
    contactInfoModal.name,
    accountBenefitsModal.name,
    registerAccountModal.name
  ] )
  .controller( controllerName, SessionModalController );
