import angular from 'angular';
import includes from 'lodash/includes';

import commonModule from 'common/common.module';
import sessionService from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';

import template from './homeSignIn.tpl';

let componentName = 'homeSignIn';

class HomeSignInController {

  /* @ngInject */
  constructor($window, sessionService, sessionModalService) {
    this.$window = $window;

    this.sessionService = sessionService;
    this.sessionModalService = sessionModalService;
  }

  $onInit() {
    this.isSigningIn = false;
    this.showSignInForm = !includes( ['IDENTIFIED', 'REGISTERED'], this.sessionService.getRole() );
  }

  signIn() {
    this.isSigningIn = true;
    delete this.errorMessage;

    this.sessionService
      .signIn( this.username, this.password )
      .subscribe( () => {
        this.isSigningIn = false;
        this.showSignInForm = false;
        this.$window.location = '/your-giving.html';
      }, ( error ) => {
        this.isSigningIn = false;
        this.errorMessage = error.data.error;
      } );
  }

  signUp() {
    this.sessionModalService.signUp();
  }

  forgotPassword() {
    this.sessionModalService.forgotPassword();
  }
}

export default angular
  .module( componentName, [
    template.name,
    commonModule.name,
    sessionService.name,
    sessionModalService.name
  ] )
  .component( componentName, {
    controller:  HomeSignInController,
    templateUrl: template.name
  } );
