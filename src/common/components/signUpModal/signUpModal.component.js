import angular from 'angular';
import 'angular-messages';
import showErrors from 'common/filters/showErrors.filter';
import template from './signUpModal.tpl';
import valueMatch from 'common/directives/valueMatch.directive';

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
    'ngMessages',
    showErrors.name,
    template.name,
    valueMatch.name
  ] )
  .component( componentName, {
    controller:  SignUpModalController,
    templateUrl: template.name,
    bindings:    {
      modalTitle:    '=',
      onStateChange: '&',
      onSuccess:     '&'
    }
  } );
