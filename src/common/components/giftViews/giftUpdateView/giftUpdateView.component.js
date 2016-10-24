import angular from 'angular';
import moment from 'moment';

import {startDate, quarterlyMonths, possibleTransactionDays} from 'common/services/giftHelpers/giftDates.service';

import template from './giftUpdateView.tpl';

let componentName = 'giftUpdateView';

class GiftUpdateViewController {

  /* @ngInject */
  constructor() {
    this.startDate = startDate;
    this.quarterlyMonths = quarterlyMonths;
    this.possibleTransactionDays = possibleTransactionDays;
    this.possibleMonths = moment.months();
  }

  $onInit(){

  }
}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: GiftUpdateViewController,
    templateUrl: template.name,
    bindings: {
      gift: '=',
      paymentMethods: '<',
      nextDrawDate: '<'
    }
  });
