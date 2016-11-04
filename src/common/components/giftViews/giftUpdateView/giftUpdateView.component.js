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

  onChange(){
    let maxValue = 10000000;
    if(!this.gift.amount) {
      this.gift.amount = 1;
    } else if(this.gift.amount > maxValue) {
      this.gift.amount = maxValue;
    }
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
      gift: '='
    }
  });
