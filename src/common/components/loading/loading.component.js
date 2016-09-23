import angular from 'angular';

import template from './loading.tpl.js';

let componentName = 'loading';

class LoadingController{

  /* @ngInject */
  constructor(){
    this.inline = false;
  }
}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: LoadingController,
    templateUrl: template.name,
    bindings: {
      inline: '@'
    }
  });
