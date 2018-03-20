import angular from 'angular';
import includes from 'lodash/includes';

import sessionService, {SignOutEvent} from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';

import signOutTemplate from './signOut.modal.tpl.html';

import template from './navSignIn.tpl.html';

let componentName = 'navSignIn';

class NavSignInController{

  /* @ngInject */
  constructor($rootScope, $window, $uibModal, $timeout, sessionService, sessionModalService){
    this.$uibModal = $uibModal;
    this.$window = $window;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;

    this.sessionService = sessionService;
    this.sessionModalService = sessionModalService;
  }

  $onInit() {
    this.subscription = this.sessionService.sessionSubject.subscribe( () => this.sessionChanged() );

    // Register signedOut event on child scope
    // this basically sets the listener at a lower priority, allowing $rootScope listeners first chance to respond
    this.$rootScope.$new(true, this.$rootScope).$on(SignOutEvent, (event) => this.signedOut(event) );
  }

  $onDestroy() {
    this.subscription.unsubscribe();
  }

  signIn() {
    this.sessionModalService
      .signIn()
      .then( () => {
        // use $timeout here as workaround to Firefox bug
        this.$timeout(() => this.$window.location.reload());
      }, angular.noop );
  }

  signOut() {
    let modal = this.$uibModal.open({
      templateUrl: signOutTemplate,
      backdrop: 'static',
      keyboard: false,
      size: 'sm'
    });
    this.sessionService.downgradeToGuest().subscribe(() => {
      modal.close();
      this.signedOut( {} );
    }, angular.noop);
  }

  signedOut( event ) {
    if(!event.defaultPrevented) {
      // use $timeout here as workaround to Firefox bug
      this.$timeout(() => this.$window.location.reload());
    }
  }

  sessionChanged() {
    this.isSignedIn = includes(['IDENTIFIED', 'REGISTERED'], this.sessionService.getRole());
  }
}

export default angular
  .module(componentName, [
    sessionService.name,
    sessionModalService.name
  ])
  .component(componentName, {
    controller: NavSignInController,
    templateUrl: template
  });
