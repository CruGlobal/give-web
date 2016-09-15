import angular from 'angular';
import 'angular-gettext';
import includes from 'lodash/includes';
import sessionService from 'common/services/session/session.service';
import template from './registerAccountModal.tpl';

let componentName = 'registerAccountModal';

class RegisterAccountModalController {

  /* @ngInject */
  constructor( gettext, sessionService ) {
    this.gettext = gettext;
    this.sessionService = sessionService;
  }

  $onInit() {
    this.modalTitle = this.gettext( 'Your Contact Information' );
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
    controller:  RegisterAccountModalController,
    templateUrl: template.name,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&',
      onSuccess:     '&'
    }
  } );
