import angular from 'angular';
import template from './gift.tpl';

let componentName = 'gift';

class GiftController{

  /* @ngInject */
  constructor(){
    this.isCollapsed = true;
  }

}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: GiftController,
    templateUrl: template.name,
    bindings: {
      model: '<'
    }
  });
