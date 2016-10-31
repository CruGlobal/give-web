import angular from 'angular';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftUpdateView from 'common/components/giftViews/giftUpdateView/giftUpdateView.component';

import template from './configureRecentRecipients.tpl';

let componentName = 'step3ConfigureRecentRecipients';

class ConfigureRecentRecipientsController {

  /* @ngInject */
  constructor() {

  }
}

export default angular
  .module(componentName, [
    template.name,
    giftListItem.name,
    giftUpdateView.name
  ])
  .component(componentName, {
    controller: ConfigureRecentRecipientsController,
    templateUrl: template.name,
    bindings: {
      additions: '<',
      dismiss: '&',
      previous: '&',
      next: '&'
    }
  });
