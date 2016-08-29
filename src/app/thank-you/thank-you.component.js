import 'babel/external-helpers';
import angular from 'angular';

import accountBenefits from './account-benefits/account-benefits.component';
import help from '../checkout/help/help.component';

import template from './thank-you.tpl';

let componentName = 'thankYou';

class ThankYouController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module(componentName, [
    template.name,
    accountBenefits.name,
    help.name
  ])
  .component(componentName, {
    controller: ThankYouController,
    templateUrl: template.name
  });
