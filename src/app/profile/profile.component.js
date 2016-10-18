import angular from 'angular';

import template from './profile.tpl';

import profileService from 'common/services/api/profile.service';
import sessionEnforcerService, {EnforcerCallbacks, EnforcerModes} from 'common/services/session/sessionEnforcer.service';
import {Roles} from 'common/services/session/session.service';

import orderService from 'common/services/api/order.service';

let componentName = 'profile';

class ProfileController{

  constructor( $window, $location, sessionEnforcerService, profileService, orderService ) {
    this.$window = $window;
    this.$location = $location;
    this.sessionEnforcerService = sessionEnforcerService;
    this.profileService = profileService;
    this.orderService = orderService;
  }

  $onInit() {
    // Enforce donor role view access manage-giving
    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        // Authentication success
        this.loadDonorDetails();
      },
      [EnforcerCallbacks.cancel]: () => {
        // Authentication failure
        this.$window.location = '/';
      }
    }, EnforcerModes.donor);
    this.loadDonorDetails();
  }

  loadDonorDetails(){
    this.orderService.getDonorDetails()
      .subscribe((data) => {
        this.mailingAddress = data.mailingAddress;
      });
  }
}

export default angular
  .module(componentName, [
    template.name,
    profileService.name,
    sessionEnforcerService.name
  ])
  .component(componentName, {
    controller: ProfileController,
    templateUrl: template.name
  });
