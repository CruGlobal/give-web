import angular from 'angular';
import appConfig from 'common/app.config';
import template from './profile.tpl';
import paymentMethodsComponent from './payment-methods/payment-methods.component';
import sessionEnforcerService from 'common/services/session/sessionEnforcer.service';
import {Roles} from 'common/services/session/session.service';

class ProfileController {

  /* @ngInject */
  constructor(sessionEnforcerService, $window, $location) {
    this.sessionEnforcerService = sessionEnforcerService;
    this.$location = $location;
    this.$window = $window;
  }

  $onInit() {
    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      'sign-in': () => {
        let queryParam = this.$location.search().view ? '?view='+this.$location.search().view : '';
        this.$window.location = '/profile.html' + queryParam;
      },
      cancel: () => {
        this.$window.location = 'cart.html';
      }
    });
  }

  $onDestroy() {
    this.sessionEnforcerService.cancel(this.enforcerId);
  }

}

let componentName = 'profile';

export default angular
  .module(componentName, [
    appConfig.name,
    template.name,
    paymentMethodsComponent.name,
    sessionEnforcerService.name
  ])
  .component(componentName, {
    controller: ProfileController,
    templateUrl: template.name
  });
