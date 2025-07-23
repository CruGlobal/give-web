import angular from 'angular';
import filter from 'lodash/filter';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';

import template from './selectRecentRecipients.tpl.html';

const componentName = 'step1SelectRecentRecipients';

class SelectRecentRecipientsController {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}

  gatherSelections(search) {
    this.next({
      selectedRecipients: filter(this.recentRecipients, {
        _selectedGift: true,
      }),
      search: search,
    });
  }
}

export default angular
  .module(componentName, [giftListItem.name])
  .component(componentName, {
    controller: SelectRecentRecipientsController,
    templateUrl: template,
    bindings: {
      recentRecipients: '<',
      dismiss: '&',
      next: '&',
    },
  });
