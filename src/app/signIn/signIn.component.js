import angular from 'angular';
import signInForm from 'common/components/signInForm/signInForm.component';
import commonModule from 'common/common.module';
import showErrors from 'common/filters/showErrors.filter';
import sessionService from 'common/services/session/session.service';
import analyticsFactory from 'app/analytics/analytics.factory';

import template from './signIn.tpl';

let componentName = 'signIn';

class SignInController {

  /* @ngInject */
  constructor( $window, sessionService, analyticsFactory ) {
    this.$window = $window;
    this.sessionService = sessionService;
    this.analyticsFactory = analyticsFactory;
  }

  $onInit() {
    this.subscription = this.sessionService.sessionSubject.subscribe( () => this.sessionChanged() );
    this.analyticsFactory.pageLoaded();
  }

  $onDestroy() {
    this.subscription.unsubscribe();
  }

  sessionChanged() {
    if ( this.sessionService.getRole() === 'REGISTERED' ) {
      this.$window.location.href = 'checkout.html';
    }
  }
}

export default angular
  .module( componentName, [
    commonModule.name,
    analyticsFactory.name,
    sessionService.name,
    signInForm.name,
    showErrors.name,
    template.name
  ] )
  .component( componentName, {
    controller:  SignInController,
    templateUrl: template.name
  } );
