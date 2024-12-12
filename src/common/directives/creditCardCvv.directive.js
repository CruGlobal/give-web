import angular from 'angular'

import './creditCardCvv.directive.scss'
const directiveName = 'creditCardCvv'

const template =
`<div class="credit-card-cvv-container form-group" ng-class="{'has-error': ($ctrl.creditCardPaymentForm.securityCode | showErrors), 'is-required': !$ctrl.paymentMethod}">
  <span class="credit-card-cvv-label" translate>{{'SEC_CODE'}}</span>
  <div>
    <input type="text" 
      name="securityCode"
      autocomplete="cc-csc"
      class="form-control form-control-subtle"
      ng-model="$ctrl.creditCardPayment.securityCode"
      ng-required="!$ctrl.paymentMethod || $ctrl.creditCardPayment.cardNumber"
      ng-attr-placeholder="{{$ctrl.paymentMethod && !$ctrl.creditCardPayment.cardNumber ? '***' : ''}}">
    <div role="alert" ng-messages="$ctrl.creditCardPaymentForm.securityCode.$error" ng-if="($ctrl.creditCardPaymentForm.securityCode | showErrors)">
      <div class="credit-card-cvv-help-block help-block" ng-message="required" translate>{{'CARD_SEC_CODE_ERROR'}}</div>
      <div class="credit-card-cvv-help-block help-block" ng-message="minLength" translate>{{'MIN_LENGTH_CARD_SEC_CODE'}}</div>
      <div class="credit-card-cvv-help-block help-block" ng-message="maxLength" translate>{{'MAX_LENGTH_CARD_SEC_CODE'}}</div>
      <div class="credit-card-cvv-help-block help-block" ng-message="cardTypeLength" ng-init="isAmex = $ctrl.cardInfo.type($ctrl.creditCardPayment.cardNumber) === 'American Express'">
      <translate ng-if="!isAmex">{{'LOCATION_OF_CODE_OTHER'}}</translate>
      <translate ng-if="isAmex">{{'LOCATION_OF_CODE_AMEX'}}</translate>
      </div>
    </div>
  </div>
</div>`

const creditCardCvv = /* @ngInject */ () => {
  const directiveDefinitionObject = {
    restrict: 'E',
    template
  }
  return directiveDefinitionObject
}

export default angular
  .module(directiveName, [])
  .directive(directiveName, creditCardCvv)
