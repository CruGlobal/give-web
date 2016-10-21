import angular from 'angular';
import template from './stopGiftStep1.tpl';
import find from 'lodash/find';
import filter from 'lodash/filter';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftSimpleView from 'common/components/giftViews/giftSimpleView/giftSimpleView.component';

let componentName = 'stopGiftStep1';

class StopGiftStep1Controller {

  /* @ngInject */
  constructor(  ) {
    this.find = find;
  }

  selectGifts() {
    this.onSelectGifts( {selectedGifts: filter( this.gifts, {_selectedGift: true} )} );
  }

  // giftSelected( gift ) {
  //   // required for selectable="radio", deselect previous gift
  //   angular.forEach( this.gifts, ( item ) => {
  //     if ( gift !== item ) {
  //       item._selectedGift = false;
  //     }
  //   } );
  // }
}

export default angular
  .module( componentName, [
    template.name,
    giftListItem.name,
    giftSimpleView.name
  ] )
  .component( componentName, {
      controller:  StopGiftStep1Controller,
      templateUrl: template.name,
      bindings:    {
        gifts:         '<',
        onSelectGifts: '&',
        cancel:        '&',
        previous:      '&',
        setLoading:    '&'
      }
    }
  )
;
