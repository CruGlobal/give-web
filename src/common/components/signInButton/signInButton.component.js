import angular from 'angular';
import includes from 'lodash/includes';
import sessionService from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';

import template from './signInButton.tpl';

let componentName = 'signInButton';

class SignInButtonController {

  /* @ngInject */
  constructor( $window, sessionService, sessionModalService ) {
    this.$window = $window;
    this.sessionService = sessionService;
    this.sessionModalService = sessionModalService;
  }

  $onInit() {
    this.subscription = this.sessionService.sessionSubject.subscribe( () => this.sessionChanged() );
  }

  $onDestroy() {
    this.subscription.unsubscribe();
  }

  signIn( reload ) {
    reload = angular.isUndefined( reload ) ? true : reload;
    var signInPromise = this.sessionModalService.signIn();
    if ( reload ) {
      signInPromise.then( () => {
        this.$window.location.reload();
      } );
    }
  }

  signOut( reload ) {
    reload = angular.isUndefined( reload ) ? true : reload;
    var signOutPromise = this.sessionService.signOut();
    if ( reload ) {
      signOutPromise.then( () => {
        this.$window.location.reload();
      } );
    }
  }

  sessionChanged() {
    this.isSignedIn = includes( ['IDENTIFIED', 'REGISTERED'], this.sessionService.getRole() );
  }
}

export default angular
  .module( componentName, [
    template.name,
    sessionService.name,
    sessionModalService.name
  ] )
  .component( componentName, {
    controller:  SignInButtonController,
    templateUrl: template.name,
    bindings:    {
      pageReload: '<'
    }
  } );
