import angular from 'angular';
import 'angular-messages';
import 'angular-ordinal';
import loading from 'common/components/loading/loading.component';
import showErrors from 'common/filters/showErrors.filter';
import template from './giftPanels.tpl.html';

const componentName = 'giftPanels';

class GiftPanelsController {
  /* @ngInject */
  constructor() {}

  $onInit() {}
}

export default angular
  .module(componentName, [
    'ngMessages',
    'ordinal',
    loading.name,
    showErrors.name,
  ])
  .component(componentName, {
    controller: GiftPanelsController,
    templateUrl: template,
    bindings: {
      useV3: '<',
      productData: '<',
      frequencyOrder: '<',
      changeFrequency: '<',
      changingFrequency: '<',
      itemConfig: '=',
      possibleTransactionMonths: '<',
      nextDrawDate: '<',
      changeStartDay: '<',
      possibleTransactionDays: '<',
      startMonth: '<',
      errorChangingFrequency: '<',
      errorSavingGeneric: '<',
      amountFormatError: '<',
      errorAlreadyInCart: '<',
      errorForcedUserToLogout: '<',
      useSuggestedAmounts: '<',
      suggestedAmounts: '<',
      changeAmount: '<',
      customInputActive: '=',
      suggestedAmount: '<',
      itemConfigForm: '<',
      customAmount: '=',
      changeCustomAmount: '<',
      selectableAmounts: '<',
    },
  });
