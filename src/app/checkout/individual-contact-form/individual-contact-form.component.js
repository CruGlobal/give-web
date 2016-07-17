import angular from 'angular';

import individualContactFormTemplate from './individual-contact-form.tpl';

class IndividualContactFormController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module('checkoutIndividualContactForm', [
    individualContactFormTemplate.name
  ])
  .component('checkoutIndividualContactForm', {
    controller: IndividualContactFormController,
    templateUrl: individualContactFormTemplate.name
  });
