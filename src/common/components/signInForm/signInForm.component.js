import angular from 'angular';
import 'angular-gettext';
import includes from 'lodash/includes';

import sessionService from 'common/services/session/session.service';

import template from './signInForm.tpl';

let componentName = 'signInForm';

class SignInFormController {

  /* @ngInject */
  constructor( sessionService, gettext ) {
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
        this.errorMessage = (angular.isUndefined( error.data ) || error.data === null) ?
          this.gettext( 'An error has occurred signing in. Please try again.' ) :
          error.data.error;
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
