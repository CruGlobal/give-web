import angular from 'angular';
import sessionModalService from 'common/services/session/sessionModal.service';
import sessionService from 'common/services/session/session.service';
import template from './accountBenefits.tpl';

import {Roles} from 'common/services/session/session.service';

let componentName = 'accountBenefits';

class AccountBenefitsController {
  /* @ngInject */
  constructor( sessionModalService, sessionService ) {
    this.sessionModalService = sessionModalService;
    this.sessionService = sessionService;
    this.isVisible = false;
  }

  $onChanges( changes ) {
    // donorDetails is undefined initially
    if ( changes.donorDetails && angular.isDefined( changes.donorDetails.currentValue ) ) {
      // Show account benefits if registration state is NEW or MATCHED
      this.isVisible = changes.donorDetails.currentValue['registration-state'] !== 'COMPLETED';
    }
  }

  doUserMatch() {
    if ( this.sessionService.getRole() === Roles.registered ) {
      this.sessionModalService.userMatch();
    }
    else {
      this.sessionModalService.signIn().then( () => {
        this.sessionModalService.userMatch().then(() => {
          // Hide component after successful user match
          this.isVisible = false;
        });
      } );
    }
  }
}

export default angular
  .module( componentName, [
    sessionModalService.name,
    sessionService.name,
    template.name
  ] )
  .component( componentName, {
    controller:  AccountBenefitsController,
    templateUrl: template.name,
    bindings:    {
      donorDetails: '<'
    }
  } );
