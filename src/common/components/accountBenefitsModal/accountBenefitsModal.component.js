import angular from 'angular';
import 'angular-gettext';
import template from './accountBenefitsModal.tpl';

let componentName = 'accountBenefitsModal';

class AccountBenefitsModalController {

  /* @ngInject */
  constructor( gettext ) {
    this.gettext = gettext;
  }

  $onInit() {
    this.modalTitle = this.gettext( 'Register Your Account for Online Access' );
  }

  registerAccount() {
    this.onStateChange( {state: 'sign-in'} );
  }
}

export default angular
  .module( componentName, [
    'gettext',
    template.name
  ] )
  .component( componentName, {
    controller:  AccountBenefitsModalController,
    templateUrl: template.name,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&',
      onSuccess:     '&'
    }
  } );
