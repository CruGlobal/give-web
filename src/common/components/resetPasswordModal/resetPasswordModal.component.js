import angular from 'angular';
import 'angular-gettext';
import template from './resetPasswordModal.tpl';

let componentName = 'resetPasswordModal';

class ResetPasswordModalController {

  /* @ngInject */
  constructor( gettext ) {
    this.gettext = gettext;
  }

  $onInit() {
    this.modalTitle = this.gettext( 'Reset Password' );
  }
}

export default angular
  .module( componentName, [
    'gettext',
    template.name,
  ] )
  .component( componentName, {
    controller:  ResetPasswordModalController,
    templateUrl: template.name,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&'
    }
  } );
