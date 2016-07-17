import angular from 'angular';

import template from './primary-nav.tpl';
//import './primary-nav.css!';

let componentName = 'primaryNav';

class PrimaryNavController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: PrimaryNavController,
    templateUrl: template.name
  });
