import angular from 'angular';
import template from './configureGifts.tpl.html';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftUpdateView from 'common/components/giftViews/giftUpdateView/giftUpdateView.component';

const componentName = 'configureGifts';

class ConfigureGiftsController {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}
}

export default angular
  .module(componentName, [giftListItem.name, giftUpdateView.name])
  .component(componentName, {
    controller: ConfigureGiftsController,
    templateUrl: template,
    bindings: {
      gifts: '<',
      cancel: '&',
      previous: '&',
      next: '&',
    },
  });
