import angular from 'angular';
import 'angular-ordinal';

import {quarterlyMonths} from 'common/services/giftHelpers/giftDates.service';

import template from './giftSummaryView.tpl.html';

let componentName = 'giftSummaryView';

class GiftSummaryViewController {

  /* @ngInject */
  constructor() {
    this.quarterlyMonths = quarterlyMonths;
  }
}

export default angular
  .module( componentName, [
    'ordinal'
  ] )
  .component( componentName, {
    controller:  GiftSummaryViewController,
    template: template,
    bindings:    {
      gift: '<'
    }
  } );
