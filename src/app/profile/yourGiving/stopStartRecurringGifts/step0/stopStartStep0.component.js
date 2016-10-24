import angular from 'angular';
import template from './stopStartStep0.tpl';

let componentName = 'stopStartStep0';

class StopStartStep0Controller {

  /* @ngInject */
  constructor() {
  }
}

export default angular
  .module( componentName, [
    template.name
  ] )
  .component( componentName, {
    controller:  StopStartStep0Controller,
    templateUrl: template.name,
    bindings:    {
      giftAction:  '<',
      changeState: '&',
      cancel:      '&'
    }
  } );
