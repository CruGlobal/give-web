import angular from 'angular';

import template from './display-address.tpl';

let componentName = 'displayAddress';

class DisplayAddressController {

  /* @ngInject */
  constructor() {

  }
}

export default angular
  .module( componentName, [
    template.name
  ] )
  .component( componentName, {
    controller:  DisplayAddressController,
    templateUrl: template.name,
    bindings:    {
      address: '<'
    }
  } );
