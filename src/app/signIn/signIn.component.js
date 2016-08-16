import angular from 'angular';
import 'angular-gettext';

import signInForm from 'common/components/signInForm/signInForm.component';

import template from './signIn.tpl';

let componentName = 'signIn';

class SignInController {

  /* @ngInject */
  constructor( $log, $location ) {
    this.$log = $log;
    this.$location = $location;
  }

  signInSuccess() {
    this.$location.url( 'checkout.html' );
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
