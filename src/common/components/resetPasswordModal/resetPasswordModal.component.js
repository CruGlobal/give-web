import angular from 'angular';
import 'angular-gettext';
import 'angular-messages';
import modalStateService from 'common/services/modalState.service';
import sessionService from 'common/services/session/session.service';
import showErrors from 'common/filters/showErrors.filter';
import template from './resetPasswordModal.tpl.html';
import valueMatch from 'common/directives/valueMatch.directive';

let componentName = 'resetPasswordModal';

class ResetPasswordModalController {

  /* @ngInject */
  constructor( $window, $location, $log, $timeout, gettext, sessionService, modalStateService ) {
    this.$window = $window;
    this.$location = $location;
    this.$log = $log;
    this.$timeout = $timeout;
    this.gettext = gettext;
    this.sessionService = sessionService;
    this.modalState = modalStateService;
  }

  $onInit() {
    let params = this.$location.search();
    this.modalTitle = this.gettext( 'Reset Password' );
    if ( params.hasOwnProperty( 'e' ) ) {
      this.email = params['e'];
    }
    if ( params.hasOwnProperty( 'k' ) ) {
      this.resetKey = params['k'];
    }
    // Change state to forgot-password if we are missing required fields.
    if ( angular.isUndefined( this.email ) || angular.isUndefined( this.resetKey ) ) {
      this.onStateChange( {state: 'forgot-password'} );
    }
    this.isLoading = false;
    this.passwordChanged = false;
    this.setPristine();
  }

  $onDestroy() {
    this.removeQueryParams();
    if(!this.exitWithoutRefresh){
      // use $timeout here as workaround to Firefox bug
      this.$timeout(() => this.$window.location.reload());
    }
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
        this.removeQueryParams();
      }, ( error ) => {
        this.isLoading = false;
        this.hasError = true;
        switch ( error.data.error ) {
          case 'invalid_reset_key':
          case 'password_cant_change':
            this.errors[error.data.error] = true;
            break;
          default:
            this.$log.error('Error resetting password', error);
            this.errors['unknown'] = true;
        }
      } );
  }

  setPristine() {
    this.errors = {};
    this.hasError = false;
  }

  backToSignIn(){
    this.exitWithoutRefresh = true;
    this.onStateChange({state: 'sign-in'});
  }

  removeQueryParams(){
    this.modalState.name( null );
    this.$location.search( 'e', null );
    this.$location.search( 'k', null );
    this.$location.search( 'theme', null );
  }
}

export default angular
  .module( componentName, [
    'gettext',
    'ngMessages',
    showErrors.name,
    sessionService.name,
    modalStateService.name,
    valueMatch.name
  ] )
  .component( componentName, {
    controller:  ResetPasswordModalController,
    templateUrl: template,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&',
      onSuccess: '&'
    }
  } );
