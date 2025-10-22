import angular from 'angular';
import 'angular-ordinal';
import {
  possibleTransactionDays,
  possibleTransactionMonths,
  startMonth,
} from 'common/services/giftHelpers/giftDates.service';
import template from './giftDates.tpl.html';

const componentName = 'giftDates';

class GiftDatesController {
  constructor() {
    this.possibleTransactionDays = possibleTransactionDays;
    this.possibleTransactionMonths = possibleTransactionMonths;
    this.startMonth = startMonth;
  }
}

export default angular
  .module(componentName, ['ordinal'])
  .component(componentName, {
    controller: GiftDatesController,
    templateUrl: template,
    bindings: {
      productData: '<',
      itemConfig: '=',
      nextDrawDate: '<',
      changeStartDay: '<',
    },
  });
