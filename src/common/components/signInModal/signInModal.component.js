import angular from 'angular';
import 'angular-gettext';
import includes from 'lodash/includes';
import sessionService from 'common/services/session/session.service';
import template from './signInModal.tpl';

let componentName = 'signInModal';

class SignInModalController {

  /* @ngInject */
  constructor( sessionService ) {
    this.sessionService = sessionService;
    this.session = sessionService.session;
  }

  $onInit() {
    this.modalTitle = 'Sign In';
    if ( includes( ['IDENTIFIED', 'REGISTERED'], this.sessionService.getRole() ) ) {
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
    template.name,
    sessionService.name
  ] )
  .component( componentName, {
    controller:  SignInModalController,
    templateUrl: template.name,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&',
      onSuccess:     '&',
      onFailure:     '&'
    }
  } );
