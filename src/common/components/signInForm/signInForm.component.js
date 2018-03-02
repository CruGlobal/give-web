import angular from 'angular';
import 'angular-gettext';
import includes from 'lodash/includes';

import sessionService from 'common/services/session/session.service';

import template from './signInForm.tpl.html';

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
      .signIn( this.username, this.password, this.lastPurchaseId )
      .subscribe( () => {
        this.onSuccess();
      }, error => {
        this.isSigningIn = false;
        if( error && error.data && error.data.error ) {
          this.errorMessage = error.data.error;
        } else {
          if( error && error.config && error.config.data && error.config.data.password ) {
            delete error.config.data.password;
          }
          this.$log.error('Sign In Error', error);
          this.errorMessage = 'generic';
        }
        this.onFailure();
      } );
  }
}

export default angular
  .module( componentName, [
    sessionService.name,
    'gettext'
  ] )
  .component( componentName, {
    controller:  SignInFormController,
    templateUrl: template,
    bindings:    {
      onSuccess: '&',
      onFailure: '&',
      lastPurchaseId: '<'
    }
  } );
