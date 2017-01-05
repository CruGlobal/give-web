import angular from 'angular';
import 'angular-gettext';
import includes from 'lodash/includes';

import sessionService from 'common/services/session/session.service';

import template from './signInForm.tpl';

let componentName = 'signInForm';

class SignInFormController {

  /* @ngInject */
  constructor( $log, sessionService, gettext ) {
    this.$log = $log;
    this.sessionService = sessionService;
    this.gettext = gettext;
  }

  $onInit() {
    this.isSigningIn = false;

    if ( includes( ['IDENTIFIED', 'REGISTERED'], this.sessionService.getRole() ) ) {
      this.username = this.sessionService.session.email;
    }
  }

  signIn() {
    this.isSigningIn = true;
    delete this.errorMessage;
    this.sessionService
      .signIn( this.username, this.password )
      .subscribe( () => {
        this.onSuccess();
      }, ( error ) => {
        this.isSigningIn = false;
        if( angular.isUndefined( error.data ) || error.data === null ) {
          this.$log.error('Sign In Error', error);
          this.errorMessage = this.gettext( 'An error has occurred signing in. Please try again.' );
        } else {
          this.errorMessage = error.data.error;
        }
        this.onFailure();
      } );
  }
}

export default angular
  .module( componentName, [
    template.name,
    sessionService.name,
    'gettext'
  ] )
  .component( componentName, {
    controller:  SignInFormController,
    templateUrl: template.name,
    bindings:    {
      onSuccess: '&',
      onFailure: '&'
    }
  } );
