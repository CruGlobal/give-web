import angular from 'angular';
import sessionModalService from 'common/services/session/sessionModal.service';
import verificationService from 'common/services/api/verification.service';
import template from './accountBenefits.tpl';

let componentName = 'accountBenefits';

class AccountBenefitsController {
  /* @ngInject */
  constructor( $log, sessionModalService ) {
    this.$log = $log;
    this.sessionModalService = sessionModalService;
  }

  $onChanges( changesObj ) {
    console.log( changesObj );
  }
}

export default angular
  .module( componentName, [
    sessionModalService.name,
    template.name,
    verificationService.name
  ] )
  .component( componentName, {
    controller:  AccountBenefitsController,
    templateUrl: template.name,
    bindings:    {
      purchase: '<'
    }
  } );
