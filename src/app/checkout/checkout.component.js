import angular from 'angular';
import 'angular-ui-router';

import individualContactForm from './individual-contact-form/individual-contact-form.component';
import organizationContactForm from './organization-contact-form/organization-contact-form.component';
import cartSummary from './cart-summary/cart-summary.component';

import checkoutTemplate from './checkout.tpl';
import './checkout.css!';

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
  .module('checkout', [
    'ui.router',
    checkoutTemplate.name,
    cartSummary.name,
    individualContactForm.name,
    organizationContactForm.name
  ])
  .config(ConfigureModule)
  .component('checkout', {
    controller: CheckoutController,
    templateUrl: checkoutTemplate.name
  });
