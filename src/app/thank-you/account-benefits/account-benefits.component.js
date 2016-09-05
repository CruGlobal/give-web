import angular from 'angular';

import sessionModalService from 'common/services/session/sessionModal.service';

import template from './account-benefits.tpl';

let componentName = 'accountBenefits';

class AccountBenefitsController{

  /* @ngInject */
  constructor(sessionModalService){
    this.sessionModalService = sessionModalService;
  }

}

export default angular
  .module(componentName, [
    template.name,
    sessionModalService.name
  ])
  .component(componentName, {
    controller: AccountBenefitsController,
    templateUrl: template.name
  });
