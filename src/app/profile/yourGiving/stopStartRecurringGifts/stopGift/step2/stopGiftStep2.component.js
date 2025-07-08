import angular from 'angular';
import template from './stopGiftStep2.tpl.html';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftSummaryView from 'common/components/giftViews/giftDetailsView/giftDetailsView.component';

const componentName = 'stopGiftStep2';

class StopGiftStep2Controller {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}
}

export default angular
  .module(componentName, [giftListItem.name, giftSummaryView.name])
  .component(componentName, {
    controller: StopGiftStep2Controller,
    templateUrl: template,
    bindings: {
      gifts: '<',
      onConfirm: '&',
      cancel: '&',
      previous: '&',
    },
  });
