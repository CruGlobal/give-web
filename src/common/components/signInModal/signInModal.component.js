import angular from 'angular';
import 'angular-gettext';
import includes from 'lodash/includes';
import sessionService from 'common/services/session/session.service';
import signInForm from 'common/components/signInForm/signInForm.component';
import template from './signInModal.tpl.html';

import {Roles} from 'common/services/session/session.service';

let componentName = 'signInModal';

class SignInModalController {

  /* @ngInject */
  constructor( gettext, sessionService ) {
    this.gettext = gettext;
    this.sessionService = sessionService;
    this.session = sessionService.session;
  }

  $onInit() {
    this.modalTitle = this.gettext( 'Sign In' );
    if ( includes( [Roles.identified, Roles.registered], this.sessionService.getRole() ) ) {
      this.identified = true;
      this.username = this.session.email;
    }
    else {
      this.identified = false;
    }
  }

  signOut() {
    this.identified = false;
  }
}

export default angular
  .module( componentName, [
    'gettext',
    signInForm.name,
    sessionService.name
  ] )
  .component( componentName, {
    controller:  SignInModalController,
    template: template,
    bindings:    {
      modalTitle:    '=',
      lastPurchaseId: '<',
      onStateChange: '&',
      onSuccess:     '&'
    }
  } );
