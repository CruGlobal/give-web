import angular from 'angular';
import template from './suspendedGifts.tpl.html';
import filter from 'lodash/filter';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';

const componentName = 'suspendedGifts';

class SuspendedGiftsController {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}

  selectGifts() {
    this.next({ selected: filter(this.gifts, { _selectedGift: true }) });
  }
}

export default angular
  .module(componentName, [giftListItem.name])
  .component(componentName, {
    controller: SuspendedGiftsController,
    templateUrl: template,
    bindings: {
      gifts: '<',
      cancel: '&',
      previous: '&',
      next: '&',
    },
  });
