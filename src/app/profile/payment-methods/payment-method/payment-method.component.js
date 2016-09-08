import angular from 'angular';
import template from './payment-method.tpl';

class PaymentMethodController{

  /* @ngInject */
  constructor(){
    this.isCollapsed = true;
  }

  getExpiration() {
    return `${this.model.expiry_month}/${this.model.expiry_year}`;
  }

  getLastFourDigits(){
    let cardNumber = this.model.card_number;
    return cardNumber.substr(cardNumber.length-4,this.model.card_number.length-1);
  }
}

let componentName = 'paymentMethod';

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: PaymentMethodController,
    templateUrl: template.name,
    bindings: {
      model: '<',
      index: '<'
    }
  });
