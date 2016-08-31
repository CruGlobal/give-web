import angular from 'angular';
import includes from 'lodash/includes';

import commonModule from 'common/common.module';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import sessionService from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';

import template from './homeSignIn.tpl';

let componentName = 'homeSignIn';

class HomeSignInController {

  /* @ngInject */
  constructor(sessionService, sessionModalService) {
    this.sessionService = sessionService;
    this.sessionModalService = sessionModalService;
  }

  $onInit() {
    this.isSigningIn = false;
    this.showSignInForm = true;

    if ( includes( ['IDENTIFIED', 'REGISTERED'], this.sessionService.getRole() ) ) {
      this.showSignInForm = false;
      this.username = this.sessionService.session.email;
    }
  }

  signIn() {
    this.isSigningIn = true;
    delete this.errorMessage;

    this.sessionService
      .signIn( this.username, this.password )
      .subscribe( () => {
        this.isSigningIn = false;
        this.showSignInForm = false;
      }, ( error ) => {
        this.isSigningIn = false;
        this.errorMessage = error.data.error;
      } );
  }

  signUp() {
    this.sessionModalService.signUp();
  }
}

export default angular
  .module( componentName, [
    template.name,
    commonModule.name,
    sessionService.name,
    sessionModalService.name,
    loadingOverlay.name
  ] )
  .component( componentName, {
    controller:  HomeSignInController,
    templateUrl: template.name
  } );
