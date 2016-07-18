import angular from 'angular';

import template from './thank-you.tpl';

let componentName = 'checkoutThankYou';

class ThankYouController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: ThankYouController,
    templateUrl: template.name
  });
