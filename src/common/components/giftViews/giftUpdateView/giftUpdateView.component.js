import angular from 'angular';
import moment from 'moment';

import showErrors from 'common/filters/showErrors.filter';
import {
  startDate,
  quarterlyMonths,
  possibleTransactionDays,
} from 'common/services/giftHelpers/giftDates.service';

import template from './giftUpdateView.tpl.html';

const componentName = 'giftUpdateView';

class GiftUpdateViewController {
  /* @ngInject */
  constructor() {
    this.startDate = startDate;
    this.quarterlyMonths = quarterlyMonths;
    this.possibleTransactionDays = possibleTransactionDays;
    this.possibleMonths = moment.months();
  }

  $onInit() {}
}

export default angular
  .module(componentName, [showErrors.name])
  .component(componentName, {
    controller: GiftUpdateViewController,
    templateUrl: template,
    bindings: {
      gift: '=',
      singleGift: '@',
    },
  });
