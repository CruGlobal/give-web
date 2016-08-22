import angular from 'angular';
import 'angular-gettext';
import template from './signUpModal.tpl';

let componentName = 'signUpModal';

class SignUpModalController {

  /* @ngInject */
  constructor( gettext ) {
    this.gettext = gettext;
  }

  $onInit() {
    this.modalTitle = this.gettext( 'Sign Up' );
  }
}

export default angular
  .module( componentName, [
    'gettext',
    template.name
  ] )
  .component( componentName, {
    controller:  SignUpModalController,
    templateUrl: template.name,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&'
    }
  } );
