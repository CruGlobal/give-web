import angular from 'angular';
import includes from 'lodash/includes';

import commonModule from 'common/common.module';
import sessionService, {Roles} from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';
import analyticsFactory from 'app/analytics/analytics.factory';

import template from './homeSignIn.tpl.html';

let componentName = 'homeSignIn';

class HomeSignInController {

  /* @ngInject */
  constructor($window, sessionService, analyticsFactory, sessionModalService) {
    this.$window = $window;

    this.sessionService = sessionService;
    this.sessionModalService = sessionModalService;
    this.analyticsFactory = analyticsFactory;
  }

  $onInit() {
    this.isSigningIn = false;
    this.showSignInForm = !includes( [Roles.identified, Roles.registered], this.sessionService.getRole() );
    this.analyticsFactory.pageLoaded();
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
    commonModule.name,
    sessionService.name,
    sessionModalService.name,
    analyticsFactory.name
  ] )
  .component( componentName, {
    controller:  HomeSignInController,
    templateUrl: template
  } );
