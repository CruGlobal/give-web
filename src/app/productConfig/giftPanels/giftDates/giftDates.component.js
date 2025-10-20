import angular from 'angular';
import 'angular-ordinal';
import template from './giftDates.tpl.html';

const componentName = 'giftDates';

class GiftDatesController {}

export default angular
  .module(componentName, ['ordinal'])
  .component(componentName, {
    controller: GiftDatesController,
    templateUrl: template,
    bindings: {
      productData: '<',
      itemConfig: '=',
      possibleTransactionMonths: '<',
      nextDrawDate: '<',
      changeStartDay: '<',
      possibleTransactionDays: '<',
      startMonth: '<',
    },
  });
