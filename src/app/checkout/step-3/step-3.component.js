import angular from 'angular';

import template from './step-3.tpl';

let componentName = 'checkoutStep3';

class Step3Controller{

  /* @ngInject */
  constructor(){
    //this.changeStep({newStep: 'payment'}); TODO: put this on a go back action somewhere
  }

}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: Step3Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&'
    }
  });
