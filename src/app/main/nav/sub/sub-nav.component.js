import angular from 'angular';

import template from './sub-nav.tpl';
//import './sub-nav.css!';

let componentName = 'subNav';

class SubNavController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: SubNavController,
    templateUrl: template.name
  });
