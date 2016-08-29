import angular from 'angular';

import template from './account-benefits.tpl';

let componentName = 'accountBenefits';

class AccountBenefitsController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: AccountBenefitsController,
    templateUrl: template.name
  });
