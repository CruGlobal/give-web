import angular from 'angular';
import displayAddress from 'common/components/display-address/display-address.component';
import loadingComponent from 'common/components/loading/loading.component';
import profileService from 'common/services/api/profile.service';
import sessionEnforcerService from 'common/services/session/sessionEnforcer.service';
import template from './manageGiving.tpl';

import {Roles} from 'common/services/session/session.service';

let componentName = 'manageGiving';

class ManageGivingController {

  /* @ngInject */
  constructor( $window, sessionEnforcerService, profileService ) {
    this.$window = $window;
    this.sessionEnforcerService = sessionEnforcerService;
    this.profileService = profileService;
  }

  $onInit() {
    // Enforce 'REGISTERED' role view access manage-giving
    this.enforcerId = this.sessionEnforcerService( [Roles.registered], () => {
      // Re-authentication success
      this.loadProfile();
    }, () => {
      // Re-authentication failure
      this.$window.location = '/cart.html';
    } );
    this.loadProfile();
  }

  $onDestroy() {
    this.sessionEnforcerService.cancel( this.enforcerId );
  }

  loadProfile() {
    this.profileLoading = true;
    this.profileService.getManageGivingProfile().subscribe( ( profile ) => {
      this.profile = profile;
      this.currentDate = new Date();
      this.profileLoading = false;
    } );
  }
}
export default angular
  .module( componentName, [
    displayAddress.name,
    loadingComponent.name,
    profileService.name,
    sessionEnforcerService.name,
    template.name
  ] )
  .component( componentName, {
    controller:  ManageGivingController,
    templateUrl: template.name
  } );
