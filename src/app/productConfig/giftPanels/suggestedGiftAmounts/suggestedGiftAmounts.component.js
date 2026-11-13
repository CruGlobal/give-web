import angular from 'angular';
import 'angular-messages';
import giftAmount from 'common/filters/giftAmount.filter';
import showErrors from 'common/filters/showErrors.filter';
import template from './suggestedGiftAmounts.tpl.html';

const componentName = 'suggestedGiftAmounts';

class SuggestedGiftAmountsController {
  // Uses the amount from before the custom field was focused so the message doesn't flash mid-typing.
  showPremiumMinimumMessage() {
    const amount = parseFloat(this.amountAtFocus ?? this.itemConfig.AMOUNT);
    return Boolean(this.premiumMinimum && amount < this.premiumMinimum);
  }
}

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
