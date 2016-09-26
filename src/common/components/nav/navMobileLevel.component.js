import angular from 'angular';

import template from './mobileNavLevel.tpl';

let componentName = 'navMobileLevel';

class NavController{

  /* @ngInject */
  constructor(){

  }
}

export default angular
  .module(componentName, [
  ])
  .component(componentName, {
    controller: NavController,
    templateUrl: template.name
  });
