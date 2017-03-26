import angular from 'angular';
import 'angular-gettext';

import contactInfoComponent from 'common/components/contactInfo/contactInfo.component';

import sessionService from 'common/services/session/session.service';

import template from './contactInfoModal.tpl.html';

let componentName = 'contactInfoModal';

class contactInfoModalController {

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
    sessionService.name
  ] )
  .component( componentName, {
    controller:  contactInfoModalController,
    templateUrl: template,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&',
      onSuccess:     '&',
      onCancel:      '&'
    }
  } );
