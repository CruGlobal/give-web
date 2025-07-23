import angular from 'angular';
import filter from 'lodash/filter';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';

import template from './addRecentRecipients.tpl.html';

const componentName = 'step2AddRecentRecipients';

class AddRecentRecipientsController {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}

  $onInit() {
    if (this.loadedNoRecentRecipients()) {
      this.next();
    }
  }

  loadedNoRecentRecipients() {
    return !this.loadingRecentRecipients && !this.hasRecentRecipients;
  }

  gatherSelections() {
    this.next({
      additions: filter(this.recentRecipients, { _selectedGift: true }),
    });
  }
}

export default angular
  .module(componentName, [giftListItem.name])
  .component(componentName, {
    controller: AddRecentRecipientsController,
    templateUrl: template,
    bindings: {
      recentRecipients: '<',
      hasRecentRecipients: '<',
      loadingRecentRecipients: '<',
      hasRecurringGiftChanges: '<',
      dismiss: '&',
      previous: '&',
      next: '&',
    },
  });
