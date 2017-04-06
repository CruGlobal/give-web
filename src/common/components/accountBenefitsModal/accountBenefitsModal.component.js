import angular from 'angular';
import 'angular-gettext';
import sessionService from 'common/services/session/session.service';
import template from './accountBenefitsModal.tpl.html';

import {Roles} from 'common/services/session/session.service';

let componentName = 'accountBenefitsModal';

class AccountBenefitsModalController {

  /* @ngInject */
  constructor( gettext, sessionService ) {
    this.gettext = gettext;
    this.sessionService = sessionService;
  }

  $onInit() {
    this.modalTitle = this.gettext( 'Register Your Account for Online Access' );
  }

  registerAccount() {
    if ( this.sessionService.getRole() === Roles.registered ) {
      // No need to sign in if we already are
      this.onSuccess();
    }
    else {
      this.onStateChange( {state: 'sign-in'} );
    }
  }
}

export default angular
  .module( componentName, [
    'gettext',
    sessionService.name
  ] )
  .component( componentName, {
    controller:  AccountBenefitsModalController,
    templateUrl: template,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&',
      onSuccess:     '&',
      onCancel:     '&'
    }
  } );
