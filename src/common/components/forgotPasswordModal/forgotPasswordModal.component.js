import angular from 'angular';
import 'angular-gettext';
import sessionService from 'common/services/session/session.service';
import template from './forgotPasswordModal.tpl';

let componentName = 'forgotPasswordModal';

class ForgotPasswordModalController {

  /* @ngInject */
  constructor( $location, $document, $httpParamSerializer, gettext, sessionService ) {
    this.$location = $location;
    this.$document = $document;
    this.$httpParamSerializer = $httpParamSerializer;
    this.gettext = gettext;
    this.sessionService = sessionService;
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
      }, ( error ) => {
        this.forgotError = true;
        this.isLoading = false;
        switch ( error.data.error ) {
          case 'user_not_found':
          case 'password_cant_change':
            this.errors[error.data.error] = true;
            break;
          default:
            this.errors['unknown'] = true;
        }
      } );
  }

  resetPasswordUrl() {
    // Create in memory <a> to do url manipulation and set it to current location
    let url = this.$document[0].createElement( 'a' );
    url.href = this.$location.absUrl();
    // Add theme=cru to existing query params
    let params = this.$location.search();
    params.theme = 'cru';
    url.search = this.$httpParamSerializer( params );
    // Set url fragment to #reset-pssword
    url.hash = 'reset-password';
    return url.href;
  }

  setPristine() {
    this.errors = {};
    this.forgotError = false;
  }
}

export default angular
  .module( componentName, [
    'gettext',
    template.name,
    sessionService.name
  ] )
  .component( componentName, {
    controller:  ForgotPasswordModalController,
    templateUrl: template.name,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&'
    }
  } );
