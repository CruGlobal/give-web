import angular from 'angular';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftUpdateView from 'common/components/giftViews/giftUpdateView/giftUpdateView.component';

import template from './configureRecentRecipients.tpl.html';

let componentName = 'step3ConfigureRecentRecipients';

class ConfigureRecentRecipientsController {

  /* @ngInject */
  constructor() {

  }
}

export default angular
  .module(componentName, [
    giftListItem.name,
    giftUpdateView.name
  ])
  .component(componentName, {
    controller: ConfigureRecentRecipientsController,
    templateUrl: template,
    bindings: {
      additions: '<',
      dismiss: '&',
      previous: '&',
      next: '&'
    }
  });
