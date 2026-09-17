import angular from 'angular';
import 'angular-messages';
import giftAmount from 'common/filters/giftAmount.filter';
import showErrors from 'common/filters/showErrors.filter';
import template from './suggestedGiftAmounts.tpl.html';

const componentName = 'suggestedGiftAmounts';

class SuggestedGiftAmountsController {}

export default angular
  .module(componentName, ['ngMessages', giftAmount.name, showErrors.name])
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
      premiumMinimum: '<',
      premiumName: '<',
    },
  });
