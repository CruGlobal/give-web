import angular from 'angular';

import signInModal from 'common/components/signInModal/signInModal.component';
import signUpModal from 'common/components/signUpModal/signUpModal.component';
import resetPasswordModal from 'common/components/resetPasswordModal/resetPasswordModal.component';

let controllerName = 'sessionModalController';

class SessionModalController {

  /* @ngInject */
  constructor( $uibModalInstance, sessionService, state ) {
    this.$uibModalInstance = $uibModalInstance;
    this.sessionService = sessionService;
    this.stateChanged( state );
  }

  stateChanged( state ) {
    this.state = state;
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
}

export default angular
  .module( controllerName, [
    signInModal.name,
    signUpModal.name,
    resetPasswordModal.name
  ] )
  .controller( controllerName, SessionModalController );
