import angular from 'angular';

import template from './profile.tpl';

import profileService from 'common/services/api/profile.service';
import sessionEnforcerService, {EnforcerCallbacks, EnforcerModes} from 'common/services/session/sessionEnforcer.service';
import {Roles} from 'common/services/session/session.service';

let componentName = 'profile';

class ProfileController{

  constructor( $window, $location, sessionEnforcerService, profileService ) {
    this.$window = $window;
    this.$location = $location;
    this.sessionEnforcerService = sessionEnforcerService;
    this.profileService = profileService;
  }

  $onInit() {
    // Enforce donor role view access manage-giving
    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        // Authentication success
      },
      [EnforcerCallbacks.cancel]: () => {
        // Authentication failure
        this.$window.location = '/';
      }
    }, EnforcerModes.donor);
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
