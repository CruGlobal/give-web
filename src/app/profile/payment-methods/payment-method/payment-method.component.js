import angular from 'angular';
import template from './payment-method.tpl';

class PaymentMethodController{

  /* @ngInject */
  constructor(envService){
    this.isCollapsed = true;
    this.imgDomain = envService.read('imgDomain');
  }

  getExpiration(){
    return `${this.model['expiry-month']}/${this.model['expiry-year']}`;
  }

  getLastFourDigits(){
    console.log(this.model)
    return this.model['card-number'] || this.model['display-account-number'];
  }

  getPaymentNickName(){
    return this.model['card-type'] || this.model['bank-name'];
  }

  getImage(){
    this.model['card-type'] = 'American Express'
    return this.model['bank-name']
      ? 'icon-bank'
      : 'cc-icons/' + this.model['card-type'].replace(' ','-').toLowerCase() + '-curved-128px';
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
