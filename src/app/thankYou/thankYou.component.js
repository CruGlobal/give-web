import angular from 'angular';

import commonModule from 'common/common.module';
import thankYouSummary from './summary/thankYouSummary.component';
import accountBenefits from './accountBenefits/accountBenefits.component';
import help from '../checkout/help/help.component';

import template from './thankYou.tpl.html';

const componentName = 'thankYou';

class ThankYouController {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}
}

export default angular
  .module(componentName, [
    commonModule.name,
    thankYouSummary.name,
    accountBenefits.name,
    help.name,
  ])
  .component(componentName, {
    controller: ThankYouController,
    templateUrl: template,
  });
