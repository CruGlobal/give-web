import angular from 'angular';

import template from './loading.tpl.js';

let componentName = 'loading';

class LoadingController{

  /* @ngInject */
  constructor(){

  }
}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: LoadingController,
    templateUrl: template.name
  });
