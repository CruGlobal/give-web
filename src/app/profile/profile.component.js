import angular from 'angular';
import appConfig from 'common/app.config';
import template from './profile.tpl';
import queryString from 'querystring';
import paymentMethodsComponent from './payment-methods/payment-methods.component';
import sessionEnforcerService from 'common/services/session/sessionEnforcer.service';
import {Roles} from 'common/services/session/session.service';

class ProfileController {

  /* @ngInject */
  constructor(sessionEnforcerService, $window) {
    this.sessionEnforcerService = sessionEnforcerService;
    this.$window = $window;
  }

  $onInit() {
    this.queryParams = queryString.parse(location.search);
    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      'sign-in': () => {
        this.$window.location = '/profile.html?view='+this.queryParams['?view'];
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
