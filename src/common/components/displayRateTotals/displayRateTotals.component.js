import angular from 'angular';

import template from './displayRateTotals.tpl';

let componentName = 'displayRateTotals';

class DisplayRateTotalsController {

  /* @ngInject */
  constructor() {

  }
}

export default angular
  .module( componentName, [
    template.name
  ] )
  .component( componentName, {
    controller:  DisplayRateTotalsController,
    templateUrl: template.name,
    bindings:    {
      rateTotals: '<'
    }
  } );
