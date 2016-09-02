import angular from 'angular';
import 'angular-gettext';
import includes from 'lodash/includes';
import sessionService from 'common/services/session/session.service';
import signInForm from 'common/components/signInForm/signInForm.component';
import template from './signInModal.tpl';

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
    signInForm.name,
    sessionService.name,
    template.name
  ] )
  .component( componentName, {
    controller:  SignInModalController,
    templateUrl: template.name,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&',
      onSuccess:     '&'
    }
  } );
