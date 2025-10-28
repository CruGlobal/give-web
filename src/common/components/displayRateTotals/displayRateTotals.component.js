import angular from 'angular';

import coverFeesFilter from 'common/filters/coverFees.filter';

import template from './displayRateTotals.tpl.html';

const componentName = 'displayRateTotals';

class DisplayRateTotalsController {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}

  rateTotalsComparator(freq1, freq2) {
    const order = {
      Single: 1,
      Monthly: 2,
      Quarterly: 3,
      Annually: 4,
    };
    return order[freq1.value] < order[freq2.value] ? -1 : 1;
  }
}

export default angular
  .module(componentName, [coverFeesFilter.name])
  .component(componentName, {
    controller: DisplayRateTotalsController,
    templateUrl: template,
    bindings: {
      rateTotals: '<',
    },
  });
