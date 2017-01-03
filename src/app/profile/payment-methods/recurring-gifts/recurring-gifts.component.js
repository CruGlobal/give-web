import angular from 'angular';
import template from './recurring-gifts.tpl';

class recurringGiftsController{

  /* @ngInject */
  constructor(){

  }

}

let componentName = 'recurringGifts';

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: recurringGiftsController,
    templateUrl: template.name,
    bindings: {
      gifts: '<'
    }
  });
