import angular from 'angular';

import individualContactForm from './individual-contact-form/individual-contact-form.component';
import organizationContactForm from './organization-contact-form/organization-contact-form.component';
import cartSummary from '../cart-summary/cart-summary.component';

import template from './step-1.tpl';

let componentName = 'checkoutStep1';

class Step1Controller{

  /* @ngInject */
  constructor(){
    this.contactType = 'individual';
  }

}

export default angular
  .module(componentName, [
    template.name,
    cartSummary.name,
    individualContactForm.name,
    organizationContactForm.name
  ])
  .component(componentName, {
    controller: Step1Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&'
    }
  });
