import angular from 'angular';

import template from './individual-contact-form.tpl';

class IndividualContactFormController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module('checkoutIndividualContactForm', [
    template.name
  ])
  .component('checkoutIndividualContactForm', {
    controller: IndividualContactFormController,
    templateUrl: template.name
  });
