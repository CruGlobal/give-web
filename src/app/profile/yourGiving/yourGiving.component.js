import angular from 'angular';
import displayAddress from 'common/components/display-address/display-address.component';
import givingRecipientView from './givingRecipientView/givingRecipientView.component';
import givingMonthlyView from './givingMonthlyView/givingMonthlyView.component';
import includes from 'lodash/includes';
import loadingComponent from 'common/components/loading/loading.component';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import profileService from 'common/services/api/profile.service';
import sessionEnforcerService from 'common/services/session/sessionEnforcer.service';
import sessionService from 'common/services/session/session.service';
import template from './yourGiving.tpl';

import {Roles} from 'common/services/session/session.service';

let componentName = 'yourGiving';

export const queryParams = {
  view: 'view'
};

export const givingViews = ['recipient', 'monthly'];

class YourGivingController {

  /* @ngInject */
  constructor( $window, $location, sessionEnforcerService, profileService, sessionService ) {
    this.$window = $window;
    this.$location = $location;
    this.sessionEnforcerService = sessionEnforcerService;
    this.profileService = profileService;
    this.sessionService = sessionService;
  }

  $onInit() {
    // Enforce 'REGISTERED' role view access manage-giving
    this.enforcerId = this.sessionEnforcerService( [Roles.registered], {
      'sign-in': () => {
        // Re-authentication success
        this.loadProfile();
      }, cancel: () => {
        // Re-authentication failure
        this.$window.location = '/cart.html';
      }
    } );

    this.setGivingView();
    if ( this.sessionService.getRole() == Roles.registered ) {
      // Only load profile when REGISTERED role, otherwise sessionEnforcer will load it when users signs in
      this.loadProfile();
    }
    else {
      this.profileLoading = true;
    }
  }

  $onDestroy() {
    // Destroy enforcer
    this.sessionEnforcerService.cancel( this.enforcerId );

    // Remove query params
    angular.forEach( queryParams, ( value ) => {
      this.$location.search( value, null );
    } );
  }

  loadProfile() {
    this.profileLoading = true;
    this.profileService.getGivingProfile().subscribe( ( profile ) => {
      this.profile = profile;
      this.currentDate = new Date();
      this.profileLoading = false;
    } );
  }

  setGivingView( name ) {
    this.view = angular.isUndefined( name ) ? this.$location.search()[queryParams.view] : name;
    if ( angular.isUndefined( this.view ) || !includes( givingViews, this.view ) ) {
      this.view = givingViews[0];
    }
    this.$location.search( queryParams.view, this.view );
  }

  setViewLoading( loading ) {
    this.viewLoading = loading;
  }
}
export default angular
  .module( componentName, [
    displayAddress.name,
    givingRecipientView.name,
    givingMonthlyView.name,
    loadingComponent.name,
    loadingOverlay.name,
    profileService.name,
    sessionEnforcerService.name,
    sessionService.name,
    template.name
  ] )
  .component( componentName, {
    controller:  YourGivingController,
    templateUrl: template.name
  } );
