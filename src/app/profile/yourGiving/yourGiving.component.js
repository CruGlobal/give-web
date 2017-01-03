import 'babel/external-helpers';
import angular from 'angular';
import 'angular-ui-bootstrap';
import commonModule from 'common/common.module';
import range from 'lodash/range';
import map from 'lodash/map';
import includes from 'lodash/includes';

import displayAddress from 'common/components/display-address/display-address.component';
import recipientView from './recipientView/recipientView.component';
import historicalView from './historicalView/historicalView.component';
import editRecurringGiftsModal from './editRecurringGifts/editRecurringGifts.modal.component';
import giveOneTimeGiftModal from './giveOneTimeGift/giveOneTimeGift.modal.component';
import stopStartRecurringGiftsModal from './stopStartRecurringGifts/stopStartRecurringGifts.modal.component';
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl';
import profileService from 'common/services/api/profile.service';
import sessionEnforcerService, {
  EnforcerCallbacks,
  EnforcerModes
} from 'common/services/session/sessionEnforcer.service';
import sessionService, {Roles, SignOutEvent} from 'common/services/session/session.service';
import template from './yourGiving.tpl';

let componentName = 'yourGiving';

export const queryParams = {
  view: 'view'
};

export const givingViews = ['recipient', 'historical'];

class YourGivingController {

  /* @ngInject */
  constructor( $log, $rootScope, $window, $location, $uibModal, $filter, sessionEnforcerService, profileService, sessionService ) {
    this.$log = $log;
    this.$window = $window;
    this.$location = $location;
    this.$uibModal = $uibModal;
    this.$rootScope = $rootScope;
    this.sessionEnforcerService = sessionEnforcerService;
    this.profileService = profileService;
    this.sessionService = sessionService;
    this.dateFilter = $filter( 'date' );
  }

  $onInit() {
    // Enforce donor role view access manage-giving
    this.enforcerId = this.sessionEnforcerService( [Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        // Authentication success
        this.setGivingView();
        this.loadProfile();
      },
      [EnforcerCallbacks.cancel]: () => {
        // Authentication failure
        this.$window.location = '/';
      }
    }, EnforcerModes.donor );

    this.$rootScope.$on( SignOutEvent, ( event ) => this.signedOut( event ) );

    let year = new Date().getFullYear();
    this.years = range( year, year - 11 );
    this.months = map( range( 0, 12 ), ( value ) => {
      return {
        month: value + 1,
        label: this.dateFilter( new Date( year, value, 3 ), 'MMMM' )
      };
    } );
    this.recipientFilter = 'recent';
    this.historicalFilter = {
      year:  year,
      month: this.months[new Date().getMonth()]
    };

    this.profileLoading = true;
  }

  $onDestroy() {
    // Destroy enforcer
    this.sessionEnforcerService.cancel( this.enforcerId );

    // Remove query params
    angular.forEach( queryParams, ( value ) => {
      this.$location.search( value, null );
    } );
  }

  signedOut( event ) {
    if ( !event.defaultPrevented ) {
      event.preventDefault();
      this.$window.location = '/';
    }
  }

  loadProfile() {
    this.profileLoading = true;
    this.profileLoadingError = false;
    this.profileService.getGivingProfile().subscribe( ( profile ) => {
      this.profile = profile;
      this.currentDate = new Date();
      this.profileLoading = false;
    },
    error => {
      this.$log.error('Error loading givingProfile', error);
      this.profileLoadingError = true;
    });
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

  openEditRecurringGiftsModal() {
    this.recurringGiftsUpdateSuccess = false;
    this.editRecurringGiftsModal = this.$uibModal.open( {
      component:         'editRecurringGiftsModal',
      backdrop:          'static', // Disables closing on click
      windowTemplateUrl: giveModalWindowTemplate.name
    } );
    this.editRecurringGiftsModal.result.then( () => {
      this.recurringGiftsUpdateSuccess = true;
    }, angular.noop );
  }

  openGiveOneTimeGiftModal() {
    this.$uibModal.open({
      component: 'giveOneTimeGiftModal',
      backdrop: 'static', // Disables closing on click
      windowTemplateUrl: giveModalWindowTemplate.name
    });
  }

  openStopStartRecurringGiftsModal() {
    this.stopStartGiftsSuccess = false;
    this.stopStartRecurringGiftsModal = this.$uibModal.open( {
      component:         'stopStartRecurringGiftsModal',
      backdrop:          'static',
      windowTemplateUrl: giveModalWindowTemplate.name
    } );
    this.stopStartRecurringGiftsModal.result.then( () => {
      this.stopStartGiftsSuccess = true;
    }, angular.noop );
  }
}
export default angular
  .module( componentName, [
    commonModule.name,
    displayAddress.name,
    recipientView.name,
    historicalView.name,
    editRecurringGiftsModal.name,
    giveOneTimeGiftModal.name,
    stopStartRecurringGiftsModal.name,
    giveModalWindowTemplate.name,
    profileService.name,
    sessionEnforcerService.name,
    sessionService.name,
    template.name,
    'ui.bootstrap'
  ] )
  .component( componentName, {
    controller:  YourGivingController,
    templateUrl: template.name
  } );
