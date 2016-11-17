import angular from 'angular';
import filter from 'lodash/filter';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';

import template from './selectRecentRecipients.tpl';

let componentName = 'step1SelectRecentRecipients';

class SelectRecentRecipientsController {

  /* @ngInject */
  constructor() {

  }

  gatherSelections(search){
    this.next({ selectedRecipients: filter(this.recentRecipients, {_selectedGift: true}), search: search });
  }
}

export default angular
  .module(componentName, [
    template.name,
    giftListItem.name
  ])
  .component(componentName, {
    controller: SelectRecentRecipientsController,
    templateUrl: template.name,
    bindings: {
      recentRecipients: '<',
      dismiss: '&',
      next: '&'
    }
  });
