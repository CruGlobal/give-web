import angular from 'angular';
import template from './redirectGiftStep1.tpl.html';
import find from 'lodash/find';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';

const componentName = 'redirectGiftStep1';

class RedirectGiftStep1Controller {
  /* @ngInject */
  constructor() {
    this.find = find;
  }

  selectGift() {
    this.onSelectGift({ gift: find(this.gifts, { _selectedGift: true }) });
  }

  giftSelected(gift) {
    // required for selectable="radio", deselect previous gift
    angular.forEach(this.gifts, (item) => {
      if (gift !== item) {
        item._selectedGift = false;
      }
    });
  }
}

export default angular
  .module(componentName, [giftListItem.name])
  .component(componentName, {
    controller: RedirectGiftStep1Controller,
    templateUrl: template,
    bindings: {
      gifts: '<',
      onSelectGift: '&',
      cancel: '&',
      previous: '&',
      setLoading: '&',
    },
  });
