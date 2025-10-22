import angular from 'angular';
import 'angular-messages';
import showErrors from 'common/filters/showErrors.filter';
import template from './suggestedGiftAmounts.tpl.html';

const componentName = 'suggestedGiftAmounts';

class SuggestedGiftAmountsController {
  /* @ngInject */
  constructor($filter) {
    this.$filter = $filter;
  }

  suggestedAmount(amount) {
    return this.$filter('currency')(
      amount,
      '$',
      `${amount}`.indexOf('.') > -1 ? 2 : 0,
    );
  }
}

export default angular
  .module(componentName, ['ngMessages', showErrors.name])
  .component(componentName, {
    controller: SuggestedGiftAmountsController,
    templateUrl: template,
    bindings: {
      useV3: '<',
      errorChangingFrequency: '<',
      errorSavingGeneric: '<',
      amountFormatError: '<',
      errorAlreadyInCart: '<',
      errorForcedUserToLogout: '<',
      useSuggestedAmounts: '<',
      suggestedAmounts: '<',
      changeAmount: '<',
      customInputActive: '=',
      itemConfig: '=',
      itemConfigForm: '<',
      customAmount: '=',
      changeCustomAmount: '<',
      selectableAmounts: '<',
    },
  });
