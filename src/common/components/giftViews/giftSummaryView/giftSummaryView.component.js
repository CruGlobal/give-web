import angular from 'angular';
import 'angular-ordinal';

import {quarterlyMonths} from 'common/services/giftHelpers/giftDates.service';

import template from './giftSummaryView.tpl';

let componentName = 'giftSummaryView';

class GiftSummaryViewController {

  /* @ngInject */
  constructor() {
    this.quarterlyMonths = quarterlyMonths;
  }
}

export default angular
  .module( componentName, [
    template.name,
    'ordinal'
  ] )
  .component( componentName, {
    controller:  GiftSummaryViewController,
    templateUrl: template.name,
    bindings:    {
      gift: '<'
    }
  } );
