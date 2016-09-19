import angular from 'angular';

import contactInfoComponent from 'common/components/contactInfo/contactInfo.component';

import template from './step-1.tpl';

let componentName = 'checkoutStep1';

class Step1Controller{

  /* @ngInject */
  constructor($window){
    this.$window = $window;
  }

  onSubmit(success){
    if(success){
      this.changeStep({newStep: 'payment'});
    }else{
      this.submitted = false;
      this.$window.scrollTo(0, 0);
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    contactInfoComponent.name
  ])
  .component(componentName, {
    controller: Step1Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&'
    }
  });
