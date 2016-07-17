import angular from 'angular';

import template from './individual-contact-form.tpl';

let componentName = 'checkoutIndividualContactForm';

class IndividualContactFormController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: IndividualContactFormController,
    templateUrl: template.name
  });
