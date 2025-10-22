import angular from 'angular';
import 'angular-messages';
import showErrors from 'common/filters/showErrors.filter';
import template from './suggestedGiftAmounts.tpl.html';

const componentName = 'suggestedGiftAmounts';

class SuggestedGiftAmountsController {}

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
      suggestedAmount: '<',
      itemConfigForm: '<',
      customAmount: '=',
      changeCustomAmount: '<',
      selectableAmounts: '<',
    },
  });
