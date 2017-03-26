import angular from 'angular';
import 'angular-gettext';
import modalStateService from 'common/services/modalState.service';
import sessionService from 'common/services/session/session.service';
import template from './forgotPasswordModal.tpl.html';

let componentName = 'forgotPasswordModal';

class ForgotPasswordModalController {

  /* @ngInject */
  constructor( $location, $document, gettext, sessionService, modalStateService ) {
    this.$location = $location;
    this.$document = $document;
    this.gettext = gettext;
    this.sessionService = sessionService;
    this.modalStateService = modalStateService;
  }

  $onInit() {
    this.emailSent = false;
    this.isLoading = false;
    this.setPristine();
    this.modalTitle = this.gettext( 'Reset Password' );
  }

  forgotPassword() {
    this.setPristine();
    this.isLoading = true;
    this.sessionService
      .forgotPassword( this.email, this.resetPasswordUrl() )
      .subscribe( () => {
        this.emailSent = true;
        this.isLoading = false;
      }, error => {
        this.forgotError = true;
        this.isLoading = false;
        switch ( error.data && error.data.error ) {
          case 'user_not_found':
          case 'password_cant_change':
            this.errors[error.data.error] = true;
            break;
          default:
            this.errors.unknown = true;
        }
      } );
  }

  resetPasswordUrl() {
    let params = this.$location.search();
    params.theme = 'cru';
    return this.modalStateService.urlFor( 'reset-password', params );
  }

  setPristine() {
    this.errors = {};
    this.forgotError = false;
  }
}

export default angular
  .module( componentName, [
    'gettext',
    modalStateService.name,
    sessionService.name
  ] )
  .component( componentName, {
    controller:  ForgotPasswordModalController,
    templateUrl: template,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&'
    }
  } );
