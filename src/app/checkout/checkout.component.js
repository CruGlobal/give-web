import angular from 'angular';
import 'angular-ui-router';

import individualContactForm from './individual-contact-form/individual-contact-form.component';
import organizationContactForm from './organization-contact-form/organization-contact-form.component';
import cartSummary from './cart-summary/cart-summary.component';

import template from './checkout.tpl';
import './checkout.css!';

let componentName = 'checkout';

class CheckoutController{

  /* @ngInject */
  constructor(){
    this.contactType = 'individual';
  }

}

/* @ngInject */
function ConfigureModule($stateProvider){
  $stateProvider.state('checkout', {
    url: '/checkout',
    template: '<checkout></checkout>'
  });
}

export default angular
  .module(componentName, [
    'ui.router',
    template.name,
    cartSummary.name,
    individualContactForm.name,
    organizationContactForm.name
  ])
  .config(ConfigureModule)
  .component(componentName, {
    controller: CheckoutController,
    templateUrl: template.name
  });
