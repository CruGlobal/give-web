import angular from 'angular';

import organizationContactFormTemplate from './organization-contact-form.tpl';

class OrganizationContactFormController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module('checkoutOrganizationContactForm', [
    organizationContactFormTemplate.name
  ])
  .component('checkoutOrganizationContactForm', {
    controller: OrganizationContactFormController,
    templateUrl: organizationContactFormTemplate.name
  });
