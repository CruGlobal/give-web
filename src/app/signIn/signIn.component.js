import angular from 'angular';
import signInForm from 'common/components/signInForm/signInForm.component';
import commonModule from 'common/common.module';

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
    commonModule.name,
    template.name,
    signInForm.name
  ] )
  .component( componentName, {
    controller:  SignInController,
    templateUrl: template.name
  } );
