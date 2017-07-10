import angular from 'angular';
import sessionModalService from 'common/services/session/sessionModal.service';
import sessionService from 'common/services/session/session.service';
import orderService from 'common/services/api/order.service';
import template from './accountBenefits.tpl.html';

import {Roles} from 'common/services/session/session.service';

let componentName = 'accountBenefits';

class AccountBenefitsController {
  /* @ngInject */
  constructor( sessionModalService, sessionService, orderService ) {
    this.sessionModalService = sessionModalService;
    this.sessionService = sessionService;
    this.orderService = orderService;
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
      let lastPurchaseLink = this.orderService.retrieveLastPurchaseLink();
      let lastPurchaseId = lastPurchaseLink ? lastPurchaseLink.split('/').pop() : undefined;
      this.sessionModalService.signIn(lastPurchaseId).then( () => {
        this.sessionModalService.userMatch().then(() => {
          // Hide component after successful user match
          this.isVisible = false;
        }, angular.noop );
      }, angular.noop );
    }
  }
}

export default angular
  .module( componentName, [
    sessionModalService.name,
    sessionService.name,
    orderService.name
  ] )
  .component( componentName, {
    controller:  AccountBenefitsController,
    template: template,
    bindings:    {
      donorDetails: '<'
    }
  } );
