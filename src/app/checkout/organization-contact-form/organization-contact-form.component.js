import angular from 'angular';

import template from './organization-contact-form.tpl';

class OrganizationContactFormController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module('checkoutOrganizationContactForm', [
    template.name
  ])
  .component('checkoutOrganizationContactForm', {
    controller: OrganizationContactFormController,
    templateUrl: template.name
  });
