import angular from 'angular';
import displayAddress from 'common/components/display-address/display-address.component';
import givingRecipientView from './givingRecipientView/givingRecipientView.component';
import givingMonthlyView from './givingMonthlyView/givingMonthlyView.component';
import includes from 'lodash/includes';
import loadingComponent from 'common/components/loading/loading.component';
import profileService from 'common/services/api/profile.service';
import sessionEnforcerService from 'common/services/session/sessionEnforcer.service';
import template from './manageGiving.tpl';

import {Roles} from 'common/services/session/session.service';

let componentName = 'manageGiving';

export const queryParams = {
  view: 'view'
};

export const givingViews = ['recipient', 'monthly'];

class ManageGivingController {

  /* @ngInject */
  constructor( $window, $location, sessionEnforcerService, profileService ) {
    this.$window = $window;
    this.$location = $location;
    this.sessionEnforcerService = sessionEnforcerService;
    this.profileService = profileService;
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
    this.loadProfile();
    this.setGivingView();
  }

  $onDestroy() {
    // Destroy enforcer
    this.sessionEnforcerService.cancel( this.enforcerId );

    // Remove query params
    angular.forEach( this.VIEWS, function ( value ) {
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
}
export default angular
  .module( componentName, [
    displayAddress.name,
    givingRecipientView.name,
    givingMonthlyView.name,
    loadingComponent.name,
    profileService.name,
    sessionEnforcerService.name,
    template.name
  ] )
  .component( componentName, {
    controller:  ManageGivingController,
    templateUrl: template.name
  } );
