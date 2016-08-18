import angular from 'angular';
import 'angular-gettext';

import signInForm from 'common/components/signInForm/signInForm.component';

import template from './signIn.tpl';

let componentName = 'signIn';

class SignInController {

  /* @ngInject */
  constructor( $window ) {
    this.$window = $window;
  }

  signInSuccess() {
    this.$window.location.href = 'checkout.html';
  }
}

export default angular
  .module( componentName, [
    'gettext',
    template.name,
    signInForm.name
  ] )
  .component( componentName, {
    controller:  SignInController,
    templateUrl: template.name
  } );
