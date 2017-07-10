import angular from 'angular';
import template from './suspendedGifts.tpl.html';
import filter from 'lodash/filter';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';

let componentName = 'suspendedGifts';

class SuspendedGiftsController {

  /* @ngInject */
  constructor() {
  }

  selectGifts() {
    this.next( {selected: filter( this.gifts, {_selectedGift: true} )} );
  }
}

export default angular
  .module( componentName, [
    giftListItem.name
  ] )
  .component( componentName, {
    controller:  SuspendedGiftsController,
    template: template,
    bindings:    {
      gifts:    '<',
      cancel:   '&',
      previous: '&',
      next:     '&'
    }
  } );
