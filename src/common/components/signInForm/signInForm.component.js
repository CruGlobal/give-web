import angular from 'angular';
import includes from 'lodash/includes';

import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import sessionService from 'common/services/session/session.service';

import template from './signInForm.tpl';

let componentName = 'signInForm';

class SignInFormController {

  /* @ngInject */
  constructor( $log, sessionService ) {
    this.$log = $log;
    this.sessionService = sessionService;
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
        this.errorMessage = error.data.error;
        this.onFailure();
      } );
  }
}

export default angular
  .module( componentName, [
    template.name,
    sessionService.name,
    loadingOverlay.name
  ] )
  .component( componentName, {
    controller:  SignInFormController,
    templateUrl: template.name,
    bindings:    {
      onSuccess: '&',
      onFailure: '&'
    }
  } );
