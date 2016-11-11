import angular from 'angular';
import signInForm from 'common/components/signInForm/signInForm.component';
import commonModule from 'common/common.module';
import showErrors from 'common/filters/showErrors.filter';
import sessionService, {Roles} from 'common/services/session/session.service';

import template from './signIn.tpl';

let componentName = 'signIn';

class SignInController {

  /* @ngInject */
  constructor( $window, sessionService ) {
    this.$window = $window;
    this.sessionService = sessionService;
  }

  $onInit() {
    this.subscription = this.sessionService.sessionSubject.subscribe( () => this.sessionChanged() );
  }

  $onDestroy() {
    this.subscription.unsubscribe();
  }

  sessionChanged() {
    if ( this.sessionService.getRole() === Roles.registered ) {
      this.$window.location.href = 'checkout.html';
    }
  }

  checkoutAsGuest() {
    this.sessionService.downgradeToGuest().subscribe( {
      error:    () => {
        this.$window.location.href = 'checkout.html';
      },
      complete: () => {
        this.$window.location.href = 'checkout.html';
      }
    } );
  }
}

export default angular
  .module( componentName, [
    commonModule.name,
    sessionService.name,
    signInForm.name,
    showErrors.name,
    template.name
  ] )
  .component( componentName, {
    controller:  SignInController,
    templateUrl: template.name
  } );
