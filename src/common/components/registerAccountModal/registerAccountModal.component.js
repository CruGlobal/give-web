import angular from 'angular';
import 'angular-gettext';

import contactInfoComponent from 'common/components/contactInfo/contactInfo.component';

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

  onSubmit( success ) {
    if ( success ) {
      this.onSuccess();
    } else {
      this.submitted = false;
    }
  }
}

export default angular
  .module( componentName, [
    'gettext',
    contactInfoComponent.name,
    sessionService.name,
    template.name
  ] )
  .component( componentName, {
    controller:  RegisterAccountModalController,
    templateUrl: template.name,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&',
      onSuccess:     '&',
      onCancel:      '&'
    }
  } );
