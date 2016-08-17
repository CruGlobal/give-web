import angular from 'angular';
import 'angular-gettext';
import includes from 'lodash/includes';

import sessionService from 'common/services/session.service';

import template from './signInForm.tpl';

let componentName = 'signInForm';

class SignInFormController {

  /* @ngInject */
  constructor( $log, sessionService ) {
    this.$log = $log;
    this.sessionService = sessionService;
    this.session = sessionService.current;
    this.isSigningIn = false;

    if ( includes( ['IDENTIFIED', 'REGISTERED'], this.session.role ) ) {
      this.username = this.session.cortex.email;
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
        this.errorMessage = error.data.error;
        this.onFailure();
      } );
  }
}

export default angular
  .module( componentName, [
    'gettext',
    template.name,
    sessionService.name
  ] )
  .component( componentName, {
    controller:  SignInFormController,
    templateUrl: template.name,
    transclude:  true,
    bindings:    {
      onSuccess: '&',
      onFailure: '&'
    }
  } );
