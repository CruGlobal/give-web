import angular from 'angular';
import 'angular-ordinal';

import { quarterlyMonths } from 'common/services/giftHelpers/giftDates.service';

import template from './giftSummaryView.tpl.html';

const componentName = 'giftSummaryView';

class GiftSummaryViewController {
  /* @ngInject */
  constructor() {
    this.quarterlyMonths = quarterlyMonths;
  }
}

export default angular
  .module(componentName, ['ordinal'])
  .component(componentName, {
    controller: GiftSummaryViewController,
    templateUrl: template,
    bindings: {
      gift: '<',
    },
  });
