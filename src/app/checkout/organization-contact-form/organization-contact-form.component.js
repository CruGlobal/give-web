import angular from 'angular';

import template from './organization-contact-form.tpl';

let componentName = 'checkoutOrganizationContactForm';

class OrganizationContactFormController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: OrganizationContactFormController,
    templateUrl: template.name
  });
