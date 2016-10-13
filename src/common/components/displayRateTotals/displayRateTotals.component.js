import angular from 'angular';

import template from './displayRateTotals.tpl';

let componentName = 'displayRateTotals';

class DisplayRateTotalsController {

  /* @ngInject */
  constructor() {

  }

  rateTotalsComparator(freq1, freq2){
    let order = {
      Single: 1,
      Monthly: 2,
      Quarterly: 3,
      Annually: 4
    };
    return order[freq1.value] < order[freq2.value] ? -1 : 1;
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
