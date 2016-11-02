import angular from 'angular';
import template from './configureGifts.tpl';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftUpdateView from 'common/components/giftViews/giftUpdateView/giftUpdateView.component';

let componentName = 'configureGifts';

class ConfigureGiftsController {

  /* @ngInject */
  constructor() {
  }
}

export default angular
  .module( componentName, [
    template.name,
    giftListItem.name,
    giftUpdateView.name
  ] )
  .component( componentName, {
    controller:  ConfigureGiftsController,
    templateUrl: template.name,
    bindings:    {
      gifts:    '<',
      cancel:   '&',
      previous: '&',
      next:     '&'
    }
  } );
