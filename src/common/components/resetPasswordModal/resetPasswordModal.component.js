import angular from 'angular';
import 'angular-gettext';
import 'angular-messages';
import modalStateService from 'common/services/modalState.service';
import sessionService from 'common/services/session/session.service';
import showErrors from 'common/filters/showErrors.filter';
import template from './resetPasswordModal.tpl';
import valueMatch from 'common/directives/valueMatch.directive';

let componentName = 'resetPasswordModal';

class ResetPasswordModalController {

  /* @ngInject */
  constructor( gettext, sessionService, modalStateService ) {
    this.gettext = gettext;
    this.sessionService = sessionService;
    this.modalState = modalStateService;
  }

  $onInit() {
    this.modalTitle = this.gettext( 'Reset Password' );
    if ( this.modalState.params.hasOwnProperty( 'e' ) ) {
      this.email = this.modalState.params['e'];
    }
    if ( this.modalState.params.hasOwnProperty( 'k' ) ) {
      this.resetKey = this.modalState.params['k'];
    }
    // Change state to forgot-password if we are missing required fields.
    if ( angular.isUndefined( this.email ) || angular.isUndefined( this.resetKey ) ) {
      this.onStateChange( {state: 'forgot-password'} );
    }
    this.isLoading = false;
    this.passwordChanged = false;
    this.setPristine();
  }

  resetPassword() {
    if ( !this.form.$valid ) {
      return;
    }

    this.setPristine();
    this.isLoading = true;
    this.sessionService
      .resetPassword( this.email, this.password, this.resetKey )
      .subscribe( () => {
        this.isLoading = false;
        this.passwordChanged = true;
        // Remove modal name and modal params on success
        this.modalState.setName();
        delete this.modalState.params.e;
        delete this.modalState.params.k;
      }, ( error ) => {
        this.isLoading = false;
        this.hasError = true;
        switch ( error.data.error ) {
          case 'invalid_reset_key':
          case 'password_cant_change':
            this.errors[error.data.error] = true;
            break;
          default:
            this.errors['unknown'] = true;
        }
      } );
  }

  setPristine() {
    this.errors = {};
    this.hasError = false;
  }
}

export default angular
  .module( componentName, [
    'gettext',
    'ngMessages',
    template.name,
    showErrors.name,
    sessionService.name,
    modalStateService.name,
    valueMatch.name
  ] )
  .component( componentName, {
    controller:  ResetPasswordModalController,
    templateUrl: template.name,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&'
    }
  } );
